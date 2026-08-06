/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useHeaders } from "@/hooks/useHeaders";
import { useEffect, useMemo, useState } from "react";
import {
  useDeleteAllPushNotificationMutation,
  useDeletePushNotificationMutation,
  useGetAllPushNotificationQuery,
} from "@/features/pushNotification/pushNotificationApi";
import GeneralStateCard, { GeneralStateCardProps } from "@/components/cui/GeneralStateCard";
import CreateButton from "@/components/buttons/CreateButton";
import CustomPagination from "@/components/cui/CustomPagination";
import CreatePushNotificationModal from "@/components/modals/CreatePushNotificationModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Bell, Megaphone, Trash2, User, Search, RefreshCw, Inbox } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

dayjs.extend(relativeTime);

export default function PushNotificationPage() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: notificationRes, isLoading, isFetching } = useGetAllPushNotificationQuery(page);
  const [deleteSingleNotification] = useDeletePushNotificationMutation();
  const [deleteAllNotification, { isLoading: isClearingAll }] = useDeleteAllPushNotificationMutation();

  useEffect(() => {
    setHeaders({
      title: "Push Notification",
      des: "Manage and broadcast push notifications to mobile and web users.",
    });
  }, [setHeaders]);

  const rawNotifications = useMemo(() => {
    return notificationRes?.data || [];
  }, [notificationRes]);

  const paginationInfo = useMemo(() => {
    return notificationRes?.pagination || {
      total: rawNotifications.length,
      limit: 10,
      page: Number(page),
      totalPage: 1,
    };
  }, [notificationRes, rawNotifications.length, page]);

  // State Card Items
  const summaryItems: GeneralStateCardProps[] = useMemo(() => {
    const total = paginationInfo.total || rawNotifications.length;
    const broadcasts = rawNotifications.filter((n: any) => !n.user && !n.receiver).length;
    const targeted = rawNotifications.filter((n: any) => n.user || n.receiver).length;

    return [
      {
        id: "card-1",
        title: "TOTAL NOTIFICATIONS",
        value: total,
        description: "Total push notifications sent",
      },
      {
        id: "card-2",
        title: "BROADCAST NOTIFICATIONS",
        value: broadcasts,
        description: "Sent to all registered users",
      },
      {
        id: "card-3",
        title: "TARGETED NOTIFICATIONS",
        value: targeted,
        description: "Sent to specific individual users",
      }
    ];
  }, [rawNotifications, paginationInfo]);

  // Client search filter
  const filteredNotifications = useMemo(() => {
    if (!searchTerm.trim()) return rawNotifications;
    const q = searchTerm.toLowerCase().trim();
    return rawNotifications.filter((n: any) => {
      const titleMatch = (n.title || "").toLowerCase().includes(q);
      const msgMatch = (n.message || "").toLowerCase().includes(q);
      const userMatch = (n.user?.userName || n.user?.email || "").toLowerCase().includes(q);
      return titleMatch || msgMatch || userMatch;
    });
  }, [rawNotifications, searchTerm]);

  // Actions
  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all push notifications?")) {
      try {
        await deleteAllNotification(undefined).unwrap();
        toast.success("All push notifications deleted");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete notifications");
      }
    }
  };

  const handleSingleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await deleteSingleNotification(id).unwrap();
      toast.success("Notification deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Top State Summary Cards */}
      <GeneralStateCard items={summaryItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />

      {/* Main Content Box */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-xs space-y-6">
        {/* Header Controls: Title, Search, Buttons */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">

          <div className="flex items-center gap-3 w-4/12">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Push Notification History</h2>
              <p className="text-xs text-gray-500">
                View all broadcasted announcements and targeted notifications
              </p>
            </div>
          </div>

          <div className="flex  items-center gap-3 w-8/12">
            {/* Search Input */}
            <div className="relative w-5/12">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:border-gray-300 transition-all"
              />
            </div>

            {/* Clear All Button */}
            {rawNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="inline-flex items-center w-5/12 gap-2 px-3.5 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/60 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}

            {/* Create Button */}
            <CreateButton
              text="Send Push Notification"
              onClick={() => setIsModalOpen(true)}
              className="py-3 px-4 w-4/12 text-xs font-bold rounded-xl shadow-md"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div>
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
                <h3 className="text-base font-bold text-gray-900">No push notifications found</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  {searchTerm
                    ? "No notifications match your search query."
                    : "Click 'Send Push Notification' above to broadcast your first notification."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item: any) => {
                const targetUser = item.user || item.receiver;
                const isItemDeleting = deletingId === item._id;

                return (
                  <div
                    key={item._id}
                    className="group relative p-5 rounded-2xl border border-gray-100 bg-white hover:border-slate-300 hover:shadow-xs transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                        {targetUser ? <User className="w-5 h-5 text-amber-400" /> : <Megaphone className="w-5 h-5 text-amber-400" />}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-bold text-gray-900 tracking-tight">
                            {item.title}
                          </h4>

                          {/* Audience Badge */}
                          {targetUser ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-[11px]">
                              Target: {typeof targetUser === "object" ? targetUser.userName || targetUser.email || "Single User" : "Single User"}
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold text-[11px]">
                              📢 Broadcast (All Users)
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed max-w-3xl">
                          {item.message}
                        </p>

                        <div className="flex items-center gap-2 pt-1 text-[11px] text-gray-400 font-medium">
                          <span>{dayjs(item.createdAt).fromNow()}</span>
                          {item.createdAt && (
                            <>
                              <span>•</span>
                              <span>{dayjs(item.createdAt).format("MMM DD, YYYY • hh:mm A")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <div className="shrink-0 self-end sm:self-start">
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
        <div className="pt-4 border-t border-gray-100">
          <CustomPagination TOTAL_PAGES={paginationInfo.totalPage || 1} qryName="page" />
        </div>
      </div>

      {/* Create Modal */}
      <CreatePushNotificationModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </div>
  );
}
