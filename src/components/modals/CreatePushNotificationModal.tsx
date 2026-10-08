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
  Briefcase,
  Smartphone,
  Wifi,
  Battery,
  Wrench,
  RefreshCw,
  AlertTriangle,
  Trophy,
  Bell,
  Sparkles,
  Lock,
  Zap,
  Camera,
} from "lucide-react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import CustomTimePicker from "@/components/ui/CustomTimePicker";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

interface CreatePushNotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const TEMPLATES = [
  {
    label: "System Maintenance",
    icon: Wrench,
    title: "Scheduled System Maintenance Notice",
    message: "Platform maintenance is scheduled tonight from 02:00 to 03:00 UTC. The app may experience brief interruptions during this period.",
  },
  {
    label: "App Update Available",
    icon: RefreshCw,
    title: "New App Update Available (v2.4)",
    message: "A new version with faster live match tracking, improved player statistics, and performance fixes is now available. Please update your app.",
  },
  {
    label: "Critical App Update",
    icon: AlertTriangle,
    title: "Critical App Update Required",
    message: "An essential update has been released to ensure system security and smooth performance. Please update your app from the store.",
  },
  {
    label: "Match Day Notice",
    icon: Trophy,
    title: "Upcoming Match Schedule Reminder",
    message: "Please review your team lineup and fixture schedule for today's upcoming matches. Good luck to all participating teams!",
  },
  {
    label: "League Announcement",
    icon: Bell,
    title: "Important League Announcement",
    message: "New tournament fixtures, team rosters, and league table standings have been updated. Open the app to view full details.",
  },
  {
    label: "Special Promotion",
    icon: Sparkles,
    title: "Special Weekend Event & Coin Rewards",
    message: "Earn bonus coins and exclusive rewards for active participation this weekend. Check the app for complete event guidelines.",
  },
];

