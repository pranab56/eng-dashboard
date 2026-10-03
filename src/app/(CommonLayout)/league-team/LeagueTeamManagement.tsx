/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Trophy,
  Users,
  Search,
  RefreshCw,
  Plus,
  Calendar,
  X,
  Layers,
} from "lucide-react";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteLeagueEntryMutation,
  useDeleteLeagueTeamMutation,
  useGetAllLeagueTeamQuery,
  useGetLeagueTeamOverviewQuery,
} from "@/features/leagueTeam/leagueTeamApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getLeagueTeamColumns } from "@/tableColumns/leagueTeamColumns";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import LeagueTeamViewModal from "./LeagueTeamViewModal";

export default function LeagueTeamManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // RTK Query: League Teams List
  const {
    data: leagueTeamData,
    isLoading: isTeamsLoading,
    isFetching: isTeamsFetching,
    refetch: refetchTeams,
  } = useGetAllLeagueTeamQuery(page);

  // RTK Query: Backend Computed Analytics
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetLeagueTeamOverviewQuery(undefined);

  const overview = overviewRes?.data;

  const [deleteLeagueTeam, { isLoading: isDeletingTeam }] =
    useDeleteLeagueTeamMutation();
  const [deleteLeagueEntry, { isLoading: isDeletingEntry }] =
    useDeleteLeagueEntryMutation();

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // View modal: holds { league, teams[] } for the selected row
  const [viewData, setViewData] = useState<{
    league: any;
    teams: any[];
  } | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"team" | "league">("team");
  const [deletingParams, setDeletingParams] = useState<{
    leagueId: string;
    teamId?: string;
  } | null>(null);

  useEffect(() => {
    setHeaders({
      title: "League Teams",
      des: "Manage the association between leagues and participating teams.",
    });
  }, [setHeaders]);

  // Raw data from API
  const rawData: any[] = useMemo(
    () => leagueTeamData?.data || [],
    [leagueTeamData]
  );

  // Filtered rows by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return rawData;
    const query = searchTerm.toLowerCase().trim();

    return rawData.filter((item) => {
      const leagueName = item.league?.leagueName || "";
      const season = item.league?.season || "";
      const teams = (item.teams || []).filter(Boolean);
      const teamMatch = teams.some(
        (t: any) =>
          (t?.teamName || "").toLowerCase().includes(query) ||
          (t?.shortName || "").toLowerCase().includes(query)
      );

      return (
        leagueName.toLowerCase().includes(query) ||
        season.toLowerCase().includes(query) ||
        teamMatch
      );
    });
  }, [rawData, searchTerm]);

  // Backend-computed analytics metrics (with reliable database fallback)
  const totalLeaguesCount =
    overview?.totalLeagues ??
    leagueTeamData?.pagination?.total ??
    rawData.length;
  const totalAllocatedTeamsCount = overview?.totalAllocatedTeams ?? 0;
  const avgTeamsCount = overview?.avgTeamsPerLeague ?? "0";
  const activeSeasonsCount = overview?.activeSeasons ?? 0;

  // Handlers
  const handleView = (row: { league: any; teams: any[] }) => {
    setViewData(row);
  };

  const handleCloseView = () => {
    setViewData(null);
  };

  const handleDeleteTeam = (leagueId: string, teamId: string) => {
    setDeleteMode("team");
    setDeletingParams({ leagueId, teamId });
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLeagueEntry = (leagueId: string) => {
    setDeleteMode("league");
    setDeletingParams({ leagueId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingParams) return;

    try {
      if (deleteMode === "league") {
        const res = await deleteLeagueEntry(deletingParams.leagueId).unwrap();
        if (res.success) {
          toast.success(res.message || "League entry removed successfully");
          setIsDeleteModalOpen(false);
          setDeletingParams(null);
          refetchOverview();
          if (viewData?.league?._id === deletingParams.leagueId) {
            setViewData(null);
          }
        }
      } else {
        const res = await deleteLeagueTeam({
          leagueId: deletingParams.leagueId,
          teamId: deletingParams.teamId!,
        }).unwrap();
        if (res.success) {
          toast.success(
            res.message || "Team removed from league successfully"
          );
          setIsDeleteModalOpen(false);
          refetchOverview();

          if (viewData) {
            const updatedTeams = viewData.teams.filter(
              (t) => t._id !== deletingParams.teamId
            );
            if (updatedTeams.length === 0) {
              setViewData(null);
            } else {
              setViewData({ ...viewData, teams: updatedTeams });
            }
          }
          setDeletingParams(null);
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to process deletion");
    }
  };

  const isRefreshing = isTeamsFetching || isOverviewFetching;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 max-w-[1600px] mx-auto text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            League Teams
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure and monitor team rosters and allocations across competitive league seasons.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              refetchTeams();
              refetchOverview();
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh league teams and analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link href="/league-team/create-league-team">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team to League</span>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip (Backend-Computed Analytics API) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              League Entries
            </span>
            <Trophy className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : totalLeaguesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">leagues</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Active registered league groups
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Allocated Teams
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading
                ? "—"
                : totalAllocatedTeamsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">assignments</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total team placements across all leagues
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Avg Teams / League
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : avgTeamsCount}
            </span>
            <span className="text-xs text-slate-500">teams</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Roster density per competition
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Seasons Tracked
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : activeSeasonsCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">seasons</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Distinct competitive campaign years
          </p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Control Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 leading-snug">
              League Roster Associations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              List of clubs assigned to active and historical league divisions.
            </p>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search league, season, or team..."
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

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Custom Table */}
        <div className="w-full overflow-x-auto p-4">
          <CustomTable<any>
            columns={getLeagueTeamColumns(handleView, handleDeleteLeagueEntry)}
            data={filteredData}
            isLoading={isTeamsLoading}
          />
        </div>

        {/* Table Footer with Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <span className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{filteredData.length}</strong> of{" "}
            <strong className="text-slate-700">
              {leagueTeamData?.pagination?.total || rawData.length}
            </strong>{" "}
            league entries
          </span>
          <CustomPagination
            TOTAL_PAGES={leagueTeamData?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* View Modal — inspect all teams registered for selected league */}
      <LeagueTeamViewModal
        data={viewData}
        isOpen={!!viewData}
        onClose={handleCloseView}
        onDeleteTeam={handleDeleteTeam}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingParams(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingTeam || isDeletingEntry}
        title={
          deleteMode === "league"
            ? "Delete League Entry"
            : "Remove Team from League"
        }
        description={
          deleteMode === "league"
            ? "Are you sure you want to remove all team associations for this league? This action cannot be undone."
            : "Are you sure you want to remove this team from the league? This action cannot be undone."
        }
      />
    </div>
  );
}
