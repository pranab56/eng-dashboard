/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Check,
  User,
  ArrowLeftRight,
  Trophy,
  AlertCircle,
  Inbox,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetAllNotificationsQuery,
  useNotificationUnReadCountQuery,
  useReadAllNotificationMutation,
  useReadSingleNotificationMutation,
} from "@/features/notification/notificationApi";
import { TNotification } from "@/types/columnTypes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");

  // Fetch unread count for badge
  const { data: unreadData } = useNotificationUnReadCountQuery(undefined, {
    pollingInterval: 30000,
  });
  const unreadCount = unreadData?.data?.unreadCount || 0;

  // Fetch recent notifications for dropdown
  const {
    data: notificationRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllNotificationsQuery(
    { page: 1, limit: 15 },
    { skip: !isOpen }
  );

  const [readSingleNotification] = useReadSingleNotificationMutation();
  const [readAllNotification, { isLoading: isMarkingAll }] = useReadAllNotificationMutation();

  const notificationsList: TNotification[] = useMemo(() => {
    return notificationRes?.data || [];
  }, [notificationRes]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notificationsList.filter(
        (item) => item.isRead === false || item.read === false
      );
    }
    return notificationsList;
  }, [notificationsList, activeTab]);

  const handleMarkSingleAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await readSingleNotification(id).unwrap();
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await readAllNotification(undefined).unwrap();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const getCategoryIcon = (item: TNotification) => {
    const title = (item.title || "").toLowerCase();
    const type = (item.type || "").toLowerCase();

    if (
      title.includes("transfer") ||
      type.includes("transfer")
    ) {
      return <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />;
    }
    if (
      title.includes("match") ||
      title.includes("tournament") ||
      title.includes("league") ||
      type.includes("match")
    ) {
      return <Trophy className="w-3.5 h-3.5 text-slate-600" />;
    }
    if (
      title.includes("player") ||
      title.includes("profile") ||
      title.includes("user") ||
      type.includes("user")
    ) {
      return <User className="w-3.5 h-3.5 text-slate-600" />;
    }
    if (
      title.includes("alert") ||
      title.includes("warning") ||
      title.includes("error")
    ) {
      return <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
    }
    return <Bell className="w-3.5 h-3.5 text-slate-600" />;
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, "day") < 1) {
      return d.fromNow();
    }
    return d.format("MMM DD");
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative w-8 h-8 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer focus:outline-none"
          aria-label="System Notifications"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center bg-rose-600 text-white font-bold text-[9px] rounded-full px-1 border-2 border-white tabular-nums">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[380px] p-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50 text-slate-900"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-slate-900">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 tabular-nums">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-3 pt-2 pb-1.5 flex items-center gap-1 border-b border-slate-100 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UNREAD")}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              activeTab === "UNREAD"
                ? "bg-slate-900 text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`text-[10px] px-1 rounded-full ${
                  activeTab === "UNREAD" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Notification List */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 space-y-2.5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-2.5 animate-pulse">
                  <div className="w-7 h-7 rounded bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-1.5 py-0.5">
                    <div className="h-3 bg-slate-100 rounded w-2/5" />
                    <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-10 px-4 text-center">
              <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Inbox className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-800">No notifications</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeTab === "UNREAD"
                  ? "You have no unread notifications."
                  : "No notifications have been received yet."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => {
              const isRead = item.isRead === true || item.read === true;

              return (
                <div
                  key={item._id}
                  className={`group relative p-3 flex items-start gap-2.5 transition-colors cursor-pointer ${
                    isRead ? "bg-white hover:bg-slate-50/80" : "bg-slate-50/50 hover:bg-slate-50"
                  }`}
                  onClick={(e) => !isRead && handleMarkSingleAsRead(e, item._id)}
                >
                  {/* Status Indicator Dot */}
                  <div className="pt-1.5 shrink-0">
                    <span
                      className={`block w-1.5 h-1.5 rounded-full ${
                        isRead ? "bg-transparent" : "bg-blue-600"
                      }`}
                    />
                  </div>

                  {/* Icon */}
                  <div className="w-7 h-7 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0">
                    {getCategoryIcon(item)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-1.5">
                      <p
                        className={`text-xs truncate ${
                          isRead ? "font-normal text-slate-700" : "font-semibold text-slate-900"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {item.message}
                    </p>
                  </div>

                  {/* Single Mark Read Button */}
                  {!isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkSingleAsRead(e, item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all shrink-0 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Link
            href="/my-notification"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center justify-center gap-1 py-1 text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors"
          >
            <span>View all in Notification Center</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