export default function CreatePushNotificationModal({
  isOpen,
  setIsOpen,
}: CreatePushNotificationModalProps) {
  // Delivery Mode: "IMMEDIATE" vs "SCHEDULED"
  const [deliveryMode, setDeliveryMode] = useState<"IMMEDIATE" | "SCHEDULED">("IMMEDIATE");

  // Target audience: "ALL" | "PLAYER" | "MANAGER" | "REFEREE" | "SINGLE"
  const [audienceType, setAudienceType] = useState<"ALL" | "PLAYER" | "MANAGER" | "REFEREE" | "SINGLE">("ALL");
  const [category, setCategory] = useState<"GENERAL_NEWS" | "TRANSFERS_GOSSIP" | "PLAYER_OF_THE_WEEK" | "MATCH_UPDATE">("GENERAL_NEWS");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; email?: string } | null>(null);

  // Preview Mode: "LOCK_SCREEN" vs "BANNER"
  const [previewMode, setPreviewMode] = useState<"LOCK_SCREEN" | "BANNER">("LOCK_SCREEN");

  // Initialize default scheduled date/time (today / next 15 mins UK time) when switching to SCHEDULED
  useEffect(() => {
    if (deliveryMode === "SCHEDULED" && !scheduledDate) {
      const nowUk = dayjs().tz("Europe/London");
      setScheduledDate(nowUk.format("YYYY-MM-DD"));
      setScheduledTime(nowUk.add(15, "minute").format("HH:mm"));
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

  // Check if scheduled time is valid future
  const isScheduledValid = useMemo(() => {
    if (deliveryMode !== "SCHEDULED") return true;
    if (!scheduledDate || !scheduledTime) return false;
    const scheduledUk = dayjs.tz(`${scheduledDate}T${scheduledTime}`, "Europe/London");
    const nowUk = dayjs().tz("Europe/London");
    return scheduledUk.isValid() && scheduledUk.diff(nowUk, "seconds") >= 10;
  }, [deliveryMode, scheduledDate, scheduledTime]);

  const applyTemplate = (tpl: { title: string; message: string }) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
  };

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
        toast.error(
          `Scheduled time must be at least 10 seconds in the future (UK Time). Current UK Time: ${nowUk.format("HH:mm:ss")}.`
        );
        return;
      }

      payload.isScheduled = true;
      payload.scheduledAt = scheduledUk.toISOString();
      payload.scheduledAtUK = scheduledUk.format("YYYY-MM-DD HH:mm:ss");
    } else {
      payload.isScheduled = false;
    }

    try {
      const res = await createPushNotification(payload).unwrap();
      toast.success(
        res?.message ||
          (deliveryMode === "SCHEDULED"
            ? "Notification scheduled successfully"
            : "Notification sent successfully")
      );

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
        className="sm:max-w-5xl w-full bg-white rounded-xl p-0 overflow-hidden border border-slate-200 shadow-2xl text-slate-800 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Create Push Notification Broadcast
              </DialogTitle>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                FCM Push Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compose, preview, and dispatch mobile push notifications across league segments.
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

        {/* Form Body - 2 Columns */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 bg-white slim-scroll">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (7 cols): Controls & Inputs */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Delivery Schedule Segmented Control */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 p-3 bg-slate-50/80 rounded-xl border border-slate-200">
                <div>
                  <span className="block text-xs font-semibold text-slate-800">
                    Delivery Schedule
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Choose delivery timing for this notification
                  </span>
                </div>
                <div className="inline-flex p-1 bg-slate-200/60 rounded-xl border border-slate-200/80 shrink-0 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode("IMMEDIATE")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      deliveryMode === "IMMEDIATE"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Send className={`w-3.5 h-3.5 ${deliveryMode === "IMMEDIATE" ? "text-amber-600" : "text-slate-400"}`} />
                    <span>Send Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryMode("SCHEDULED")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      deliveryMode === "SCHEDULED"
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Clock className={`w-3.5 h-3.5 ${deliveryMode === "SCHEDULED" ? "text-amber-600" : "text-slate-400"}`} />
                    <span>Schedule</span>
                  </button>
                </div>
              </div>

              {/* Scheduled Date/Time Pickers (Conditional) */}
              {deliveryMode === "SCHEDULED" && (
                <div className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Configure Delivery Date & Time (UK Timezone)
                    </span>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200">
                      Now: {currentUkTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 block">
                        Schedule Date <span className="text-rose-500">*</span>
                      </label>
                      <CustomDatePicker
                        value={scheduledDate}
                        onChange={(val) => setScheduledDate(val)}
                        placeholder="Select schedule date"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-slate-700 block">
                        Schedule Time <span className="text-rose-500">*</span>
                      </label>
                      <CustomTimePicker
                        value={scheduledTime}
                        onChange={(val) => setScheduledTime(val)}
                        placeholder="Select schedule time"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  Notification Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {[
                    { id: "GENERAL_NEWS", label: "General News", icon: "📰" },
                    { id: "TRANSFERS_GOSSIP", label: "Transfers", icon: "⇄" },
                    { id: "PLAYER_OF_THE_WEEK", label: "Player Awards", icon: "🏆" },
                    { id: "MATCH_UPDATE", label: "Match Updates", icon: "🎯" },
                  ].map((cat) => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Audience Segmented Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-800 block">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  {[
                    { id: "ALL", label: "All Users", icon: Globe },
                    { id: "PLAYER", label: "Players", icon: Users },
                    { id: "MANAGER", label: "Managers", icon: Briefcase },
                    { id: "REFEREE", label: "Referees", icon: User },
                    { id: "SINGLE", label: "Specific", icon: User },
                  ].map((t) => {
                    const isSelected = audienceType === t.id;
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setAudienceType(t.id as any);
                          if (t.id !== "SINGLE") {
                            setSelectedUser(null);
                            setUserSearchTerm("");
                          }
                        }}
                        className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-white text-slate-900 shadow-xs border border-slate-200 font-bold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                        }`}
                      >
                        <IconComp className={`w-3 h-3 ${isSelected ? "text-amber-600" : "text-slate-400"}`} />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Single User Dropdown (Conditional) */}
              {audienceType === "SINGLE" && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative">
                  <label className="text-xs font-semibold text-slate-800 block">
                    Select Target Recipient <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="w-full h-9 flex items-center justify-between px-3 bg-white border border-slate-300 rounded-lg text-xs text-left cursor-pointer hover:border-slate-400 focus:outline-hidden"
                    >
                      <span className="truncate">
                        {selectedUser ? (
                          <span className="text-slate-900 font-semibold">
                            {selectedUser.name} {selectedUser.email ? `(${selectedUser.email})` : ""}
                          </span>
                        ) : (
                          <span className="text-slate-400">Search & select user...</span>
                        )}
                      </span>
                      <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                    </button>

                    {isUserDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-56 flex flex-col">
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
                        <div className="overflow-y-auto flex-1 p-1 space-y-0.5 slim-scroll">
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
                                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-md transition-colors cursor-pointer text-left ${
                                    isSelected ? "bg-amber-500 text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <div className="flex flex-col min-w-0 pr-2">
                                    <span className="font-medium truncate">{name}</span>
                                    <span className={isSelected ? "text-slate-200 text-[10px]" : "text-slate-500 text-[10px]"}>
                                      {u.parentId ? "Child Player (routes to parent device)" : (u.email || "User Account")}
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
                </div>
              )}

              {/* Title Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Notification Title <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule update for upcoming match"
                  className="w-full h-9 bg-white border border-slate-300 rounded-lg px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors font-medium"
                />
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Message Body <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">{message.length}/500</span>
                </div>
                <textarea
                  required
                  rows={3}
                  maxLength={500}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter push notification message content..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition-colors slim-scroll leading-relaxed"
                />
              </div>

              {/* Redefined Quick Templates */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-700">
                    Quick Templates:
                  </span>
                  <span className="text-[10px] text-slate-400">Click to apply content</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {TEMPLATES.map((t, i) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="text-left p-2 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 text-slate-700 transition-colors flex items-center gap-2 group cursor-pointer"
                      >
                        <div className="w-5 h-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-amber-600 shrink-0">
                          <IconComp className="w-3 h-3" />
                        </div>
                        <span className="text-[11px] font-medium block truncate group-hover:text-slate-900">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Interactive Mobile Phone Mockup Preview (Clean White/Silver Theme) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  Interactive Device Preview
                </span>
                {/* Mode toggle */}
                <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("LOCK_SCREEN")}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      previewMode === "LOCK_SCREEN" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Lock Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("BANNER")}
                    className={`px-2.5 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                      previewMode === "BANNER" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    In-App Banner
                  </button>
                </div>
              </div>

              {/* Smartphone Chassis - Sleek Silver / Clean Aesthetic Bezel */}
              <div className="bg-gradient-to-b from-slate-200 via-slate-100 to-slate-200 rounded-[32px] p-2.5 border border-slate-300/80 shadow-xl shadow-slate-200/60 select-none">
                
                {/* Smartphone Screen - Light Modern Palette */}
                <div className="rounded-[24px] overflow-hidden border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-amber-50/30 relative flex flex-col min-h-[350px]">
                  
                  {/* Status Bar / Dynamic Island */}
                  <div className="flex items-center justify-between px-3.5 pt-2 pb-1.5 text-[11px] font-semibold text-slate-800">
                    <span className="font-sans">09:41</span>
                    {/* Sleek Dynamic Island */}
                    <div className="h-4 w-20 bg-slate-900 rounded-full flex items-center justify-center gap-1.5 px-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-800" />
                    </div>
                    <div className="flex items-center gap-1 text-slate-700">
                      <Wifi className="w-3 h-3" />
                      <Battery className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {previewMode === "LOCK_SCREEN" ? (
                    /* Clean Lock Screen View */
                    <div className="flex-1 flex flex-col justify-between p-3.5 pt-2">
                      
                      {/* Top Clock Section */}
                      <div className="text-center pt-1">
                        <div className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 mb-1 border border-slate-200/60">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 tracking-tight">
                          Monday, September 29
                        </p>
                        <h2 className="text-4xl font-light text-slate-800 tracking-tight font-sans mt-0.5">
                          09:41
                        </h2>
                      </div>

                      {/* Floating Push Notification Card */}
                      <div className="my-auto py-2">
                        <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-md shadow-slate-200/70 border border-slate-200/90 text-left transition-all">
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
                                <Trophy className="w-2.5 h-2.5" />
                              </div>
                              <span className="text-[10px] font-bold tracking-wider text-slate-700 uppercase">
                                ENGLISH LEAGUE
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">now</span>
                          </div>

                          <h5 className="text-xs font-bold text-slate-900 leading-snug">
                            {title.trim() ? title : "Scheduled System Maintenance Notice"}
                          </h5>
                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-3">
                            {message.trim()
                              ? message
                              : "Notification message body will appear here as recipients see it on their mobile lock screen."}
                          </p>
                        </div>
                      </div>

                      {/* Lock Screen Bottom Actions */}
                      <div className="pt-2">
                        <div className="flex items-center justify-between px-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">Swipe up to unlock</span>
                          <div className="w-7 h-7 rounded-full bg-slate-100/90 border border-slate-200 flex items-center justify-center text-slate-500 shadow-xs">
                            <Camera className="w-3.5 h-3.5" />
                          </div>
                        </div>

                        {/* Home Bar Indicator */}
                        <div className="h-1 w-24 bg-slate-300 rounded-full mx-auto mt-2" />
                      </div>

                    </div>
                  ) : (
                    /* Clean In-App Banner View */
                    <div className="flex-1 flex flex-col justify-between p-3 pt-1">
                      
                      {/* Top Drop-down Push Banner */}
                      <div className="w-full bg-white rounded-xl p-3 shadow-lg shadow-slate-200/80 border border-amber-200/80 text-left relative z-10">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded-md bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-xs">
                              <Trophy className="w-2.5 h-2.5" />
                            </div>
                            <span className="text-[10px] font-bold tracking-wider text-slate-800 uppercase">
                              ENGLISH LEAGUE
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">now</span>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 leading-snug">
                          {title.trim() ? title : "New App Update Available (v2.4)"}
                        </h5>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                          {message.trim()
                            ? message
                            : "Tap to view details or dismiss this notification."}
                        </p>

                        <div className="mt-2 pt-1 border-t border-slate-100 flex justify-center">
                          <div className="w-7 h-1 rounded-full bg-slate-200" />
                        </div>
                      </div>

                      {/* Mockup of English League App Screen (Light UI) */}
                      <div className="my-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                          <span>Live Match Center</span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded text-[9px] font-bold">LIVE 68&apos;</span>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800 truncate max-w-[80px]">Chelsea</span>
                          <span className="font-bold text-amber-600 px-2">2 - 1</span>
                          <span className="font-semibold text-slate-800 truncate max-w-[80px]">Arsenal</span>
                        </div>
                      </div>

                      {/* App Bottom Navigation Bar Mockup */}
                      <div>
                        <div className="flex items-center justify-around py-1.5 px-2 bg-white border border-slate-200 rounded-xl shadow-xs text-[10px] text-slate-500 font-medium">
                          <span className="text-amber-600 font-bold">Home</span>
                          <span>Fixtures</span>
                          <span>Coins</span>
                          <span>Profile</span>
                        </div>
                        {/* Home Bar Indicator */}
                        <div className="h-1 w-24 bg-slate-300 rounded-full mx-auto mt-2" />
                      </div>

                    </div>
                  )}

                </div>
              </div>

              {/* Delivery Parameters Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {category === "GENERAL_NEWS" && "📰 General News"}
                    {category === "TRANSFERS_GOSSIP" && "⇄ Transfers Gossip"}
                    {category === "PLAYER_OF_THE_WEEK" && "🏆 Player of the Week"}
                    {category === "MATCH_UPDATE" && "🎯 Match Updates"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Target Segment:</span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {audienceType === "ALL" && "All Registered League Users"}
                    {audienceType === "PLAYER" && "Registered Players"}
                    {audienceType === "MANAGER" && "Team Managers"}
                    {audienceType === "REFEREE" && "Official Referees"}
                    {audienceType === "SINGLE" && (selectedUser ? selectedUser.name : "Single User")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Delivery Timing:</span>
                  <span className="font-medium text-slate-700">
                    {deliveryMode === "IMMEDIATE" ? "Immediate Dispatch" : `Scheduled: ${scheduledDate} ${scheduledTime} UK`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Priority & Engine:</span>
                  <span className="text-emerald-700 font-medium">High (Firebase Cloud Messaging)</span>
                </div>
              </div>

            </div>

          </div>

          {/* Footer Submit Actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              {deliveryMode === "SCHEDULED"
                ? `Will be dispatched automatically at scheduled UK time`
                : `Will be sent immediately to target recipients`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !message.trim() || !isScheduledValid}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm shadow-amber-500/25"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : deliveryMode === "SCHEDULED" ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{deliveryMode === "SCHEDULED" ? "Schedule Push" : "Send Push Now"}</span>
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
