/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import {
  Trophy,
  Activity,
  Clock,
  CheckCircle2,
  Calendar,
  Filter,
  RefreshCw,
  Search,
  X,
  Plus,
  ChevronDown,
  Check,
  MapPin,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import { useGetAllVenueCategoryQuery } from "@/features/categoryManagement/categoryApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllTeamQuery } from "@/features/teamManagement/teamApi";
import {
  useDeleteMatchMutation,
  useGetAllMatchQuery,
  useGetMatchOverviewQuery,
  useGetMatchScheduleDatesQuery,
} from "@/features/match/matchApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getMatchColumns } from "@/tableColumns/matchColumns";
import { formatImagePath } from "@/utils/formatImagePath";

import DeleteConfirmModal from "./DeleteConfirmModal";
import MatchViewModal from "./MatchViewModal";
import ModifyScoreModal from "./ModifyScoreModal";
import CleanSheetModal from "./CleanSheetModal";
import RatingRuleModal from "./RatingRuleModal";
import UpdateStatusModal from "./UpdateStatusModal";

interface OptionItem {
  label: string;
  value: string;
  logo?: string | null;
}

const CustomSearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select Option",
  className = "",
}: {
  label?: string;
  value: string;
  onChange: (val: string, option?: OptionItem) => void;
  options: OptionItem[];
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(40);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    setDisplayCount(40);
  }, [query, isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 60) {
      if (displayCount < filteredOptions.length) {
        setDisplayCount((prev) => Math.min(prev + 40, filteredOptions.length));
      }
    }
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const displayedOptions = filteredOptions.slice(0, displayCount);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-2.5 text-xs border border-slate-200 rounded-md bg-white hover:bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors flex items-center justify-between text-left cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.logo && (
            <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 border border-slate-200">
              <Image
                src={formatImagePath(selectedOption.logo)}
                alt="logo"
                width={16}
                height={16}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <span className="truncate text-xs font-medium text-slate-800">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 space-y-1.5 animate-in fade-in-50 duration-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full h-7 pl-7 pr-6 text-xs border border-slate-200 rounded bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5"
          >
            {displayedOptions.length > 0 ? (
              <>
                {displayedOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onChange(opt.value, opt);
                        setIsOpen(false);
                        setQuery("");
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 text-xs rounded transition-colors text-left cursor-pointer ${
                        isSelected
                          ? "bg-slate-900 text-white font-medium"
                          : "hover:bg-slate-100 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.logo && (
                          <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-slate-200">
                            <Image
                              src={formatImagePath(opt.logo)}
                              alt="logo"
                              width={14}
                              height={14}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="py-2.5 text-center text-xs text-slate-400">
                No matching options
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MatchManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const urlPageParam = searchParams.get("matchPage");

  // Filters State
  const [leagueFilter, setLeagueFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [matchDateStatusFilter, setMatchDateStatusFilter] = useState<string>("ALL");
  const [venueFilter, setVenueFilter] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [unplayedOnly, setUnplayedOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const [filterLabels, setFilterLabels] = useState<Record<string, string>>({});
  const [isFiltersRestored, setIsFiltersRestored] = useState<boolean>(false);

  // Restore saved filters from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("match_management_filters");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.leagueFilter !== undefined) setLeagueFilter(parsed.leagueFilter);
        if (parsed.dateFilter !== undefined) setDateFilter(parsed.dateFilter);
        if (parsed.statusFilter !== undefined) setStatusFilter(parsed.statusFilter);
        if (parsed.matchDateStatusFilter !== undefined)
          setMatchDateStatusFilter(parsed.matchDateStatusFilter);
        if (parsed.venueFilter !== undefined) setVenueFilter(parsed.venueFilter);
        if (parsed.teamFilter !== undefined) setTeamFilter(parsed.teamFilter);
        if (parsed.unplayedOnly !== undefined) setUnplayedOnly(parsed.unplayedOnly);
        if (parsed.searchTerm !== undefined) {
          setSearchTerm(parsed.searchTerm);
          setDebouncedSearchTerm(parsed.searchTerm);
        }
        if (parsed.labels) {
          setFilterLabels(parsed.labels);
        }
      }
    } catch (e) {
      console.error("Failed to restore match filters:", e);
    } finally {
      setIsFiltersRestored(true);
    }
  }, []);

  // Persist filters to sessionStorage
  useEffect(() => {
    if (!isFiltersRestored) return;
    try {
      const stateToSave = {
        leagueFilter,
        dateFilter,
        statusFilter,
        matchDateStatusFilter,
        venueFilter,
        teamFilter,
        unplayedOnly,
        searchTerm,
        labels: filterLabels,
      };
      sessionStorage.setItem("match_management_filters", JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to persist match filters:", e);
    }
  }, [
    isFiltersRestored,
    leagueFilter,
    dateFilter,
    statusFilter,
    matchDateStatusFilter,
    venueFilter,
    teamFilter,
    unplayedOnly,
    searchTerm,
    filterLabels,
  ]);

  const resetPageInUrl = () => {
    if (urlPageParam && urlPageParam !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("matchPage");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleSetLeagueFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setLeagueFilter(val);
    if (opt) setFilterLabels((prev) => ({ ...prev, league: opt.label }));
  };

  const handleSetDateFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setDateFilter(val);
    if (opt) setFilterLabels((prev) => ({ ...prev, date: opt.label }));
  };

  const handleSetStatusFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setStatusFilter(val);
    if (opt) setFilterLabels((prev) => ({ ...prev, status: opt.label }));
  };

  const handleSetMatchDateStatusFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setMatchDateStatusFilter(val);
    if (opt) setFilterLabels((prev) => ({ ...prev, matchDateStatus: opt.label }));
  };

  const handleSetVenueFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setVenueFilter(val);
    if (opt) setFilterLabels((prev) => ({ ...prev, venue: opt.label }));
  };

  const handleSetTeamFilter = (val: string, opt?: OptionItem) => {
    resetPageInUrl();
    setTeamFilter(val);
    if (opt)
      setFilterLabels((prev) => ({
        ...prev,
        team: opt.label,
        teamLogo: opt.logo || "",
      }));
  };

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) resetPageInUrl();
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Queries
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetMatchOverviewQuery(undefined);

  const { data: leagueData } = useGetAllLeagueQuery({ limit: 1000 });
  const { data: teamData } = useGetAllTeamQuery({ limit: 1000 });
  const { data: venueCategoryData } = useGetAllVenueCategoryQuery({});

  const allLeagues: any[] = leagueData?.data?.result || leagueData?.data || [];
  const allTeams: any[] = teamData?.data?.result || teamData?.data || [];
  const venueList: any[] = venueCategoryData?.data || [];

  const competitionOptions: OptionItem[] = useMemo(() => {
    const list: OptionItem[] = [
      { label: "Competition : All", value: "ALL" },
      ...allLeagues.map((item: any) => ({
        label: item.season ? `${item.leagueName} (${item.season})` : item.leagueName,
        value: item._id,
      })),
    ];
    if (leagueFilter !== "ALL" && !list.some((o) => o.value === leagueFilter)) {
      list.push({ label: filterLabels.league || "Selected Competition", value: leagueFilter });
    }
    return list;
  }, [allLeagues, leagueFilter, filterLabels.league]);

  const { data: scheduleDatesData } = useGetMatchScheduleDatesQuery({
    ...(leagueFilter !== "ALL" && { league: leagueFilter, leagueId: leagueFilter }),
    ...(teamFilter !== "ALL" && { team: teamFilter, teamId: teamFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(unplayedOnly && { unplayedOnly: "true" }),
  });

  const availableScheduleDates: { date: string; label: string; matchCount: number }[] =
    scheduleDatesData?.data || [];

  const dateOptions: OptionItem[] = useMemo(() => {
    const list: OptionItem[] = [{ label: "Date : All", value: "ALL" }];

    if (availableScheduleDates.length > 0) {
      availableScheduleDates.forEach((item) => {
        list.push({
          label: item.label,
          value: item.date,
        });
      });
    }

    if (dateFilter !== "ALL" && !list.some((o) => o.value === dateFilter)) {
      list.push({ label: filterLabels.date || dateFilter, value: dateFilter });
    }

    return list;
  }, [availableScheduleDates, dateFilter, filterLabels.date]);

  const statusOptions: OptionItem[] = [
    { label: "Status : All", value: "ALL" },
    { label: "Upcoming / Scheduled", value: "upcoming" },
    { label: "Live In-Play", value: "live" },
    { label: "Half Time", value: "half_time" },
    { label: "Finished", value: "finished" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const matchDateStatusOptions: OptionItem[] = [
    { label: "Match Date : All", value: "ALL" },
    { label: "Today's Matches", value: "today" },
    { label: "This Week's Matches", value: "this_week" },
    { label: "Upcoming Matches", value: "upcoming" },
    { label: "Past Matches", value: "past" },
  ];

  const venueOptions: OptionItem[] = useMemo(() => {
    const list: OptionItem[] = [
      { label: "Venue : All", value: "ALL" },
      ...venueList.map((v: any) => ({
        label: v.name,
        value: v._id || v.id,
      })),
    ];
    if (venueFilter !== "ALL" && !list.some((o) => o.value === venueFilter)) {
      list.push({ label: filterLabels.venue || "Selected Venue", value: venueFilter });
    }
    return list;
  }, [venueList, venueFilter, filterLabels.venue]);

  const teamOptions: OptionItem[] = useMemo(() => {
    const list: OptionItem[] = [
      { label: "Team : All", value: "ALL" },
      ...allTeams.map((t: any) => ({
        label: t.teamName,
        value: t._id,
        logo: t.teamLogo || null,
      })),
    ];
    if (teamFilter !== "ALL" && !list.some((o) => o.value === teamFilter)) {
      list.push({
        label: filterLabels.team || "Selected Team",
        value: teamFilter,
        logo: filterLabels.teamLogo || null,
      });
    }
    return list;
  }, [allTeams, teamFilter, filterLabels.team, filterLabels.teamLogo]);

  const isExactDate = /^\d{4}-\d{2}-\d{2}$/.test(dateFilter);
  const effectiveDateStatus =
    !isExactDate && dateFilter !== "ALL" ? dateFilter : matchDateStatusFilter;

  const page = urlPageParam || "1";

  const queryParams = {
    page,
    ...(leagueFilter !== "ALL" && { league: leagueFilter, leagueId: leagueFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(isExactDate && { matchDate: dateFilter }),
    ...(effectiveDateStatus !== "ALL" && { dateStatus: effectiveDateStatus }),
    ...(venueFilter !== "ALL" && { venue: venueFilter }),
    ...(teamFilter !== "ALL" && { team: teamFilter, teamId: teamFilter }),
    ...(unplayedOnly && { unplayedOnly: "true" }),
    ...(debouncedSearchTerm.trim() && { searchTerm: debouncedSearchTerm.trim() }),
  };

  const {
    data: matchData,
    isLoading: isMatchesLoading,
    isFetching: isMatchesFetching,
    refetch: refetchMatches,
  } = useGetAllMatchQuery(queryParams);

  const [deleteMatch, { isLoading: isDeleting }] = useDeleteMatchMutation();

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"overview" | "events" | "actions">("overview");

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRatingRuleModalOpen, setIsRatingRuleModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreModifyingMatch, setScoreModifyingMatch] = useState<any>(null);

  const [cleanSheetMatch, setCleanSheetMatch] = useState<any>(null);
  const [isCleanSheetModalOpen, setIsCleanSheetModalOpen] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdatingMatch, setStatusUpdatingMatch] = useState<any>(null);

  useEffect(() => {
    setHeaders({
      title: "Match Management",
      des: "Manage live broadcasts, schedules, pitch formations, and historical match data.",
    });
  }, [setHeaders]);

  const handleResetFilters = () => {
    setLeagueFilter("ALL");
    setDateFilter("ALL");
    setStatusFilter("ALL");
    setMatchDateStatusFilter("ALL");
    setVenueFilter("ALL");
    setTeamFilter("ALL");
    setUnplayedOnly(false);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterLabels({});
    try {
      sessionStorage.removeItem("match_management_filters");
    } catch (e) {}
    toast.info("Filters reset to default");
  };

  const isRefreshing = isMatchesFetching || isOverviewFetching;

  const handleRefreshAll = () => {
    refetchOverview();
    refetchMatches();
    toast.success("Match data and analytics refreshed");
  };

  const handleView = (match: any, tab: "overview" | "events" | "actions" = "overview") => {
    setSelectedMatch(match);
    setModalTab(tab);
    setIsModalOpen(true);
  };

  const handleModifyScore = (match: any) => {
    setScoreModifyingMatch(match);
    setIsScoreModalOpen(true);
  };

  const handleUpdateStatus = (match: any) => {
    setStatusUpdatingMatch(match);
    setIsStatusModalOpen(true);
  };

  const handleManageCleanSheet = (match: any) => {
    setCleanSheetMatch(match);
    setIsCleanSheetModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteMatch(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Match deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        refetchOverview();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete match");
    }
  };

  const overview = overviewRes?.data || {
    totalMatches: 0,
    upcomingMatches: 0,
    liveMatches: 0,
    finishedMatches: 0,
    cancelledMatches: 0,
  };

  const totalMatchesCount = overview.totalMatches;
  const liveMatchesCount = overview.liveMatches;
  const upcomingMatchesCount = overview.upcomingMatches;
  const finishedMatchesCount = overview.finishedMatches;

  const matchesList = matchData?.data || [];
  const totalPages = matchData?.pagination?.totalPage || 1;

  const hasActiveFilters =
    leagueFilter !== "ALL" ||
    dateFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    matchDateStatusFilter !== "ALL" ||
    venueFilter !== "ALL" ||
    teamFilter !== "ALL" ||
    unplayedOnly ||
    Boolean(debouncedSearchTerm.trim());

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 max-w-[1600px] mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Match Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure schedules, manage live match states, track pitch formations, and record final scores.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh fixtures and backend analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Rating Window Rule Button */}
          <button
            type="button"
            onClick={() => setIsRatingRuleModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Rating Window Rule</span>
          </button>

          {/* Add Match Button */}
          <Link href="/match-management/create-match">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Match</span>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Strip (Backend Computed Analytics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Matches */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Fixtures
            </span>
            <Trophy className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : totalMatchesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">matches</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            All registered league and cup fixtures
          </p>
        </div>

        {/* Live Matches */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Live In-Play
            </span>
            <Activity className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-rose-700">
              {isOverviewLoading ? "—" : liveMatchesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">active now</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Matches in 1st half, 2nd half, or break
          </p>
        </div>

        {/* Upcoming Matches */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Scheduled
            </span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-blue-700">
              {isOverviewLoading ? "—" : upcomingMatchesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">upcoming</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Fixtures scheduled awaiting kickoff
          </p>
        </div>

        {/* Finished Matches */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Completed
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {isOverviewLoading ? "—" : finishedMatchesCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">finalized</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Full-time matches with recorded scores
          </p>
        </div>
      </div>

      {/* Filter Control Section */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Fixture Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Top Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <CustomSearchableSelect
            label="Competition"
            value={leagueFilter}
            onChange={handleSetLeagueFilter}
            options={competitionOptions}
            placeholder="Competition : All"
          />

          <CustomSearchableSelect
            label="Schedule Date"
            value={dateFilter}
            onChange={handleSetDateFilter}
            options={dateOptions}
            placeholder="Date : All"
          />

          <CustomSearchableSelect
            label="Match Status"
            value={statusFilter}
            onChange={handleSetStatusFilter}
            options={statusOptions}
            placeholder="Status : All"
          />

          <CustomSearchableSelect
            label="Date Range Status"
            value={matchDateStatusFilter}
            onChange={handleSetMatchDateStatusFilter}
            options={matchDateStatusOptions}
            placeholder="Match Date Status : All"
          />

          <CustomSearchableSelect
            label="Venue Location"
            value={venueFilter}
            onChange={handleSetVenueFilter}
            options={venueOptions}
            placeholder="Venue : All"
          />
        </div>

        {/* Secondary Filter Row: Team Select, Checkbox, Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Team Dropdown */}
          <div className="w-full md:w-72">
            <CustomSearchableSelect
              value={teamFilter}
              onChange={handleSetTeamFilter}
              options={teamOptions}
              placeholder="Team : All"
            />
          </div>

          {/* Unplayed Only Checkbox */}
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unplayedOnly}
              onChange={(e) => {
                resetPageInUrl();
                setUnplayedOnly(e.target.checked);
              }}
              className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
            />
            <span>Show unplayed fixtures only</span>
          </label>

          {/* Search Term Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes, venue, teams..."
              className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {/* Table Content */}
        <div className="p-4">
          <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
            <span>
              Showing <span className="font-semibold text-slate-800">{matchesList.length}</span>{" "}
              fixtures (Page {page} of {totalPages})
            </span>
            {hasActiveFilters && (
              <span className="text-slate-600">
                Filtered view active
              </span>
            )}
          </div>

          <CustomTable<any>
            columns={getMatchColumns(
              handleView,
              handleDelete,
              handleModifyScore,
              handleUpdateStatus,
              handleManageCleanSheet
            )}
            data={matchesList}
            isLoading={isMatchesLoading}
          />

          {/* Pagination */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <CustomPagination TOTAL_PAGES={totalPages} qryName="matchPage" />
          </div>
        </div>
      </div>

      {/* Modals */}
      <MatchViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
        onManageCleanSheet={handleManageCleanSheet}
        onModifyScore={handleModifyScore}
        onUpdateStatus={handleUpdateStatus}
        initialTab={modalTab}
      />

      <RatingRuleModal
        isOpen={isRatingRuleModalOpen}
        onClose={() => setIsRatingRuleModalOpen(false)}
      />

      <CleanSheetModal
        isOpen={isCleanSheetModalOpen}
        onClose={() => {
          setIsCleanSheetModalOpen(false);
          setCleanSheetMatch(null);
        }}
        match={cleanSheetMatch}
      />

      <ModifyScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => {
          setIsScoreModalOpen(false);
          setScoreModifyingMatch(null);
        }}
        match={scoreModifyingMatch}
      />

      <UpdateStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStatusUpdatingMatch(null);
        }}
        match={statusUpdatingMatch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default MatchManagement;
