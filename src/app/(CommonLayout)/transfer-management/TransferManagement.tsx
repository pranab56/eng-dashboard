/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";

import CustomTable from "@/components/table/CustomTable";
import CustomPagination from "@/components/cui/CustomPagination";
import { useHeaders } from "@/hooks/useHeaders";
import {
  useGetAllTransferQuery,
  useGetTransferOverviewQuery,
  useAproveTransferMutation,
  useRejectTransferMutation,
} from "@/features/transfer/transferApi";
import { getTransferColumns, ExtendedTransfer } from "@/tableColumns/transferColumns";
import { TTransfer } from "@/types/columnTypes";
import TransferConfirmModal from "./TransferConfirmModal";
import TransferDetailModal from "./TransferDetailModal";

type StatusTab = "ALL" | "ACTION_REQUIRED" | "APPROVED" | "REJECTED";

const TransferManagement = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL state
  const pageParam = Number(searchParams.get("page")) || 1;
  const initialStatus = (searchParams.get("status") as StatusTab) || "ALL";

  const [statusFilter, setStatusFilter] = useState<StatusTab>(initialStatus);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals state
  const [selectedTransfer, setSelectedTransfer] = useState<ExtendedTransfer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Set page headers
  useEffect(() => {
    setHeaders({
      title: "Transfer Management",
      des: "Review and manage player transfer requests, approvals, and club registrations.",
    });
  }, [setHeaders]);

  // Search input debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Queries
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetTransferOverviewQuery(undefined);

  const {
    data: transferData,
    isLoading: isTransfersLoading,
    isFetching: isTransfersFetching,
    refetch: refetchTransfers,
  } = useGetAllTransferQuery({
    page: pageParam,
    status: statusFilter,
    searchTerm: debouncedSearch,
  });

  const [approveTransfer, { isLoading: isApproving }] = useAproveTransferMutation();
  const [rejectTransfer, { isLoading: isRejecting }] = useRejectTransferMutation();

  const isRefreshing = isTransfersFetching || isOverviewFetching;

  const handleRefreshAll = () => {
    refetchOverview();
    refetchTransfers();
    toast.success("Transfer data refreshed");
  };

  // Change active tab
  const handleTabChange = useCallback(
    (tab: StatusTab) => {
      setStatusFilter(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      params.set("status", tab);
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // Handlers for Modals
  const handleViewDetails = (transfer: ExtendedTransfer) => {
    setSelectedTransfer(transfer);
    setIsDetailModalOpen(true);
  };

  const handleApproveClick = (transfer: TTransfer) => {
    setSelectedTransfer(transfer as ExtendedTransfer);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (transfer: TTransfer) => {
    setSelectedTransfer(transfer as ExtendedTransfer);
    setIsRejectModalOpen(true);
  };

  const onApproveConfirm = async () => {
    if (!selectedTransfer) return;
    try {
      await approveTransfer({ id: selectedTransfer.id }).unwrap();
      toast.success("Transfer request approved successfully");
      setIsApproveModalOpen(false);
      setIsDetailModalOpen(false);
      refetchOverview();
    } catch {
      toast.error("Failed to approve transfer request");
    }
  };

  const onRejectConfirm = async () => {
    if (!selectedTransfer) return;
    try {
      await rejectTransfer({ id: selectedTransfer.id }).unwrap();
      toast.success("Transfer request rejected successfully");
      setIsRejectModalOpen(false);
      setIsDetailModalOpen(false);
      refetchOverview();
    } catch {
      toast.error("Failed to reject transfer request");
    }
  };

  // Tanstack Table Columns
  const columns = useMemo(
    () =>
      getTransferColumns({
        onApprove: handleApproveClick,
        onReject: handleRejectClick,
        onViewDetails: handleViewDetails,
      }),
    []
  );

  const overview = overviewData?.data || {
    totalTransfers: 0,
    actionRequiredTransfers: 0,
    approvedTransfers: 0,
    rejectedTransfers: 0,
    withdrawnTransfers: 0,
  };

  const totalTransfersCount = overview.totalTransfers;
  const actionRequiredCount = overview.actionRequiredTransfers;
  const approvedCount = overview.approvedTransfers;
  const rejectedCount = overview.rejectedTransfers + (overview.withdrawnTransfers || 0);

  const statusTabs: { label: string; value: StatusTab; count: number }[] = [
    { label: "All Transfers", value: "ALL", count: totalTransfersCount },
    { label: "Action Required", value: "ACTION_REQUIRED", count: actionRequiredCount },
    { label: "Approved", value: "APPROVED", count: approvedCount },
    { label: "Rejected", value: "REJECTED", count: rejectedCount },
  ];

  const transfersList = (transferData?.data?.result as ExtendedTransfer[]) || [];
  const meta = transferData?.data?.meta || { total: 0, totalPages: 1 };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 max-w-[1600px] mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Transfer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and manage player transfer requests, approvals, and club registrations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh transfer records and backend analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (Backend Computed Analytics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Transfers */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Transfers
            </span>
            <ArrowLeftRight className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : totalTransfersCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">requests</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All-time player transfer requests
          </p>
        </div>

        {/* Action Required */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Action Required
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-700">
              {isOverviewLoading ? "—" : actionRequiredCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">awaiting check</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pending manager or admin verification
          </p>
        </div>

        {/* Approved Transfers */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {isOverviewLoading ? "—" : approvedCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">completed</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Transfers finalized and active
          </p>
        </div>

        {/* Rejected Transfers */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rejected & Closed
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-700">
              {isOverviewLoading ? "—" : rejectedCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">declined</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Rejected or withdrawn transfer requests
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Filter and Control Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          {/* Status Tabs with Live Backend Counts */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {statusTabs.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleTabChange(tab.value)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive
                        ? "bg-slate-800 text-slate-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isOverviewLoading ? "—" : tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search player, club, email..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4">
          <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-slate-800">{transfersList.length}</span>{" "}
              transfers (Page {pageParam} of {meta.totalPages || 1})
            </span>
            {debouncedSearch && (
              <span className="text-slate-600">
                Filtered by: &ldquo;<span className="font-medium text-slate-900">{debouncedSearch}</span>&rdquo;
              </span>
            )}
          </div>

          <CustomTable<ExtendedTransfer>
            columns={columns}
            data={transfersList}
            isLoading={isTransfersLoading}
          />

          {/* Pagination */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <CustomPagination TOTAL_PAGES={meta.totalPages || 1} qryName="page" />
          </div>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      <TransferDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        transfer={selectedTransfer}
        onApprove={handleApproveClick}
        onReject={handleRejectClick}
      />

      {/* Approve Confirmation Modal */}
      <TransferConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={onApproveConfirm}
        title="Approve Player Transfer"
        description="Are you sure you want to approve this transfer request? This will formally finalize the player's affiliation."
        playerName={
          selectedTransfer
            ? `${selectedTransfer.playerFirstName} ${selectedTransfer.playerLastName}`
            : undefined
        }
        fromTeam={selectedTransfer?.fromTeamName}
        toTeam={selectedTransfer?.toTeamName}
        isLoading={isApproving}
        type="approve"
      />

      {/* Reject Confirmation Modal */}
      <TransferConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={onRejectConfirm}
        title="Reject Player Transfer"
        description="Are you sure you want to reject this transfer request? The requesting manager will be notified of this rejection."
        playerName={
          selectedTransfer
            ? `${selectedTransfer.playerFirstName} ${selectedTransfer.playerLastName}`
            : undefined
        }
        fromTeam={selectedTransfer?.fromTeamName}
        toTeam={selectedTransfer?.toTeamName}
        isLoading={isRejecting}
        type="reject"
      />
    </div>
  );
};

export default TransferManagement;
