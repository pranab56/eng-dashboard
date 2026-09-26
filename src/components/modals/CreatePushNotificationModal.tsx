/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useCreatePushNotificationMutation } from "@/features/pushNotification/pushNotificationApi";
import { useGetUserQuery } from "@/features/userManagement/userApi";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Send,
  Users,
  User,
  Check,
  ChevronsUpDown,
  Search,
  X,
  Loader2,
  Globe,
  FileText,
  Briefcase,
} from "lucide-react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import CustomTimePicker from "@/components/ui/CustomTimePicker";
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
  // Delivery Mode: "IMMEDIATE" vs "SCHEDULED"
  const [deliveryMode, setDeliveryMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");

  // Target audience: "ALL" | "PLAYER" | "MANAGER" | "REFEREE" | "SINGLE"
  const [audienceType, setAudienceType] = useState<"ALL" | "PLAYER" | "MANAGER" | "REFEREE" | "SINGLE">("ALL");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email?: string } | null>(null);

  // Initialize default scheduled date/time (today/next hour UK time) when switching to SCHEDULED
  useEffect(() => {
    if (deliveryMode === "SCHEDULED" && !scheduledDate) {
      const nowUk = dayjs().tz("Europe/London");
      setScheduledDate(nowUk.format("YYYY-MM-DD"));
      setScheduledTime(nowUk.add(1, "hour").minute(0).format("HH:mm"));
    }
  }, [deliveryMode, scheduledDate]);

  // User dropdown states
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // UK Time clock metadata
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

  // Fetch users for specific user selection
  const { data: usersData, isLoading: isUsersLoading } = useGetUserQuery(
    { page: 1, limit: 300 },
    { skip: audienceType !== "SINGLE" }
  );

  const filteredUsers = useMemo(() => {
    const rawUsers = usersData?.data?.result || usersData?.data || [];
    if (!userSearchTerm.trim()) return rawUsers;
    const term = userSearchTerm.toLowerCase();
    return rawUsers.filter((u: any) => {
      const name = (u.userName || `${u.firstName || ""} ${u.lastName || ""}`).toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [usersData, userSearchTerm]);

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
      toast.error("Please select a recipient user");
      return;
    }

    const payload: any = {
      title: title.trim(),
      message: message.trim(),
      user: audienceType === "SINGLE" ? selectedUser?.id : null,
      targetRole: audienceType !== "SINGLE" ? audienceType : "ALL",
    };

    if (deliveryMode === "SCHEDULED") {
      if (!scheduledDate || !scheduledTime) {
        toast.error("Please select both scheduled date and time");
        return;
      }

      const scheduledUk = dayjs.tz(`${scheduledDate}T${scheduledTime}`, "Europe/London");
      const nowUk = dayjs().tz("Europe/London");

      if (!scheduledUk.isValid()) {
        toast.error("Invalid scheduled date or time");
        return;
      }

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
      toast.success(res?.message || (deliveryMode === "SCHEDULED" ? "Notification scheduled successfully" : "Notification sent successfully"));

      // Reset
      setTitle("");
      setMessage("");
      setScheduledDate("");
      setScheduledTime("");
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
        className="sm:max-w-lg w-full bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-lg text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Create Push Notification
              </DialogTitle>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Broadcast announcements immediately or schedule targeted delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[72vh] bg-white">
          {/* Delivery Schedule Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Delivery Schedule
            </label>
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-md border border-slate-200">
              <button
                type="button"
                onClick={() => setDeliveryMode("IMMEDIATE")}
                className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
                  deliveryMode === "IMMEDIATE"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Send Immediately</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryMode("SCHEDULED")}
                className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all cursor-pointer ${
                  deliveryMode === "SCHEDULED"
                    ? "bg-white text-slate-900 shadow-2xs border border-slate-200/80 font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Schedule for Later</span>
              </button>
            </div>
          </div>

          {/* Scheduling Controls */}
          {deliveryMode === "SCHEDULED" && (
            <div className="space-y-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-slate-200/60">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  Timezone: Europe/London (GMT/BST)
                </span>
                <span className="font-mono text-slate-500">
                  Current: {currentUkTime || "Loading..."}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CustomDatePicker
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={setScheduledDate}
                  placeholder="Select Date"
                  align="left"
                />
                <CustomTimePicker
                  label="Scheduled Time (UK)"
                  value={scheduledTime}
                  onChange={setScheduledTime}
                  placeholder="Select Time"
                  align="right"
                />
              </div>

              {scheduledDate && scheduledTime && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 flex items-center justify-between text-[11px] text-amber-900">
                  <span className="font-medium text-amber-800">Scheduled for:</span>
                  <span className="font-bold text-amber-950">
                    {dayjs.tz(`${scheduledDate}T${scheduledTime}`, "Europe/London").isValid()
                      ? dayjs.tz(`${scheduledDate}T${scheduledTime}`, "Europe/London").format("ddd, DD MMM YYYY [at] HH:mm") + " (UK Time, 24h)"
                      : `${scheduledDate} ${scheduledTime}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Target Audience Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Target Audience
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 bg-slate-100 rounded-md border border-slate-200 text-xs">
              {[
                { id: "ALL", label: "All Users", icon: Users },
                { id: "PLAYER", label: "Players / Parents", icon: User },
                { id: "MANAGER", label: "Managers", icon: Briefcase },
                { id: "REFEREE", label: "Referees", icon: FileText },
                { id: "SINGLE", label: "Specific User", icon: User },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setAudienceType(id as any)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs transition-all cursor-pointer ${
                    audienceType === id
                      ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Specific User Dropdown */}
          {audienceType === "SINGLE" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Recipient User <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-full h-9 flex items-center justify-between px-3 bg-white border border-slate-300 rounded-md text-xs text-left cursor-pointer hover:border-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                >
                  <span className="truncate">
                    {selectedUser ? (
                      <span className="text-slate-900 font-medium">
                        {selectedUser.name} {selectedUser.email ? `(${selectedUser.email})` : ""}
                      </span>
                    ) : (
                      <span className="text-slate-400">Select user...</span>
                    )}
                  </span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-md shadow-lg overflow-hidden max-h-52 flex flex-col">
                    <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                      <input
                        type="text"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        placeholder="Search name or email..."
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
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded transition-colors cursor-pointer text-left ${
                                isSelected ? "bg-slate-900 text-white font-medium" : "text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <div className="flex flex-col min-w-0 pr-2">
                                <span className="font-medium truncate">{name}</span>
                                <span className={isSelected ? "text-slate-300 text-[10px]" : "text-slate-500 text-[10px]"}>
                                  {u.parentId ? "Child Player (routes to parent device)" : (u.email || "Parent Account")}
                                </span>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Child players do not maintain independent sessions. Push notifications to a child player will be delivered to their parent&apos;s registered device.
              </p>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Notification Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{title.length}/60</span>
            </div>
            <input
              type="text"
              required
              maxLength={60}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Schedule update for upcoming match"
              className="w-full h-9 bg-white border border-slate-300 rounded-md px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-mono text-slate-400">{message.length}/300</span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter push notification message content..."
              className="w-full bg-white border border-slate-300 rounded-md p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none transition-colors"
            />
          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !message.trim()}
              className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : deliveryMode === "SCHEDULED" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{deliveryMode === "SCHEDULED" ? "Schedule Notification" : "Send Notification"}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
