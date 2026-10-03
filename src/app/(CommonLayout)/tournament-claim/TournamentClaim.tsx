"use client";

import React, { useEffect, useState, useMemo } from "react";
import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useGetAllTournamentClaimQuery,
  useGetTournamentClaimOverviewQuery,
  useUpdateTournamentClaimStatusMutation,
} from "@/features/tournamentClaim/tournamentClaimApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getTournamentClaimColumns } from "@/tableColumns/tournamentClaimColumns";
import { TTournamentClaim } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Search,
  RefreshCw,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import TournamentClaimViewModal from "./TournamentClaimViewModal";

export default function TournamentClaim() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // RTK Query: Claims List
  const {
    data: claimRes,
    isLoading: isClaimsLoading,
    isFetching: isClaimsFetching,
    refetch: refetchClaims,
  } = useGetAllTournamentClaimQuery(page);

  // RTK Query: Backend Computed Analytics / Overview
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetTournamentClaimOverviewQuery(undefined);

  const overview = overviewRes?.data;

  const [updateTournamentClaimStatus] =
    useUpdateTournamentClaimStatusMutation();

  // Selection & Modal States
  const [selectedClaim, setSelectedClaim] = useState<TTournamentClaim | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setHeaders({
      title: "Tournament Claims",
      des: "Review and verify participant rank submissions from tournaments.",
    });
  }, [setHeaders]);

  const rawClaims: TTournamentClaim[] = useMemo(
    () => claimRes?.data || [],
    [claimRes]
  );

  // Backend-driven metrics (accurately aggregated on database)
  const totalClaimsCount = overview?.totalClaims ?? claimRes?.pagination?.total ?? rawClaims.length;
  const pendingClaimsCount = overview?.pendingClaims ?? 0;
  const approvedClaimsCount = overview?.approvedClaims ?? 0;
  const rejectedClaimsCount = overview?.rejectedClaims ?? 0;

  // Filtered Claims for Current Table View
  const filteredClaims = useMemo(() => {
    return rawClaims.filter((claim) => {
      const userName = claim.user?.userName || "";
      const email = claim.user?.email || "";
      const tournamentTitle = claim.tournament?.title || "";
      const rankName = claim.claimedPositionName || "";
      const proofNotes = claim.proofNotes || "";

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        userName.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        tournamentTitle.toLowerCase().includes(query) ||
        rankName.toLowerCase().includes(query) ||
        proofNotes.toLowerCase().includes(query);

      const claimStatus = (claim.status || "pending").toLowerCase();
      const matchesStatus =
        statusFilter === "ALL" || claimStatus === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawClaims, searchTerm, statusFilter]);

  // Handlers
  const handleView = (claim: TTournamentClaim) => {
    setSelectedClaim(claim);
    setIsViewModalOpen(true);
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    try {
      setUpdatingId(id);
      const res = await updateTournamentClaimStatus({
        id: id,
        body: { status: status },
      }).unwrap();

      if (res?.success !== false) {
        toast.success(
          res?.message || `Tournament claim updated to ${status}`
        );
        refetchOverview();
      }
    } catch (err: any) {
      toast.error(
        getErrorMessage(err, `Failed to update claim status to ${status}`)
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const isRefreshing = isClaimsFetching || isOverviewFetching;

  const statusTabs = [
    { label: "All Claims", value: "ALL", count: totalClaimsCount },
    { label: "Pending", value: "pending", count: pendingClaimsCount },
    { label: "Approved", value: "approved", count: approvedClaimsCount },
    { label: "Rejected", value: "rejected", count: rejectedClaimsCount },
  ];

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Tournament Claims
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review, verify, and confirm user tournament rank claim submissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refetchClaims();
              refetchOverview();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh claim records and backend analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (Backend Computed Analytics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Claims */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Claims
            </span>
            <Trophy className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : totalClaimsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">submissions</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All-time tournament rank submissions
          </p>
        </div>

        {/* Pending Claims */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Pending Review
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-700">
              {isOverviewLoading ? "—" : pendingClaimsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">awaiting check</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Requires verification by administrator
          </p>
        </div>

        {/* Approved Claims */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Approved
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {isOverviewLoading ? "—" : approvedClaimsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">verified</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Ranks confirmed and points credited
          </p>
        </div>

        {/* Rejected Claims */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Rejected
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-700">
              {isOverviewLoading ? "—" : rejectedClaimsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">declined</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Submissions disqualified or invalid
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
                  onClick={() => setStatusFilter(tab.value)}
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

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, rank, tournament..."
                className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(searchTerm || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table View / Custom Empty State */}
        {filteredClaims.length > 0 || isClaimsLoading ? (
          <div className="w-full overflow-x-auto">
            <CustomTable<TTournamentClaim>
              columns={getTournamentClaimColumns(
                handleView,
                handleStatusUpdate,
                updatingId
              )}
              data={filteredClaims}
              isLoading={isClaimsLoading}
            />
          </div>
        ) : (
          <div className="py-14 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">
              No tournament claims found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "ALL"
                ? "No claims match your search criteria. Try adjusting filters or search term."
                : "No tournament rank claims have been submitted yet."}
            </p>
            {(searchTerm || statusFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("ALL");
                }}
                className="mt-3.5 inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{filteredClaims.length}</strong> of{" "}
            <strong className="text-slate-700">{totalClaimsCount}</strong> total claims
          </span>
          <CustomPagination
            TOTAL_PAGES={claimRes?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* View Details & Review Modal */}
      <TournamentClaimViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        claim={selectedClaim}
        onStatusUpdate={handleStatusUpdate}
        isLoading={Boolean(updatingId)}
      />
    </div>
  );
}
