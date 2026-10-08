/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  Plus,
  Trophy,
  Activity,
  CalendarClock,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteLeagueMutation,
  useGetAllLeagueQuery,
  useGetLeagueAnalyticsQuery,
  useGetLeagueAgeGroupsQuery,
} from "@/features/leagueManagement/leagueApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getLeagueColumns } from "@/tableColumns/leagueColumns";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import LeagueViewModal from "./LeagueViewModal";
import { useGetAllAgeGroupQuery } from "@/features/categoryManagement/categoryApi";
import { AgeGroupSelectDropdown } from "@/components/dropdowns/AgeGroupSelectDropdown";

type StatusTab = "all" | "running" | "upcoming" | "finished";

const LeagueManagement = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("leaguePage") || "1";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("ALL");
  const { data: ageGroupRes } = useGetAllAgeGroupQuery({});
  const { data: leagueAgeGroupsRes } = useGetLeagueAgeGroupsQuery(undefined);

  // 1. Fetch backend-calculated analytics (accurate across all pages)
  const { data: analyticsData } = useGetLeagueAnalyticsQuery(
    selectedAgeGroup !== "ALL" ? { ageGroup: selectedAgeGroup } : undefined
  );
  const backendStats = analyticsData?.data || {
    total: 0,
    running: 0,
    upcoming: 0,
    finished: 0,
  };

  // 2. Fetch paginated league data with server-side status & search filtering
  const { data: leagueData, isLoading } = useGetAllLeagueQuery({
    page: page,
    searchValue: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter,
    ageGroup: selectedAgeGroup !== "ALL" ? selectedAgeGroup : "",
  });

  const [deleteLeague, { isLoading: isDeleting }] = useDeleteLeagueMutation();

  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "League Registry",
      des: "Manage league seasons, tournament timelines, and competition records.",
    });
  }, []);

  const handleAgeGroupChange = (group: string) => {
    setSelectedAgeGroup(group);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaguePage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleTabChange = (tab: StatusTab) => {
    setStatusFilter(tab);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaguePage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaguePage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleView = (league: any) => {
    setSelectedLeague(league);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteLeague(deletingId).unwrap();
      if (res?.success || res?.statusCode === 200) {
        toast.success(res?.message || "League deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete league");
    }
  };

  // Extract raw leagues safely from backend response
  const rawLeagues: any[] = useMemo(() => {
    if (Array.isArray(leagueData?.data)) {
      return leagueData.data;
    }
    if (Array.isArray(leagueData?.data?.result)) {
      return leagueData.data.result;
    }
    return [];
  }, [leagueData]);

  // True system stats calculated on the backend
        // Fetch all unique age groups across categories and leagues (deduplicated strictly)
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

    // 1. From database categories - extract subcategory age groups
    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    if (Array.isArray(apiCats)) {
      apiCats.forEach((cat: any) => {
        if (Array.isArray(cat?.subCategories) && cat.subCategories.length > 0) {
          cat.subCategories.forEach((sub: any) => addUnique(sub?.name));
        } else {
          // If no subcategories, only add if it is actually an age group (not a tournament/league name)
          const name = cat?.name;
          if (
            name &&
            (/^(u|under\s*)\d+/i.test(name) ||
             /^(senior|junior|open|adult|veteran)/i.test(name) ||
             /\d+\s*(year|yr)/i.test(name))
          ) {
            addUnique(name);
          }
        }
      });
    }

    // 2. From all leagues in DB
    const leagueAges = leagueAgeGroupsRes?.data || [];
    if (Array.isArray(leagueAges)) {
      leagueAges.forEach((ag: any) => addUnique(ag));
    }

    // 3. From current page leagues (fallback)
    rawLeagues.forEach((l: any) => {
      addUnique(l?.ageGroup);
    });

    // Fallback if none exist yet
    if (uniqueList.length === 0) {
      ["u7", "u8", "u9", "u10", "u11", "u12", "u13", "u14", "Senior"].forEach(addUnique);
    }

    // Natural numerical sort
    return uniqueList.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
  }, [ageGroupRes, leagueAgeGroupsRes, rawLeagues]);

  const stats = {
    total: backendStats?.total ?? 0,
    running: backendStats?.running ?? 0,
    upcoming: backendStats?.upcoming ?? 0,
    finished: backendStats?.finished ?? 0,
  };

  const hasActiveFilters =
    statusFilter !== "all" || selectedAgeGroup !== "ALL" || searchTerm.trim().length > 0;

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSelectedAgeGroup("ALL");
    setSearchTerm("");
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("leaguePage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const totalPages = leagueData?.pagination?.totalPage || 1;
  const totalCountForCurrentView =
    statusFilter === "all"
      ? stats.total
      : statusFilter === "running"
      ? stats.running
      : statusFilter === "upcoming"
      ? stats.upcoming
      : stats.finished;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Executive Summary KPI Strip (True Backend Totals) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Seasons */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Leagues
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100/80 text-slate-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">seasons</span>
          </div>
        </div>

        {/* Running */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Running
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {stats.running}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active
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
              {stats.upcoming}
            </span>
            <span className="text-xs text-slate-400">scheduled</span>
          </div>
        </div>

        {/* Finished */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Finished
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-700 tabular-nums">
              {stats.finished}
            </span>
            <span className="text-xs text-slate-400">completed</span>
          </div>
        </div>
      </div>

      {/* 2. Main League Registry Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* Integrated Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>All Seasons</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "all"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {stats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("running")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "running"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Running</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "running"
                    ? "bg-emerald-800 text-emerald-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {stats.running}
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
                {stats.upcoming}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("finished")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "finished"
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Finished</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "finished"
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {stats.finished}
              </span>
            </button>
          </div>

          {/* Search, Age Group & Add League Action */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <AgeGroupSelectDropdown
              groups={dynamicAgeGroups}
              selectedGroup={selectedAgeGroup}
              onChange={handleAgeGroupChange}
              placeholder="All Age Groups"
            />
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search league name, season..."
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

            <Link
              href="/league-management/create-league"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-98 transition-all text-xs font-semibold shadow-2xs border border-slate-900 cursor-pointer shrink-0 select-none"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>Add League</span>
            </Link>
          </div>
        </div>

        {/* Active Filter Hint (if active) */}
        {hasActiveFilters && (
          <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Active filter:</span>
              {selectedAgeGroup !== "ALL" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  Age: {selectedAgeGroup}
                </span>
              )}
              {statusFilter !== "all" && (
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
                ({leagueData?.pagination?.total ?? rawLeagues.length} total matching)
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

        {/* Table View */}
        <div className="overflow-x-auto">
          <CustomTable<any>
            columns={getLeagueColumns(handleView, handleDelete)}
            data={rawLeagues}
            isLoading={isLoading}
          />
        </div>

        {/* Empty state when query returns no results */}
        {!isLoading && rawLeagues.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No league seasons found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No leagues match your selected search or status criteria. Try resetting the filters."
                : "No leagues have been created yet. Click 'Add League' to register your first season."}
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
              <Link
                href="/league-management/create-league"
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300" />
                <span>Add First League</span>
              </Link>
            )}
          </div>
        )}

        {/* Integrated Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{rawLeagues.length}</span>{" "}
            on this page of{" "}
            <span className="font-semibold text-slate-800">
              {leagueData?.pagination?.total ?? totalCountForCurrentView}
            </span>{" "}
            total {statusFilter !== "all" ? `${statusFilter} ` : ""}leagues
          </div>
          <CustomPagination TOTAL_PAGES={totalPages} qryName="leaguePage" />
        </div>
      </div>

      {/* View Modal */}
      <LeagueViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        league={selectedLeague}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete League Season"
        description="Are you sure you want to delete this league? All associated teams, fixtures, and competition records will be permanently removed. This action cannot be undone."
      />
    </div>
  );
};

export default LeagueManagement;
