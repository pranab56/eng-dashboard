/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Trophy,
  Activity,
  Users,
  Award,
  Plus,
  Search,
  X,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import PlayerVotingModal from "@/components/modals/PlayerVotingModal";
import PlayerVotingResultsModal from "@/components/modals/PlayerVotingResultsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePlayerVotingMutation,
  useDeletePlayerVotingMutation,
  useGetAllPlayerVotingQuery,
  useUpdatePlayerVotingMutation,
} from "@/features/playerVoting/playerVotingApi";
import { useGetAllLeagueQuery, useGetLeagueAgeGroupsQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllAgeGroupQuery } from "@/features/categoryManagement/categoryApi";
import { LeagueSelectDropdown } from "@/components/dropdowns/LeagueSelectDropdown";
import { AgeGroupSelectDropdown } from "@/components/dropdowns/AgeGroupSelectDropdown";
import { useHeaders } from "@/hooks/useHeaders";
import { getPlayerVotingColumns } from "@/tableColumns/playerVotingColumns";
import { TPlayerVoting } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function PlayerVotingManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TPlayerVoting | null>(null);

  // Results modal state
  const [resultsItem, setResultsItem] = useState<TPlayerVoting | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query Leagues safely
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const leagues: any[] = useMemo(() => {
    if (Array.isArray(leaguesData?.data)) return leaguesData.data;
    if (Array.isArray(leaguesData?.data?.result)) return leaguesData.data.result;
    return [];
  }, [leaguesData]);

  // Dynamic Age Groups from DB (Categories + Leagues)
  const { data: ageGroupRes } = useGetAllAgeGroupQuery({});
  const { data: leagueAgeGroupsRes } = useGetLeagueAgeGroupsQuery(undefined);

  const dynamicAgeGroups = useMemo(() => {
    const seen = new Set<string>();
    const uniqueList: string[] = [];

    const addUnique = (val: any) => {
      if (!val || typeof val !== "string") return;
      const trimmed = val.trim();
      if (!trimmed || trimmed.toUpperCase() === "ALL" || trimmed.toLowerCase() === "null") return;
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueList.push(trimmed);
      }
    };

    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    if (Array.isArray(apiCats)) {
      apiCats.forEach((cat: any) => {
        if (Array.isArray(cat?.subCategories) && cat.subCategories.length > 0) {
          cat.subCategories.forEach((sub: any) => addUnique(sub?.name));
        } else {
          const name = cat?.name;
          if (name) addUnique(name);
        }
      });
    }

    const leagueAges = leagueAgeGroupsRes?.data || [];
    if (Array.isArray(leagueAges)) {
      leagueAges.forEach((ag: any) => addUnique(ag));
    }

    if (Array.isArray(leagues)) {
      leagues.forEach((l: any) => {
        if (l?.ageGroup) addUnique(l.ageGroup);
      });
    }

    return uniqueList.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [ageGroupRes, leagueAgeGroupsRes, leagues]);

  // Query Voting Polls
  const queryParams: Record<string, any> = {
    pageNumber: page,
    limit: 10,
    searchValue: searchTerm,
  };
  if (selectedType !== "all") queryParams.type = selectedType;
  if (statusFilter !== "all") queryParams.status = statusFilter;
  if (selectedLeague !== "all") queryParams.league = selectedLeague;
  if (selectedAgeGroup !== "all") queryParams.ageGroup = selectedAgeGroup;

  const { data: votingRes, isLoading } = useGetAllPlayerVotingQuery(queryParams);

  const [createVoting, { isLoading: isCreating }] = useCreatePlayerVotingMutation();
  const [updateVoting, { isLoading: isUpdating }] = useUpdatePlayerVotingMutation();
  const [deleteVoting, { isLoading: isDeleting }] = useDeletePlayerVotingMutation();

  const rawPolls: TPlayerVoting[] = useMemo(() => {
    if (Array.isArray(votingRes?.data)) return votingRes.data;
    if (Array.isArray(votingRes?.data?.result)) return votingRes.data.result;
    return [];
  }, [votingRes]);

  const pagination = votingRes?.pagination || { total: 0, totalPage: 1 };

  // Calculate Overview KPIs
  const kpis = useMemo(() => {
    const totalRounds = pagination.total || rawPolls.length;
    let activePolls = 0;
    let totalVotes = 0;
    let winnersAwarded = 0;

    rawPolls.forEach((p) => {
      const s = (p.status || "").toLowerCase();
      if (s === "active") activePolls += 1;
      if (p.totalVotes) totalVotes += p.totalVotes;
      if (s === "completed" || p.winner) winnersAwarded += 1;
    });

    return { totalRounds, activePolls, totalVotes, winnersAwarded };
  }, [rawPolls, pagination.total]);

  useEffect(() => {
    setHeaders({
      title: "Player Voting Module",
      des: "Player of the Week & Month voting campaigns, statistics, and awards.",
    });
  }, [setHeaders]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TPlayerVoting) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleViewResults = (item: TPlayerVoting) => {
    setResultsItem(item);
    setIsResultsModalOpen(true);
  };

  const handleCloseResultsModal = () => {
    setIsResultsModalOpen(false);
    setResultsItem(null);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleModalSubmit = async (formData: FormData) => {
    try {
      if (editingItem?._id) {
        const res = await updateVoting({
          id: editingItem._id,
          data: formData,
        }).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Voting campaign updated successfully");
          handleCloseModal();
        }
      } else {
        const res = await createVoting(formData).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Voting campaign created successfully");
          handleCloseModal();
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save voting campaign"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteVoting(deleteId).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Voting campaign deleted");
        handleCloseDeleteModal();
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete voting campaign"));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedType("all");
    setSelectedLeague("all");
    setSelectedAgeGroup("all");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    selectedType !== "all" ||
    selectedLeague !== "all" ||
    selectedAgeGroup !== "all";

  const columns = getPlayerVotingColumns(
    handleViewResults,
    handleOpenEditModal,
    handleOpenDeleteModal
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Executive Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Campaigns */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Campaigns
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100/80 text-slate-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpis.totalRounds}
            </span>
            <span className="text-xs text-slate-400">rounds</span>
          </div>
        </div>

        {/* Active Ballots */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Voting
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {kpis.activePolls}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Total Votes */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Votes Cast
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpis.totalVotes.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">ballots</span>
          </div>
        </div>

        {/* Awarded Winners */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Certified Winners
            </span>
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {kpis.winnersAwarded}
            </span>
            <span className="text-xs text-slate-400">awarded</span>
          </div>
        </div>
      </div>

      {/* 2. Main Table Container */}
      <div className="bg-white border border-slate-200/80 rounded-lg overflow-hidden shadow-2xs">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-4">
          {/* Top Row: Status Tabs & Add Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-1 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setSelectedType("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "all" && selectedType === "all"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                All Campaigns
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("active");
                  setSelectedType("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "active"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Active Live
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("WEEK");
                  setStatusFilter("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedType === "WEEK"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Player of the Week
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("MONTH");
                  setStatusFilter("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  selectedType === "MONTH"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Player of the Month
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("completed");
                  setSelectedType("all");
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  statusFilter === "completed"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Closed / Winners
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-98 transition-all text-xs font-semibold shadow-2xs border border-slate-900 cursor-pointer shrink-0 select-none"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>Add Campaign</span>
            </button>
          </div>

          {/* Bottom Row: Search & Dropdown Filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search voting campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50/60 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Custom Competition League Dropdown */}
              <div className="w-48">
                <LeagueSelectDropdown
                  leagues={leagues}
                  selectedLeagueId={selectedLeague === "all" ? "" : selectedLeague}
                  onChange={(val) => setSelectedLeague(val || "all")}
                  placeholder="All Leagues"
                />
              </div>

              {/* Custom Age Group Dropdown */}
              <div className="w-36">
                <AgeGroupSelectDropdown
                  groups={dynamicAgeGroups}
                  selectedGroup={selectedAgeGroup}
                  onChange={setSelectedAgeGroup}
                  placeholder="All Age Groups"
                />
              </div>

              {/* Status */}
              <div className="w-32">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full h-8 text-xs bg-slate-50/60 border-slate-200 rounded-md">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="upcoming" className="text-xs">Scheduled</SelectItem>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="completed" className="text-xs">Closed</SelectItem>
                    <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  title="Reset filters"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <CustomTable
            columns={columns}
            data={rawPolls}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Showing {rawPolls.length} of {pagination.total || rawPolls.length} campaigns
          </div>
          <CustomPagination TOTAL_PAGES={pagination.totalPage || 1} />
        </div>
      </div>

      {/* Add / Edit Campaign Modal */}
      <PlayerVotingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Live Results Standings Modal */}
      <PlayerVotingResultsModal
        isOpen={isResultsModalOpen}
        onClose={handleCloseResultsModal}
        voting={resultsItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Voting Campaign"
        description="Are you sure you want to delete this voting campaign? All cast ballots and standings for this round will be permanently removed."
      />
    </div>
  );
}
