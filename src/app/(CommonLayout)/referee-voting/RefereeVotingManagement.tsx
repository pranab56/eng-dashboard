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
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import RefereeVotingModal from "@/components/modals/RefereeVotingModal";
import RefereeVotingResultsModal from "@/components/modals/RefereeVotingResultsModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateRefereeVotingMutation,
  useDeleteRefereeVotingMutation,
  useGetAllRefereeVotingQuery,
  useUpdateRefereeVotingMutation,
} from "@/features/refereeVoting/refereeVotingApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getRefereeVotingColumns } from "@/tableColumns/refereeVotingColumns";
import { TRefereeVoting } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function RefereeVotingManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLeague, setSelectedLeague] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TRefereeVoting | null>(null);

  // Results modal state
  const [resultsItem, setResultsItem] = useState<TRefereeVoting | null>(null);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);

  // Delete modal states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Query Leagues
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const leagues: any[] = useMemo(() => {
    if (Array.isArray(leaguesData?.data)) return leaguesData.data;
    if (Array.isArray(leaguesData?.data?.result)) return leaguesData.data.result;
    return [];
  }, [leaguesData]);

  // Query Referee Voting Polls
  const queryParams: Record<string, any> = {
    pageNumber: page,
    limit: 10,
    searchValue: searchTerm,
  };
  if (selectedType !== "all") queryParams.votingType = selectedType;
  if (statusFilter !== "all") queryParams.status = statusFilter;
  if (selectedLeague !== "all") queryParams.league = selectedLeague;

  const { data: votingRes, isLoading } = useGetAllRefereeVotingQuery(queryParams);

  const [createVoting, { isLoading: isCreating }] = useCreateRefereeVotingMutation();
  const [updateVoting, { isLoading: isUpdating }] = useUpdateRefereeVotingMutation();
  const [deleteVoting, { isLoading: isDeleting }] = useDeleteRefereeVotingMutation();

  const rawPolls: TRefereeVoting[] = useMemo(() => {
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
      title: "Referee Voting Module",
      des: "Referee of the Week & Month voting campaigns, standings, and fair play recognition.",
    });
  }, [setHeaders]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TRefereeVoting) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleViewResults = (item: TRefereeVoting) => {
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
          toast.success(res?.message || "Referee voting campaign updated successfully");
          handleCloseModal();
        }
      } else {
        const res = await createVoting(formData).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Referee voting campaign created successfully");
          handleCloseModal();
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save referee voting campaign"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteVoting(deleteId).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Referee voting campaign deleted");
        handleCloseDeleteModal();
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete referee voting campaign"));
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedType("all");
    setSelectedLeague("all");
  };

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    selectedType !== "all" ||
    selectedLeague !== "all";

  const columns = useMemo(
    () =>
      getRefereeVotingColumns(
        handleViewResults,
        handleOpenEditModal,
        handleOpenDeleteModal
      ),
    []
  );

  return (
    <div className="space-y-6">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Rounds */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Campaigns
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {kpis.totalRounds}
            </span>
            <span className="text-[11px] text-slate-500">all time</span>
          </div>
        </div>

        {/* Card 2: Active Polls */}
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
              Live & Active
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-950">
              {kpis.activePolls}
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">voting open</span>
          </div>
        </div>

        {/* Card 3: Total Votes Cast */}
        <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800 uppercase tracking-wider">
              Total Votes Cast
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-indigo-950 font-mono">
              {kpis.totalVotes}
            </span>
            <span className="text-[11px] text-indigo-700 font-medium">community votes</span>
          </div>
        </div>

        {/* Card 4: Winners Awarded */}
        <div className="relative overflow-hidden rounded-xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">
              Winners Crowned
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-950">
              {kpis.winnersAwarded}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">completed polls</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns by title, season, month..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] focus:bg-white text-slate-800 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Action Button: Create New Poll */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#800020] hover:bg-[#68001a] rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Referee Poll
          </button>
        </div>

        {/* Filter Dropdowns Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Type Filter */}
          <div className="w-36">
            <Select value={selectedType} onValueChange={(val) => setSelectedType(val)}>
              <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Periods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Periods</SelectItem>
                <SelectItem value="WEEK">Week Rounds</SelectItem>
                <SelectItem value="MONTH">Month Rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-36">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* League Filter */}
          <div className="w-44">
            <Select value={selectedLeague} onValueChange={(val) => setSelectedLeague(val)}>
              <SelectTrigger className="h-8 text-xs bg-slate-50 border-slate-200">
                <SelectValue placeholder="All Leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                {leagues.map((l) => (
                  <SelectItem key={l._id} value={l._id}>
                    {l.leagueName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <CustomTable
          columns={columns}
          data={rawPolls}
          isLoading={isLoading}
        />

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100">
          <CustomPagination
            total={pagination.total || 0}
            totalPage={pagination.totalPage || 1}
          />
        </div>
      </div>

      {/* Modals */}
      <RefereeVotingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      <RefereeVotingResultsModal
        isOpen={isResultsModalOpen}
        onClose={handleCloseResultsModal}
        votingItem={resultsItem}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Referee Voting Poll"
        message="Are you sure you want to permanently delete this referee voting campaign? All associated voting records will also be erased."
      />
    </div>
  );
}
