/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  Search,
  X,
  User,
  ArrowLeftRight,
  Trophy,
  AlertCircle,
  Inbox,
  RefreshCw,
} from "lucide-react";
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
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function MyNotificationPage() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const {
    data: notificationRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllNotificationsQuery(page);

  const [readAllNotification, { isLoading: isMarkingAll }] = useReadAllNotificationMutation();
  const [readSingleNotification] = useReadSingleNotificationMutation();
  const [deleteNotification, { isLoading: isClearingAll }] = useDeleteNotificationMutation();
  const [singleDeleteNotification] = useSingleDeleteNotificationMutation();

  useEffect(() => {
    setHeaders({
      title: "Notifications",
      des: "Review and manage all alerts and system messages delivered to your account.",
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
    return notificationsList.filter(
      (item) => item.isRead === false || item.read === false
    ).length;
  }, [notificationsList]);

  const readCount = useMemo(() => {
    return notificationsList.filter(
      (item) => item.isRead === true || item.read === true
    ).length;
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

  const getNotificationIcon = (item: TNotification) => {
    const title = (item.title || "").toLowerCase();
    const type = (item.type || "").toLowerCase();

    if (title.includes("transfer") || type.includes("transfer")) {
      return <ArrowLeftRight className="w-4 h-4 text-slate-700" />;
    }
    if (title.includes("match") || title.includes("tournament") || title.includes("league") || type.includes("match")) {
      return <Trophy className="w-4 h-4 text-slate-700" />;
    }
    if (title.includes("player") || title.includes("profile") || title.includes("user") || type.includes("user")) {
      return <User className="w-4 h-4 text-slate-700" />;
    }
    if (title.includes("alert") || title.includes("warning") || title.includes("error")) {
      return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
    return <Bell className="w-4 h-4 text-slate-700" />;
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
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Clean Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Notifications
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {paginationInfo.total} total
            </span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 tabular-nums">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal and system alerts directed to your administrator account.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-slate-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll || notificationsList.length === 0 || unreadCount === 0}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
            <span>Mark All Read</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            disabled={isClearingAll || notificationsList.length === 0}
            className="inline-flex items-center gap-1.5 h-8 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1">
        {/* Segmented Filter Tabs */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All ({notificationsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UNREAD")}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "UNREAD"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-semibold tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("READ")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === "READ"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Read ({readCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter notifications..."
            className="w-full h-8 pl-8 pr-7 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Notification Feed Container */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="p-4 flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchTerm
                ? "No notifications matched your search query. Try adjusting terms."
                : "You're all caught up. No notifications are present in this view."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((item) => {
              const isRead = item.isRead === true || item.read === true;
              const isItemDeleting = deletingId === item._id;
              const isItemReading = readingId === item._id;

              return (
                <div
                  key={item._id}
                  className={`group relative p-4 sm:px-5 sm:py-3.5 flex items-start justify-between gap-4 transition-colors ${
                    isRead ? "bg-white hover:bg-slate-50/70" : "bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Status Dot */}
                    <div className="pt-2 shrink-0">
                      <span
                        className={`block w-1.5 h-1.5 rounded-full ${
                          isRead ? "bg-transparent" : "bg-blue-600"
                        }`}
                      />
                    </div>

                    {/* Functional Icon */}
                    <div className="w-8 h-8 rounded border border-slate-200 bg-white flex items-center justify-center shrink-0 mt-0.5">
                      {getNotificationIcon(item)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4
                          className={`text-xs sm:text-sm tracking-tight ${
                            isRead ? "font-normal text-slate-800" : "font-semibold text-slate-950"
                          }`}
                        >
                          {item.title}
                        </h4>

                        {!isRead && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider">
                            New
                          </span>
                        )}

                        {item.type && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                            {item.type.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-4xl">
                        {item.message}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 tabular-nums">
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

                  {/* Actions on right */}
                  <div className="flex items-center gap-1.5 shrink-0 self-start pt-1">
                    {!isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkSingleAsRead(item._id)}
                        disabled={isItemReading}
                        className="inline-flex items-center gap-1 h-7 px-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        {isItemReading ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                        ) : (
                          <Check className="w-3 h-3 text-slate-600" />
                        )}
                        <span className="hidden sm:inline">Read</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleSingleDelete(item._id)}
                      disabled={isItemDeleting}
                      className="inline-flex items-center justify-center w-7 h-7 rounded border border-transparent hover:border-rose-200 bg-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      {isItemDeleting ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-rose-500" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {paginationInfo.totalPage > 1 && (
          <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {paginationInfo.page} of {paginationInfo.totalPage}
            </span>
            <CustomPagination TOTAL_PAGES={paginationInfo.totalPage || 1} qryName="page" />
          </div>
        )}
      </div>
    </div>
  );
}
