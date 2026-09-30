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
  Users,
  Search,
  RefreshCw,
  Inbox,
  Clock,
  Send,
  XCircle,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ChevronDown,
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SCHEDULED" | "CANCELLED">("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const queryParams = useMemo(() => ({
    page,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    searchTerm: searchTerm.trim() || undefined,
  }), [page, statusFilter, searchTerm]);

  const { data: notificationRes, isLoading, isFetching } = useGetAllPushNotificationQuery(queryParams);
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

  // Compute live stats cards from database-wide aggregate stats
  const stats = useMemo(() => {
    const backendStats = notificationRes?.data?.stats || notificationRes?.stats;
    if (backendStats) {
      return {
        total: backendStats.total ?? 0,
        sentCount: backendStats.sentCount ?? 0,
        scheduledCount: backendStats.scheduledCount ?? 0,
        cancelledCount: backendStats.cancelledCount ?? 0,
      };
    }

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
  }, [notificationRes, rawNotifications, paginationInfo]);

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

  // Server-side filtered notifications (with client-side fallback if needed)
  const filteredNotifications = useMemo(() => {
    if (!Array.isArray(rawNotifications)) return [];
    return rawNotifications;
  }, [rawNotifications]);

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
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Top Metric Cards */}
      <GeneralStateCard className="grid-cols-1 md:grid-cols-3" items={stateCardsData} />

      {/* Main Content Box */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header Controls: Bell Icon, Title on Left, Action Buttons on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
              <Bell className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Push Notifications & Schedule Log
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  <Globe className="w-3 h-3 text-amber-600" />
                  UK Time (BST/GMT)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor live broadcasts and future scheduled deliveries managed by BullMQ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {/* Clear All Button */}
            {rawNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={isClearingAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/70 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                title="Clear all notification history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}

            {/* Primary Action Button: Send / Schedule Push */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg text-xs font-bold shadow-sm shadow-amber-500/25 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send / Schedule Push</span>
            </button>
          </div>
        </div>

        {/* Toolbar: Filter Tabs on Left, Search on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 slim-scroll">
            <span className="text-slate-400 font-medium text-xs mr-1 shrink-0">Filter:</span>
            {[
              { id: "ALL", label: "All Notifications", count: stats.total },
              { id: "SCHEDULED", label: "Scheduled Queue", count: stats.scheduledCount },
              { id: "CANCELLED", label: "Cancelled", count: stats.cancelledCount },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200 text-slate-600"
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
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
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
                  audienceLabel = targetUser.userName || targetUser.email || "Targeted User";
                } else if (item.targetRole && item.targetRole !== "ALL") {
                  if (item.targetRole === "PLAYER") audienceLabel = "Players Only";
                  else if (item.targetRole === "PARENT") audienceLabel = "Parents Only";
                  else if (item.targetRole === "REFEREE") audienceLabel = "Referees Only";
                  else if (item.targetRole === "COACH" || item.targetRole === "MANAGER") audienceLabel = "Managers Only";
                  else audienceLabel = `Target: ${item.targetRole}`;
                }

                const isExpanded = !!expandedIds[item._id];
                const isLongMessage = typeof item.message === "string" && item.message.length > 110;

                return (
                      <div
                        key={item._id}
                        onClick={() => toggleExpand(item._id)}
                        className="p-4 sm:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          {/* Clean Natural Icon */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isScheduled
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : isCancelled
                                ? "bg-slate-50 text-slate-400 border-slate-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {isScheduled ? (
                              <Clock className="w-4 h-4 text-amber-600" />
                            ) : isCancelled ? (
                              <XCircle className="w-4 h-4 text-slate-400" />
                            ) : (
                              <Send className="w-4 h-4 text-slate-600" />
                            )}
                          </div>

                          {/* Content Body */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            {/* Title & Badges */}
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                                {item.title}
                              </h4>

                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  isScheduled
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : isCancelled
                                    ? "bg-slate-100 text-slate-600 border-slate-200"
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                                }`}
                              >
                                {isScheduled && <Clock className="w-3 h-3 text-amber-600" />}
                                {isCancelled && <XCircle className="w-3 h-3 text-slate-500" />}
                                {!isScheduled && !isCancelled && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                <span>{isScheduled ? "Scheduled" : isCancelled ? "Cancelled" : "Delivered"}</span>
                              </span>

                              {/* Target Audience Badge */}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-medium">
                                {targetUser ? <User className="w-3 h-3 text-slate-500" /> : <Users className="w-3 h-3 text-slate-500" />}
                                <span>{audienceLabel}</span>
                              </span>
                            </div>

                            {/* Message Text with Collapsible overflow */}
                            <div>
                              <p
                                className={`text-xs text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap break-words transition-all duration-150 ${
                                  !isExpanded && isLongMessage ? "line-clamp-2" : ""
                                }`}
                              >
                                {item.message}
                              </p>
                              {isLongMessage && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpand(item._id);
                                  }}
                                  className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 mt-1 cursor-pointer flex items-center gap-1"
                                >
                                  <span>{isExpanded ? "Show less" : "Read more..."}</span>
                                  <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                              )}
                            </div>

                            {/* Timing Metadata */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                              {isScheduled && item.scheduledAt && (
                                <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  <Globe className="w-3 h-3 text-amber-600" />
                                  <span>
                                    Scheduled UK Time: {item.scheduledAtUK || dayjs(item.scheduledAt).tz("Europe/London").format("ddd, DD MMM YYYY [at] HH:mm")}
                                  </span>
                                </span>
                              )}

                              {item.sentAt && (
                                <span className="text-slate-500 font-medium">
                                  Dispatched: {dayjs(item.sentAt).tz("Europe/London").format("DD MMM YYYY, HH:mm")} (UK)
                                </span>
                              )}

                              <span>
                                Created: {dayjs(item.createdAt).fromNow()}
                              </span>

                              {item.createdBy && (
                                <span className="text-slate-400 border-l border-slate-200 pl-3">
                                  By: {item.createdBy.userName || `${item.createdBy.firstName || ''} ${item.createdBy.lastName || ''}`.trim() || item.createdBy.email || 'Admin'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          {/* If Scheduled: Show Orange Send Now and Cancel buttons */}
                          {isScheduled && (
                            <>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendNow(item._id);
                                }}
                                disabled={isActionBusy}
                                className="px-2.5 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="Dispatch immediately without waiting for scheduled time"
                              >
                                {isActionBusy ? <RefreshCw className="w-3 h-3 animate-spin text-orange-600" /> : <Send className="w-3 h-3 text-orange-600" />}
                                <span>Send Now</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelScheduled(item._id);
                                }}
                                disabled={isActionBusy}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                title="Cancel scheduled delivery"
                              >
                                <XCircle className="w-3.5 h-3.5 text-slate-500" />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSingleDelete(item._id);
                            }}
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
