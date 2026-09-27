/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useHeaders } from "@/hooks/useHeaders";
import { useEffect, useMemo, useState } from "react";
import {
  useDeleteAllPushNotificationMutation,
  useDeletePushNotificationMutation,
  useGetAllPushNotificationQuery,
  useCancelScheduledPushNotificationMutation,
  useSendScheduledNowPushNotificationMutation,
} from "@/features/pushNotification/pushNotificationApi";
import GeneralStateCard, { GeneralStateCardProps } from "@/components/cui/GeneralStateCard";
import CreateButton from "@/components/buttons/CreateButton";
import CustomPagination from "@/components/cui/CustomPagination";
import CreatePushNotificationModal from "@/components/modals/CreatePushNotificationModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Bell,
  Megaphone,
  Trash2,
  User,
  Search,
  RefreshCw,
  Inbox,
  Clock,
  Send,
  XCircle,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

export default function PushNotificationPage() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SENT" | "SCHEDULED" | "CANCELLED">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);

  const { data: notificationRes, isLoading, isFetching } = useGetAllPushNotificationQuery(page);
  const [deleteSingleNotification] = useDeletePushNotificationMutation();
  const [deleteAllNotification, { isLoading: isClearingAll }] = useDeleteAllPushNotificationMutation();
  const [cancelScheduledNotification] = useCancelScheduledPushNotificationMutation();
  const [sendScheduledNowNotification] = useSendScheduledNowPushNotificationMutation();

  useEffect(() => {
    setHeaders({
      title: "Push Notifications",
      des: "Manage immediate broadcasts and scheduled notifications with BullMQ.",
    });
  }, [setHeaders]);

  const rawNotifications: any[] = useMemo(() => {
    if (Array.isArray(notificationRes?.data?.result)) {
      return notificationRes.data.result;
    }
    if (Array.isArray(notificationRes?.data)) {
      return notificationRes.data;
    }
    if (Array.isArray(notificationRes?.result)) {
      return notificationRes.result;
    }
    return [];
  }, [notificationRes]);

  const paginationInfo = useMemo(() => {
    return (
      notificationRes?.data?.pagination ||
      notificationRes?.pagination || { totalPage: 1, total: 0 }
    );
  }, [notificationRes]);

  // Compute live stats cards
  const stats = useMemo(() => {
    let sentCount = 0;
    let scheduledCount = 0;
    let cancelledCount = 0;

    if (Array.isArray(rawNotifications)) {
      rawNotifications.forEach((n: any) => {
        const st = (n?.status || "SENT").toUpperCase();
        if (st === "SCHEDULED") scheduledCount++;
        else if (st === "CANCELLED") cancelledCount++;
        else sentCount++;
      });
    }

    return {
      total: paginationInfo?.total || (Array.isArray(rawNotifications) ? rawNotifications.length : 0),
      sentCount,
      scheduledCount,
      cancelledCount,
    };
  }, [rawNotifications, paginationInfo]);

  const stateCardsData: GeneralStateCardProps[] = [
    {
      id: "card-total",
      title: "Total Notifications",
      value: stats.total,
      description: "Total history logs in system",
    },
    {
      id: "card-scheduled",
      title: "Active Scheduled (BullMQ)",
      value: stats.scheduledCount,
      description: "Queued for UK local time dispatch",
    },
    {
      id: "card-dispatched",
      title: "Dispatched",
      value: stats.sentCount,
      description: "Delivered to target audience",
    },
  ];

  // Client-side search and status filter
  const filteredNotifications = useMemo(() => {
    if (!Array.isArray(rawNotifications)) return [];
    return rawNotifications.filter((n: any) => {
      const matchSearch =
        n?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n?.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n?.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n?.user?.userName?.toLowerCase().includes(searchTerm.toLowerCase());

      const itemStatus = (n?.status || "SENT").toUpperCase();
      const matchStatus = statusFilter === "ALL" || itemStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [rawNotifications, searchTerm, statusFilter]);

  const handleSingleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const confirmSingleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeletingId(deleteTargetId);
      await deleteSingleNotification(deleteTargetId).unwrap();
      toast.success("Notification deleted successfully");
      setDeleteTargetId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete notification");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelScheduled = async (id: string) => {
    try {
      setActionInProgressId(id);
      await cancelScheduledNotification(id).unwrap();
      toast.success("Scheduled notification cancelled");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel scheduled notification");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      setActionInProgressId(id);
      await sendScheduledNowNotification(id).unwrap();
      toast.success("Notification dispatched immediately!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to dispatch notification");
    } finally {
      setActionInProgressId(null);
    }
  };

  const handleClearAll = () => {
    setIsClearAllModalOpen(true);
  };

  const confirmClearAll = async () => {
    try {
      await deleteAllNotification(undefined).unwrap();
      toast.success("All notifications cleared");
      setIsClearAllModalOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to clear notifications");
    }
  };

  return (
    <div className="w-full p-4 sm:p-5 space-y-5">
      {/* Top Metric Cards */}
      <GeneralStateCard className="grid-cols-1 md:grid-cols-3" items={stateCardsData} />

      {/* Main Content Box */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
        {/* Header Controls: Title on Left, Action Buttons on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center shadow-xs shrink-0 border border-slate-700/50">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Push Notifications & Schedule Log
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/70">
                  <Globe className="w-3 h-3 text-amber-600" />
                  UK Time (BST/GMT)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor live broadcasts and future scheduled deliveries managed by BullMQ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            {/* Clear All Button */}
            {rawNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200/70 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            {/* Primary Action Button: Send / Schedule Push */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/25 transition-all duration-150 active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send / Schedule Push</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Filter Status Tabs on Left, Search Input on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 slim-scroll">
            <span className="text-slate-400 font-medium text-xs mr-1 shrink-0">Filter:</span>
            {[
              { id: "ALL", label: "All", count: stats.total },
              { id: "SENT", label: "Dispatched", count: stats.sentCount },
              { id: "SCHEDULED", label: "Scheduled", count: stats.scheduledCount },
              { id: "CANCELLED", label: "Cancelled", count: stats.cancelledCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div>
          {isLoading || isFetching ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 animate-pulse flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <Inbox className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">No push notifications found</h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  {searchTerm || statusFilter !== "ALL"
                    ? "No notifications match your active search or status filter."
                    : "Click 'Send / Schedule Push' above to create your first notification."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((item: any) => {
                const targetUser = item.user;
                const isItemDeleting = deletingId === item._id;
                const isActionBusy = actionInProgressId === item._id;
                const status = (item.status || "SENT").toUpperCase();
                const isScheduled = status === "SCHEDULED";
                const isCancelled = status === "CANCELLED";

                // Audience Label
                let audienceLabel = "All Users (Broadcast)";
                if (targetUser) {
                  audienceLabel = `User: ${targetUser.userName || targetUser.email || "Targeted User"}`;
                } else if (item.targetRole && item.targetRole !== "ALL") {
                  if (item.targetRole === "PLAYER") audienceLabel = "Players Only";
                  else if (item.targetRole === "PARENT") audienceLabel = "Parents Only";
                  else if (item.targetRole === "REFEREE") audienceLabel = "Referees Only";
                  else if (item.targetRole === "COACH") audienceLabel = "Coaches Only";
                  else audienceLabel = `Target: ${item.targetRole}`;
                }

                return (
                  <div
                    key={item._id}
                    className="p-4.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5 flex-1">
                      {/* Status / Channel Icon */}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
                          isScheduled
                            ? "bg-amber-50 text-amber-600 border-amber-200"
                            : isCancelled
                            ? "bg-slate-100 text-slate-400 border-slate-200"
                            : "bg-emerald-50 text-emerald-600 border-emerald-200"
                        }`}
                      >
                        {isScheduled ? (
                          <Clock className="w-5 h-5" />
                        ) : isCancelled ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                            {item.title}
                          </h4>

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${
                              isScheduled
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : isCancelled
                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {isScheduled && <Clock className="w-3 h-3" />}
                            {isCancelled && <XCircle className="w-3 h-3" />}
                            {!isScheduled && !isCancelled && <CheckCircle2 className="w-3 h-3" />}
                            {status}
                          </span>

                          {/* Audience Badge */}
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                            {audienceLabel}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {item.message}
                        </p>

                        {/* Timing Metadata */}
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                          {isScheduled && item.scheduledAt && (
                            <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                              <Globe className="w-3 h-3" />
                              Scheduled UK Time: {item.scheduledAtUK || dayjs(item.scheduledAt).tz("Europe/London").format("DD MMM YYYY, HH:mm")}
                            </span>
                          )}

                          {item.sentAt && (
                            <span>
                              Dispatched: {dayjs(item.sentAt).tz("Europe/London").format("DD MMM YYYY, HH:mm")} (UK)
                            </span>
                          )}

                          <span>Created: {dayjs(item.createdAt).fromNow()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      {/* If Scheduled: Show Send Now and Cancel buttons */}
                      {isScheduled && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSendNow(item._id)}
                            disabled={isActionBusy}
                            className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Dispatch immediately without waiting for scheduled time"
                          >
                            {isActionBusy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Send Now
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelScheduled(item._id)}
                            disabled={isActionBusy}
                            className="px-2.5 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Cancel scheduled delivery"
                          >
                            <XCircle className="w-3 h-3 text-amber-600" />
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleSingleDelete(item._id)}
                        disabled={isItemDeleting}
                        className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete notification log"
                      >
                        {isItemDeleting ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-500" />
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
        </div>

        {/* Pagination */}
        <div className="pt-4 border-t border-slate-100">
          <CustomPagination TOTAL_PAGES={paginationInfo.totalPage || 1} qryName="page" />
        </div>
      </div>

      {/* Create Modal */}
      <CreatePushNotificationModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      {/* Clear All Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isClearAllModalOpen}
        onClose={() => setIsClearAllModalOpen(false)}
        onConfirm={confirmClearAll}
        isLoading={isClearingAll}
        title="Clear All Notifications"
        description="Are you sure you want to permanently delete all notification logs from the database? This action cannot be undone."
      />

      {/* Delete Single Notification Modal */}
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmSingleDelete}
        isLoading={deletingId !== null}
        title="Delete Notification Log"
        description="Are you sure you want to delete this notification record? This action cannot be undone."
      />
    </div>
  );
}
