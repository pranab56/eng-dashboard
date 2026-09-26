/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useCreatePushNotificationMutation } from "@/features/pushNotification/pushNotificationApi";
import { useGetUserQuery } from "@/features/userManagement/userApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bell,
  Clock,
  Send,
  Users,
  User,
  Check,
  ChevronsUpDown,
  Search,
  X,
  Loader2,
  Calendar,
  Globe,
  ShieldAlert,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface CreatePushNotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function CreatePushNotificationModal({
  isOpen,
  setIsOpen,
}: CreatePushNotificationModalProps) {
  // Mode: "IMMEDIATE" vs "SCHEDULED"
  const [deliveryMode, setDeliveryMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");

  // Target audience: "ALL" | "PLAYER" | "PARENT" | "REFEREE" | "SINGLE"
  const [audienceType, setAudienceType] = useState<"ALL" | "PLAYER" | "PARENT" | "REFEREE" | "SINGLE">("ALL");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAtTime, setScheduledAtTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email?: string } | null>(null);

  // User combobox states
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Live UK Time clock for admin convenience
  const [currentUkTime, setCurrentUkTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentUkTime(dayjs().tz("Europe/London").format("DD MMM YYYY, HH:mm:ss"));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const [createPushNotification, { isLoading: isSubmitting }] = useCreatePushNotificationMutation();

  // Fetch users for single user combobox
  const { data: usersData, isLoading: isUsersLoading } = useGetUserQuery(
    { page: 1, limit: 300 },
    { skip: audienceType !== "SINGLE" }
  );

  const rawUsers = usersData?.data?.result || usersData?.data || [];

  const filteredUsers = useMemo(() => {
    if (!userSearchTerm.trim()) return rawUsers;
    const term = userSearchTerm.toLowerCase();
    return rawUsers.filter((u: any) => {
      const name = (u.userName || `${u.firstName || ""} ${u.lastName || ""}`).toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [rawUsers, userSearchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a notification title");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message body");
      return;
    }

    if (audienceType === "SINGLE" && !selectedUser) {
      toast.error("Please select a specific recipient user");
      return;
    }

    const payload: any = {
      title: title.trim(),
      message: message.trim(),
      user: audienceType === "SINGLE" ? selectedUser?.id : null,
      targetRole: audienceType !== "SINGLE" ? audienceType : "ALL",
    };

    if (deliveryMode === "SCHEDULED") {
      if (!scheduledAtTime) {
        toast.error("Please select a date and time for scheduled delivery");
        return;
      }

      // Parse user selection in UK Timezone (Europe/London)
      const scheduledUk = dayjs.tz(scheduledAtTime, "Europe/London");
      const nowUk = dayjs().tz("Europe/London");

      if (scheduledUk.diff(nowUk, "seconds") < 10) {
        toast.error("Scheduled time must be at least 10 seconds in the future (UK Time)");
        return;
      }

      payload.isScheduled = true;
      payload.scheduledAt = scheduledUk.toISOString();
    } else {
      payload.isScheduled = false;
    }

    try {
      const res = await createPushNotification(payload).unwrap();
      toast.success(res?.message || (deliveryMode === "SCHEDULED" ? "Notification scheduled!" : "Notification sent!"));

      // Reset Form
      setTitle("");
      setMessage("");
      setScheduledAtTime("");
      setSelectedUser(null);
      setDeliveryMode("IMMEDIATE");
      setAudienceType("ALL");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to process push notification");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col text-slate-800"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Create Push Notification
              </DialogTitle>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                BullMQ Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast announcements immediately or schedule for future delivery
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh] bg-white">
          {/* Delivery Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Delivery Schedule
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setDeliveryMode("IMMEDIATE")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deliveryMode === "IMMEDIATE"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                Send Immediately
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode("SCHEDULED")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  deliveryMode === "SCHEDULED"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Schedule for Later
              </button>
            </div>
          </div>

          {/* Scheduled Date & Time Controls (UK Timezone) */}
          {deliveryMode === "SCHEDULED" && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 animate-in fade-in-50 duration-150">
              {/* UK Timezone Information Banner */}
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-blue-600" />
                  UK Timezone (Europe/London)
                </span>
                <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Current: {currentUkTime || "Loading..."}
                </span>
              </div>

              {/* DateTime Local Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                  Select UK Date & Time <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  required={deliveryMode === "SCHEDULED"}
                  value={scheduledAtTime}
                  onChange={(e) => setScheduledAtTime(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900 transition-colors"
                />
              </div>

              {scheduledAtTime && (
                <div className="text-[11px] text-amber-800 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-lg flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    Will be queued in BullMQ to dispatch at:{" "}
                    <strong>{dayjs.tz(scheduledAtTime, "Europe/London").format("DD MMM YYYY, HH:mm")}</strong> UK Local Time
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Target Audience Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">
              Target Audience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/60 text-xs">
              <button
                type="button"
                onClick={() => setAudienceType("ALL")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  audienceType === "ALL"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📢 All Users
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("PLAYER")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  audienceType === "PLAYER"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ⚽ Players
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("PARENT")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  audienceType === "PARENT"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👨‍👩‍👧 Parents
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("REFEREE")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  audienceType === "REFEREE"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🏁 Referees
              </button>

              <button
                type="button"
                onClick={() => setAudienceType("SINGLE")}
                className={`py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer text-center ${
                  audienceType === "SINGLE"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                👤 Single User
              </button>
            </div>
          </div>

          {/* Specific User Combobox (Only shown if audienceType === 'SINGLE') */}
          {audienceType === "SINGLE" && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-150">
              <label className="text-xs font-semibold text-slate-700">
                Select User Recipient <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-left cursor-pointer hover:border-slate-400 focus:outline-hidden"
                >
                  <span className="truncate">
                    {selectedUser ? (
                      <span className="flex items-center gap-2 text-slate-900 font-semibold">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {selectedUser.name} {selectedUser.email ? `(${selectedUser.email})` : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400">Click to search and select user...</span>
                    )}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Search by name or email..."
                        className="w-full bg-transparent text-xs py-1 text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                      {isUsersLoading ? (
                        <div className="py-3 text-center text-xs text-slate-400">Loading users...</div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="py-3 text-center text-xs text-slate-400">No users found</div>
                      ) : (
                        filteredUsers.map((u: any) => {
                          const name = u.userName || `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User";
                          const isSelected = selectedUser?.id === u._id;
                          return (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => {
                                setSelectedUser({ id: u._id, name, email: u.email });
                                setIsUserDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-slate-900 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <span className="truncate">{name} {u.email ? `(${u.email})` : ""}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Notification Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/60</span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekend Fixtures Announced!"
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 transition-colors"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{message.length}/300</span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter push notification message content..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 resize-none transition-colors"
            />
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : deliveryMode === "SCHEDULED" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {deliveryMode === "SCHEDULED" ? "Schedule Notification" : "Send Immediately"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
