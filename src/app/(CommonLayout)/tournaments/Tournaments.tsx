/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dayjs from "dayjs";
import {
  Trophy,
  Calendar,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Search,
  X,
  Plus,
  Award,
  UserCheck,
  RotateCcw,
  Activity,
  CalendarClock,
  CheckCircle2,
  Coins,
  ChevronsDownUp,
  ChevronsUpDown,
} from "lucide-react";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import {
  useCreateTourNamentsMutation,
  useDeleteTourNamentsMutation,
  useGetAllTournamentsQuery,
  useGetTournamentAnalyticsQuery,
  useUpdateTourNamentsMutation,
} from "@/features/tournaments/tournamentsApi";
import { useHeaders } from "@/hooks/useHeaders";
import { TTournament, TPositionReward } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import TournamentFormModal from "./TournamentFormModal";
import TournamentViewModal from "./TournamentViewModal";
import TournamentRedeemedWinnersModal from "./TournamentRedeemedWinnersModal";

type StatusTab = "ALL" | "active" | "upcoming" | "completed";

export default function Tournaments() {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("ALL");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // 1. Backend-calculated analytics (accurate across all pages)
  const { data: analyticsData } = useGetTournamentAnalyticsQuery(undefined);
  const backendStats = analyticsData?.data || {
    total: 0,
    active: 0,
    upcoming: 0,
    completed: 0,
  };

  // 2. Server-side paginated & filtered tournament query
  const { data: tournamentRes, isLoading } = useGetAllTournamentsQuery({
    page: page,
    searchValue: searchTerm,
    status: statusFilter === "ALL" ? "" : statusFilter,
  });

  const [createTourNaments, { isLoading: isCreating }] =
    useCreateTourNamentsMutation();
  const [updateTourNaments, { isLoading: isUpdating }] =
    useUpdateTourNamentsMutation();
  const [deleteTourNaments, { isLoading: isDeleting }] =
    useDeleteTourNamentsMutation();

  // Modals & Selection States
  const [selectedTournament, setSelectedTournament] =
    useState<TTournament | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [winnersTournament, setWinnersTournament] =
    useState<TTournament | null>(null);
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] =
    useState<TTournament | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Tournament Hierarchy",
      des: "Visual node structure and reward tree branches for competitive events.",
    });
  }, [setHeaders]);

  const rawTournaments: TTournament[] = useMemo(() => {
    if (Array.isArray(tournamentRes?.data)) {
      return tournamentRes.data;
    }
    if (Array.isArray(tournamentRes?.data?.result)) {
      return tournamentRes.data.result;
    }
    return [];
  }, [tournamentRes]);

  // Initial expand: expand first tournament by default for immediate preview
  useEffect(() => {
    if (rawTournaments.length > 0 && Object.keys(expandedNodes).length === 0) {
      const firstId = rawTournaments[0]._id || (rawTournaments[0] as any).id;
      if (firstId) {
        setExpandedNodes({ [firstId]: true });
      }
    }
  }, [rawTournaments]);

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleToggleExpandAll = () => {
    const allExpanded = rawTournaments.every(
      (t) => expandedNodes[t._id || (t as any).id || ""]
    );
    const nextState: Record<string, boolean> = {};
    rawTournaments.forEach((t) => {
      const id = t._id || (t as any).id || "";
      nextState[id] = !allExpanded;
    });
    setExpandedNodes(nextState);
  };

  const handleTabChange = (tab: StatusTab) => {
    setStatusFilter(tab);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("ALL");
    setSearchTerm("");
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Handlers
  const handleView = (tournament: TTournament) => {
    setSelectedTournament(tournament);
    setIsViewModalOpen(true);
  };

  const handleViewWinners = (tournament: TTournament) => {
    setWinnersTournament(tournament);
    setIsWinnersModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingTournament(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tournament: TTournament) => {
    setEditingTournament(tournament);
    setIsFormModalOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    prizeCoins?: number;
    positionRewards: TPositionReward[];
    id?: string;
  }) => {
    try {
      const body = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        prizeCoins: data.prizeCoins,
        positionRewards: data.positionRewards,
      };

      if (data.id) {
        const res = await updateTourNaments({
          id: data.id,
          body: body,
        }).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Tournament updated successfully");
          setIsFormModalOpen(false);
        }
      } else {
        const res = await createTourNaments(body).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Tournament created successfully");
          setIsFormModalOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save tournament"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteTourNaments(deletingId).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Tournament deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete tournament"));
    }
  };

  const totalPages =
    tournamentRes?.pagination?.totalPage ||
    tournamentRes?.data?.meta?.totalPage ||
    1;

  const totalRecords =
    tournamentRes?.pagination?.total ||
    tournamentRes?.data?.meta?.total ||
    backendStats.total;

  const hasActiveFilters =
    statusFilter !== "ALL" || searchTerm.trim().length > 0;

  const allExpanded =
    rawTournaments.length > 0 &&
    rawTournaments.every((t) => expandedNodes[t._id || (t as any).id || ""]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Executive Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Tournaments */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Tournaments
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {backendStats.total}
            </span>
            <span className="text-xs text-slate-400">competitions</span>
          </div>
        </div>

        {/* Ongoing */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Ongoing
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {backendStats.active}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Upcoming */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Upcoming
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700 tabular-nums">
              {backendStats.upcoming}
            </span>
            <span className="text-xs text-slate-400">scheduled</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-700 tabular-nums">
              {backendStats.completed}
            </span>
            <span className="text-xs text-slate-400">finished</span>
          </div>
        </div>
      </div>

      {/* 2. Main Tournament Tree Hierarchy Panel */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* Integrated Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange("ALL")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>All Tournaments</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "ALL"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("active")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "active"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Ongoing</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "active"
                    ? "bg-emerald-800 text-emerald-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("upcoming")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "upcoming"
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Upcoming</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "upcoming"
                    ? "bg-blue-800 text-blue-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.upcoming}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("completed")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "completed"
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Completed</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "completed"
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.completed}
              </span>
            </button>
          </div>

          {/* Search + Controls */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search tournament, rank..."
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50/60 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Expand / Collapse All Toggle */}
            {rawTournaments.length > 0 && (
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md hover:bg-slate-50 active:scale-98 transition-all text-xs font-semibold text-slate-700 shadow-2xs cursor-pointer shrink-0"
                title={allExpanded ? "Collapse All Nodes" : "Expand All Nodes"}
              >
                {allExpanded ? (
                  <>
                    <ChevronsDownUp className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Expand</span>
                  </>
                )}
              </button>
            )}

            {/* Create Tournament Action Button */}
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-98 transition-all text-xs font-semibold shadow-2xs border border-slate-900 cursor-pointer shrink-0 select-none"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>Create Tournament</span>
            </button>
          </div>
        </div>

        {/* Active Filter Hint */}
        {hasActiveFilters && (
          <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Active filter:</span>
              {statusFilter !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium capitalize">
                  Status: {statusFilter}
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  Search: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
              <span className="text-slate-400">
                ({totalRecords} total matching)
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Tree Nodes List Section */}
        {isLoading ? (
          <div className="p-10 space-y-4 animate-pulse">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        ) : rawTournaments.length === 0 ? (
          <div className="py-14 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No tournaments found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No tournament matches your selected search or status criteria. Try resetting filters."
                : "No tournaments have been registered yet. Click 'Create Tournament' to establish your first event."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300" />
                <span>Create First Tournament</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-3.5 bg-slate-50/30">
            {rawTournaments.map((tournament) => {
              const nodeKey = tournament._id || (tournament as any).id || "";
              const isExpanded = !!expandedNodes[nodeKey];
              const rewards = tournament.positionRewards || [];

              const start = tournament.startDate
                ? dayjs(tournament.startDate).format("DD MMM, YYYY")
                : "N/A";
              const end = tournament.endDate
                ? dayjs(tournament.endDate).format("DD MMM, YYYY")
                : "N/A";

              const rawStatus = (tournament.status || "upcoming").toLowerCase();
              const isLive = rawStatus === "active" || rawStatus === "ongoing";
              const isDone = rawStatus === "completed" || rawStatus === "finished";

              let statusBadge = {
                label: "Upcoming",
                dot: "bg-blue-500",
                classes: "bg-blue-50 text-blue-700 border-blue-200",
              };
              if (isLive) {
                statusBadge = {
                  label: "Ongoing",
                  dot: "bg-emerald-500",
                  classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
                };
              } else if (isDone) {
                statusBadge = {
                  label: "Completed",
                  dot: "bg-slate-400",
                  classes: "bg-slate-100 text-slate-700 border-slate-200",
                };
              }

              return (
                <div
                  key={nodeKey}
                  className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden transition-all"
                >
                  {/* Root Node Header */}
                  <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white">
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Expand / Collapse Button */}
                      <button
                        type="button"
                        onClick={() => toggleNodeExpand(nodeKey)}
                        className={`mt-0.5 p-1 rounded-md text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0 ${
                          isExpanded
                            ? "bg-slate-100 text-slate-900"
                            : "hover:bg-slate-100"
                        }`}
                        title={isExpanded ? "Collapse Branches" : "Expand Branches"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {/* Tournament Identity */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleNodeExpand(nodeKey)}
                            className="text-left font-bold text-slate-900 text-xs sm:text-sm hover:text-slate-700 transition-colors cursor-pointer truncate"
                          >
                            {tournament.title}
                          </button>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.2 rounded-full text-[11px] font-semibold border ${statusBadge.classes}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} ${
                                isLive ? "animate-pulse" : ""
                              }`}
                            />
                            {statusBadge.label}
                          </span>

                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.2 rounded border border-slate-200/80 inline-flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-slate-400" />
                            {rewards.length} Ranks
                          </span>

                          {tournament.prizeCoins !== undefined && (
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 px-2 py-0.2 rounded border border-slate-200 inline-flex items-center gap-1">
                              <Coins className="w-3 h-3 text-amber-500" />
                              {tournament.prizeCoins.toLocaleString()} Coins
                            </span>
                          )}
                        </div>

                        {/* Subtitle / Schedule Row */}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 flex-wrap">
                          <div className="flex items-center gap-1 text-[11px]">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>
                              {start} &mdash; {end}
                            </span>
                          </div>

                          {tournament.description && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-[11px] text-slate-400 truncate max-w-md">
                                {tournament.description}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Node Action Buttons */}
                    <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => handleViewWinners(tournament)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                        title="View Redeemed Winners"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Winners</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleView(tournament)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors cursor-pointer"
                        title="View QR Codes & Rewards"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tournament)}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
                        title="Edit Tournament"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTrigger(nodeKey)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md border border-slate-200 transition-colors cursor-pointer"
                        title="Delete Tournament"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tree Hierarchy Children (Position Rewards Branch Nodes) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 bg-slate-50/60 border-t border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-slate-500" />
                          <span>Placement Rank Hierarchy ({rewards.length} branches)</span>
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Scan QR Code to redeem coins
                        </span>
                      </div>

                      {rewards.length === 0 ? (
                        <div className="text-xs text-slate-400 italic bg-white p-3 rounded-md border border-slate-200">
                          No position rewards configured for this tournament event.
                        </div>
                      ) : (
                        <div className="space-y-2 relative pl-5">
                          {/* Tree Vertical Guide Line */}
                          <div className="absolute left-2.5 top-3 bottom-3 w-px bg-slate-200" />

                          {rewards.map((reward, rIdx) => {
                            const is1st = reward.position === 1;
                            const is2nd = reward.position === 2;
                            const is3rd = reward.position === 3;

                            let rankBadge = (
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                Rank #{reward.position}
                              </span>
                            );

                            if (is1st) {
                              rankBadge = (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                                  1st Place
                                </span>
                              );
                            } else if (is2nd) {
                              rankBadge = (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-300">
                                  2nd Place
                                </span>
                              );
                            } else if (is3rd) {
                              rankBadge = (
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-50/60 text-amber-900 border border-amber-200">
                                  3rd Place
                                </span>
                              );
                            }

                            return (
                              <div
                                key={rIdx}
                                className="relative flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-md border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors gap-3"
                              >
                                {/* Tree Horizontal Connector Branch */}
                                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-px bg-slate-200" />

                                <div className="flex items-center gap-2.5 min-w-0">
                                  {rankBadge}
                                  <div>
                                    <h5 className="font-semibold text-xs text-slate-900 truncate">
                                      {reward.positionName}
                                    </h5>
                                    <p className="text-[10px] text-slate-400 font-mono">
                                      Official rank position #{reward.position}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded shadow-2xs">
                                    <Coins className="w-3 h-3 text-amber-500" />
                                    <span>{reward.points.toLocaleString()} Coins</span>
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{rawTournaments.length}</span>{" "}
            on this page of{" "}
            <span className="font-semibold text-slate-800">{totalRecords}</span>{" "}
            total {statusFilter !== "ALL" ? `${statusFilter} ` : ""}tournaments
          </div>
          <CustomPagination TOTAL_PAGES={totalPages} qryName="page" />
        </div>
      </div>

      {/* View Tournament Modal */}
      <TournamentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        tournament={selectedTournament}
      />

      {/* Redeemed Winners Modal */}
      <TournamentRedeemedWinnersModal
        isOpen={isWinnersModalOpen}
        onClose={() => setIsWinnersModalOpen(false)}
        tournament={winnersTournament}
      />

      {/* Create / Edit Form Modal */}
      <TournamentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingTournament={editingTournament}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Tournament"
        description="Are you sure you want to permanently delete this tournament and its prize tree branches? This action cannot be undone."
      />
    </div>
  );
}
