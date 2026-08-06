/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import {
  useDeleteNotificationMutation,
  useGetAllNotificationsQuery,
  useReadAllNotificationMutation,
  useReadSingleNotificationMutation,
  useSingleDeleteNotificationMutation,
} from "@/features/notification/notificationApi";
import { useHeaders } from "@/hooks/useHeaders";
import { TNotification } from "@/types/columnTypes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Coins,
  Inbox,
  Megaphone,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Trophy,
  User,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

export default function MyNotificationPage() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const { data: notificationRes, isLoading, isFetching } = useGetAllNotificationsQuery(page);

  const [readAllNotification, { isLoading: isMarkingAll }] = useReadAllNotificationMutation();
  const [readSingleNotification] = useReadSingleNotificationMutation();
  const [deleteNotification, { isLoading: isClearingAll }] = useDeleteNotificationMutation();
  const [singleDeleteNotification] = useSingleDeleteNotificationMutation();

  useEffect(() => {
    setHeaders({
      title: "Notifications",
      des: "Review and manage all your personal and system notifications.",
    });
  }, [setHeaders]);

  const notificationsList: TNotification[] = useMemo(() => {
    return notificationRes?.data || [];
  }, [notificationRes]);

  const paginationInfo = notificationRes?.pagination || {
    total: notificationsList.length,
    limit: 10,
    page: Number(page),
    totalPage: 1,
  };

  // Stats calculation
  const unreadCount = useMemo(() => {
    return notificationsList.filter((item) => item.isRead === false || item.read === false).length;
  }, [notificationsList]);

  const readCount = useMemo(() => {
    return notificationsList.filter((item) => item.isRead === true || item.read === true).length;
  }, [notificationsList]);

  // Client-side filtering by Tab & Search
  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((item) => {
      const isItemRead = item.isRead === true || item.read === true;

      if (activeTab === "UNREAD" && isItemRead) return false;
      if (activeTab === "READ" && !isItemRead) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const titleMatch = (item.title || "").toLowerCase().includes(q);
        const msgMatch = (item.message || "").toLowerCase().includes(q);
        const typeMatch = (item.type || "").toLowerCase().includes(q);
        if (!titleMatch && !msgMatch && !typeMatch) return false;
      }

      return true;
    });
  }, [notificationsList, activeTab, searchTerm]);

  // Handlers
  const handleMarkAllAsRead = async () => {
    try {
      await readAllNotification(undefined).unwrap();
      toast.success("All notifications marked as read");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to mark notifications as read");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        await deleteNotification(undefined).unwrap();
        toast.success("All notifications cleared");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to clear notifications");
      }
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      setReadingId(id);
      await readSingleNotification(id).unwrap();
      toast.success("Notification marked as read");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update notification");
    } finally {
      setReadingId(null);
    }
  };

  const handleSingleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await singleDeleteNotification(id).unwrap();
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  // Helper icon selector based on notification title/type
  const getNotificationIcon = (item: TNotification) => {
    const title = (item.title || "").toLowerCase();
    const type = (item.type || "").toLowerCase();

    if (title.includes("alert") || title.includes("system") || title.includes("error") || type.includes("alert")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    if (title.includes("reward") || title.includes("coin") || title.includes("point")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
          <Coins className="w-5 h-5" />
        </div>
      );
    }
    if (title.includes("match") || title.includes("league") || title.includes("tournament") || title.includes("trophy")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
      );
    }
    if (title.includes("user") || title.includes("player") || title.includes("manager") || title.includes("transfer")) {
      return (
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
        <Megaphone className="w-5 h-5" />
      </div>
    );
  };

  const formatNotificationTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, "hour") < 24) {
      return d.fromNow();
    }
    return d.format("MMM DD, YYYY • hh:mm A");
  };

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Top Header Summary & Action Bar */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notification Center</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing page {paginationInfo.page} of {paginationInfo.totalPage} ({paginationInfo.total} total items)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || notificationsList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-slate-600" />
            <span>Mark All as Read</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={isClearingAll || notificationsList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="bg-white rounded-xl border border-gray-100 py-4 px-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200/60">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All Notifications ({notificationsList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "UNREAD"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("READ")}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === "READ"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-100"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications Card List */}
        <div className="pt-2">
          {isLoading || isFetching ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 animate-pulse flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center text-gray-400 shadow-xs">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-900">No notifications found</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  {searchTerm
                    ? "Try adjusting your search query or switching tabs."
                    : "You're all caught up! There are no new notifications at this time."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item) => {
                const isRead = item.isRead === true || item.read === true;
                const isItemDeleting = deletingId === item._id;
                const isItemReading = readingId === item._id;

                return (
                  <div
                    key={item._id}
                    className={`group relative p-5 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                      isRead
                        ? "bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs"
                        : "bg-slate-50/80 border-slate-200/90 shadow-2xs hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {getNotificationIcon(item)}

                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            className={`text-sm font-semibold tracking-tight ${
                              isRead ? "text-gray-900" : "text-slate-900 font-bold"
                            }`}
                          >
                            {item.title}
                          </h4>

                          {!isRead && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              New
                            </span>
                          )}

                          {item.type && (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px] uppercase tracking-wider">
                              {item.type}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-medium">
                          <span>{formatNotificationTime(item.createdAt)}</span>
                          {item.createdAt && (
                            <>
                              <span>•</span>
                              <span>{dayjs(item.createdAt).format("MMM DD, YYYY hh:mm A")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on right side */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 self-end sm:self-start">
                      {!isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkSingleAsRead(item._id)}
                          disabled={isItemReading}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors cursor-pointer"
                          title="Mark as read"
                        >
                          {isItemReading ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSingleDelete(item._id)}
                        disabled={isItemDeleting}
                        className="p-2 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 border border-gray-200/60 transition-colors cursor-pointer"
                        title="Delete notification"
                      >
                        {isItemDeleting ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="pt-6">
          <CustomPagination TOTAL_PAGES={paginationInfo.totalPage || 1} qryName="page" />
        </div>
      </div>
    </div>
  );
}