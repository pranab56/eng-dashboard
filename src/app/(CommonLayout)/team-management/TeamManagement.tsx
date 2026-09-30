/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Shield,
  Plus,
  Search,
  X,
  RotateCcw,
  Trophy,
  Users,
  Coins,
  Settings,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteTeamMutation,
  useGetAllTeamQuery,
  useGetSingleTeamQuery,
  useUpdateTeamCoinBudgetMutation,
  useGetTeamAnalyticsQuery,
} from "@/features/teamManagement/teamApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllManagerTeamQuery } from "@/features/managerTeam/managerTeamApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getTeamColumns } from "@/tableColumns/teamColumns";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import TeamViewModal from "./TeamViewModal";
import { UpdateCoinModal } from "@/components/modals/UpdateCoinModal";
import { LeagueSelectDropdown } from "@/components/dropdowns/LeagueSelectDropdown";
import { ManagerSelectDropdown } from "@/components/dropdowns/ManagerSelectDropdown";
import { TeamTypeSelectDropdown } from "@/components/dropdowns/TeamTypeSelectDropdown";

const TeamManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("teamPage") || "1";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("ALL");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("ALL");
  const [selectedTeamType, setSelectedTeamType] = useState<string>("ALL");

  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      ...(selectedLeagueId !== "ALL" && { league: selectedLeagueId }),
      ...(selectedManagerId !== "ALL" && { manager: selectedManagerId }),
      ...(selectedTeamType !== "ALL" && { teamType: selectedTeamType }),
      ...(searchTerm.trim() && { searchTerm: searchTerm.trim() }),
    }),
    [page, selectedLeagueId, selectedManagerId, selectedTeamType, searchTerm]
  );

  const { data: teamData, isLoading } = useGetAllTeamQuery(queryParams);
  const { data: analyticsData } = useGetTeamAnalyticsQuery(undefined);
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const { data: managersData } = useGetAllManagerTeamQuery({ limit: 100 });

  const allLeagues = useMemo(() => {
    return leaguesData?.data?.result || leaguesData?.data || [];
  }, [leaguesData]);

  const allManagers = useMemo(() => {
    return managersData?.data?.result || managersData?.data || [];
  }, [managersData]);

  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();
  const [updateTeamCoinBudget, { isLoading: isUpdatingCoin }] =
    useUpdateTeamCoinBudgetMutation();

  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: singleTeamData } = useGetSingleTeamQuery(selectedTeam?._id, {
    skip: !selectedTeam?._id || !isViewModalOpen,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [coinTargetTeam, setCoinTargetTeam] = useState<any | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Team Management",
      des: "Manage and monitor registered squads, league associations, and team identities.",
    });
  }, [setHeaders]);

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditCoin = (team: any) => {
    setCoinTargetTeam(team);
    setIsCoinModalOpen(true);
  };

  const handleConfirmUpdateCoin = async (coinValue: number) => {
    if (!coinTargetTeam?._id) {
      toast.error("Team ID not found");
      return;
    }
    try {
      await updateTeamCoinBudget({
        id: coinTargetTeam._id,
        data: { coin: coinValue },
      }).unwrap();
      toast.success("Team coin updated successfully");
      setIsCoinModalOpen(false);
      setCoinTargetTeam(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update team coin");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteTeam(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Team deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete team");
    }
  };

  const handleResetAllFilters = () => {
    setSelectedLeagueId("ALL");
    setSelectedManagerId("ALL");
    setSelectedTeamType("ALL");
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedLeagueId !== "ALL" ||
    selectedManagerId !== "ALL" ||
    selectedTeamType !== "ALL" ||
    searchTerm.trim() !== "";

  // Available unique team types
  const uniqueTeamTypes = useMemo(() => {
    const rawList = teamData?.data?.result || teamData?.data || [];
    const typesSet = new Set<string>(["Football"]);
    rawList.forEach((t: any) => {
      if (t.teamType) typesSet.add(t.teamType);
    });
    return Array.from(typesSet);
  }, [teamData]);

  const displayedTeams = teamData?.data?.result || teamData?.data || [];
  const totalPages =
    teamData?.pagination?.totalPage || teamData?.meta?.totalPage || 1;

  const teamAnalytics = analyticsData?.data;
  const totalCount =
    teamAnalytics?.totalTeams ?? (teamData?.pagination?.total || teamData?.meta?.total || displayedTeams.length || 0);
  const totalLeaguesCount = teamAnalytics?.totalLeagues ?? allLeagues.length;
  const totalManagersCount = teamAnalytics?.totalManagers ?? allManagers.length;
  const totalEconomy = teamAnalytics?.totalCoins ?? 0;

  return (
    <div className="pt-6 px-6 sm:px-8 space-y-6 max-w-[1600px] mx-auto pb-16">
      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Squads */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Squads
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">
            {totalCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Registered football clubs
          </span>
        </div>

        {/* Active Leagues */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Leagues Covered
            </span>
            <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-2">
            {totalLeaguesCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Competition divisions
          </span>
        </div>

        {/* Assigned Managers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Club Managers
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-2">
            {totalManagersCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Registered team leaders
          </span>
        </div>

        {/* Squad Coins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Coin Economy
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {totalEconomy.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Circulating squad currency
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left: Filters & Search */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search squad or city..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* League Dropdown */}
          <LeagueSelectDropdown
            leagues={allLeagues}
            selectedLeagueId={selectedLeagueId}
            onChange={(lgId) => setSelectedLeagueId(lgId)}
            placeholder="All Leagues"
          />

          {/* Manager Dropdown */}
          <ManagerSelectDropdown
            managers={allManagers}
            selectedManagerId={selectedManagerId}
            onChange={(mgrId) => setSelectedManagerId(mgrId)}
            placeholder="All Managers"
          />

          {/* Team Type Dropdown */}
          <TeamTypeSelectDropdown
            types={uniqueTeamTypes}
            selectedType={selectedTeamType}
            onChange={(t) => setSelectedTeamType(t)}
            placeholder="All Team Types"
          />

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="h-9 px-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/team-management/budget_economay">
            <button
              type="button"
              className="h-9 px-3 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Club Economy</span>
            </button>
          </Link>

          <Link href="/team-management/add-team">
            <button
              type="button"
              className="h-9 px-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Team</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
        {/* Table Subheader */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Squad Registry ({displayedTeams.length} on this page)
          </span>
          <span className="text-[11px] text-slate-400">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="p-4 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-xs text-slate-500">
              Loading registered teams...
            </div>
          ) : displayedTeams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No teams found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try adjusting your search criteria or filter selections.
              </p>
            </div>
          ) : (
            <CustomTable<any>
              columns={getTeamColumns(handleView, handleDelete, handleEditCoin)}
              data={displayedTeams}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Pagination Container */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <CustomPagination TOTAL_PAGES={totalPages} qryName="teamPage" />
        </div>
      </div>

      {/* View Modal */}
      <TeamViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTeam(null);
        }}
        team={singleTeamData?.data || selectedTeam}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Team Deletion"
        description="Are you sure you want to delete this team? All associated squad records will be permanently unlinked."
      />

      {/* Update Coin Modal */}
      <UpdateCoinModal
        isOpen={isCoinModalOpen}
        onClose={() => {
          setIsCoinModalOpen(false);
          setCoinTargetTeam(null);
        }}
        onConfirm={handleConfirmUpdateCoin}
        title="Update Team Coin"
        entityName={coinTargetTeam?.teamName}
        initialValue={coinTargetTeam?.coin ?? 0}
        isLoading={isUpdatingCoin}
      />
    </div>
  );
};

export default TeamManagement;
