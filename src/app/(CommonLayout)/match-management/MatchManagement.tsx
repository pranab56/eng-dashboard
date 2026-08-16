/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import CreateButton from "@/components/buttons/CreateButton";
import CustomPagination from "@/components/cui/CustomPagination";
import TableHeader from "@/components/cui/TableHeader";
import CustomTable from "@/components/table/CustomTable";
import { useGetAllVenueCategoryQuery } from "@/features/categoryManagement/categoryApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllLeagueTeamQuery } from "@/features/leagueTeam/leagueTeamApi";
import { useDeleteMatchMutation, useGetAllMatchQuery, useUpdateMatchStatusMutation } from "@/features/match/matchApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getMatchColumns } from "@/tableColumns/matchColumns";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Check, ChevronDown, Filter, Loader2, RefreshCw, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DeleteConfirmModal from "./DeleteConfirmModal";
import MatchViewModal from "./MatchViewModal";
import ModifyScoreModal from "./ModifyScoreModal";

interface OptionItem {
  label: string;
  value: string;
  logo?: string | null;
}

const CustomSearchableSelect = ({
  label,
  badgeText,
  value,
  onChange,
  options,
  placeholder = "Select Option",
  className = "",
}: {
  label?: string;
  badgeText?: string;
  value: string;
  onChange: (val: string) => void;
  options: OptionItem[];
  placeholder?: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center gap-2 mb-1">
          <label className="text-[11px] font-bold text-gray-600">{label}</label>
          {badgeText && (
            <span className="text-[9px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
              {badgeText}
            </span>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-left shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.logo && (
            <Image
              src={formatImagePath(selectedOption.logo)}
              alt="logo"
              width={18}
              height={18}
              className="w-4.5 h-4.5 rounded-full object-cover shrink-0"
            />
          )}
          <span className="truncate font-semibold text-gray-800">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-xl p-2 space-y-2 animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Scrollable Options List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 custom-scrollbar pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md transition-colors text-left cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.logo && (
                        <Image
                          src={formatImagePath(opt.logo)}
                          alt="logo"
                          width={16}
                          height={16}
                          className="w-4 h-4 rounded-full object-cover shrink-0"
                        />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="py-3 text-center text-xs text-gray-400 font-medium">
                No matching results
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

  // Filter States matching client reference UI
  const [leagueFilter, setLeagueFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [matchDateStatusFilter, setMatchDateStatusFilter] = useState<string>("ALL");
  const [venueFilter, setVenueFilter] = useState<string>("ALL");
  const [teamFilter, setTeamFilter] = useState<string>("ALL");
  const [unplayedOnly, setUnplayedOnly] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");

  const resetPageInUrl = () => {
    if (urlPageParam && urlPageParam !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("matchPage");
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  const handleSetLeagueFilter = (val: string) => {
    resetPageInUrl();
    setLeagueFilter(val);
  };

  const handleSetDateFilter = (val: string) => {
    resetPageInUrl();
    setDateFilter(val);
  };

  const handleSetStatusFilter = (val: string) => {
    resetPageInUrl();
    setStatusFilter(val);
  };

  const handleSetMatchDateStatusFilter = (val: string) => {
    resetPageInUrl();
    setMatchDateStatusFilter(val);
  };

  const handleSetVenueFilter = (val: string) => {
    resetPageInUrl();
    setVenueFilter(val);
  };

  const handleSetTeamFilter = (val: string) => {
    resetPageInUrl();
    setTeamFilter(val);
  };

  // Debounce search term to prevent API hit on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm) resetPageInUrl();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Data Queries
  const { data: leagueData } = useGetAllLeagueQuery({ limit: 1000 });
  const { data: leagueTeamData } = useGetAllLeagueTeamQuery(1);
  const { data: venueCategoryData } = useGetAllVenueCategoryQuery({});

  const allLeagues: any[] = leagueData?.data?.result || leagueData?.data || [];
  const leagueList: any[] = leagueTeamData?.data || [];
  const venueList: any[] = venueCategoryData?.data || [];

  // Derive Teams
  const allTeams: any[] = [];
  leagueList.forEach((entry: any) => {
    if (Array.isArray(entry.teams)) {
      entry.teams.forEach((t: any) => {
        if (!allTeams.some((existing) => existing._id === t._id)) {
          allTeams.push(t);
        }
      });
    }
  });

  // Options arrays
  const competitionOptions: OptionItem[] = [
    { label: "Competition : All", value: "ALL" },
    ...allLeagues.map((item: any) => ({
      label: item.season ? `${item.leagueName} (${item.season})` : item.leagueName,
      value: item._id,
    })),
  ];

  const dateOptions: OptionItem[] = [
    { label: "Date : All", value: "ALL" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "this_week" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Past", value: "past" },
  ];

  const statusOptions: OptionItem[] = [
    { label: "Status : All", value: "ALL" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Live", value: "live" },
    { label: "Half Time", value: "half_time" },
    { label: "Finished", value: "finished" },
  ];

  const matchDateStatusOptions: OptionItem[] = [
    { label: "Match Date : All", value: "ALL" },
    { label: "Today's Matches", value: "today" },
    { label: "This Week's Matches", value: "this_week" },
    { label: "Upcoming Matches", value: "upcoming" },
    { label: "Past Matches", value: "past" },
  ];

  const venueOptions: OptionItem[] = [
    { label: "Venue : All", value: "ALL" },
    ...venueList.map((v: any) => ({
      label: v.name,
      value: v._id || v.id,
    })),
  ];

  const teamOptions: OptionItem[] = [
    { label: "Team : All", value: "ALL" },
    ...allTeams.map((t: any) => ({
      label: t.teamName,
      value: t._id,
      logo: t.teamLogo || null,
    })),
  ];

  // Combine query params
  const effectiveDateStatus = dateFilter !== "ALL" ? dateFilter : matchDateStatusFilter;

  // Use URL matchPage parameter if available, but reset to 1 if filter is active
  const page = urlPageParam || "1";

  const queryParams = {
    page,
    ...(leagueFilter !== "ALL" && { league: leagueFilter, leagueId: leagueFilter }),
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(effectiveDateStatus !== "ALL" && { dateStatus: effectiveDateStatus }),
    ...(venueFilter !== "ALL" && { venue: venueFilter }),
    ...(teamFilter !== "ALL" && { team: teamFilter, teamId: teamFilter }),
    ...(unplayedOnly && { unplayedOnly: "true" }),
    ...(debouncedSearchTerm.trim() && { searchTerm: debouncedSearchTerm.trim() }),
  };

  const { data: matchData, isLoading } = useGetAllMatchQuery(queryParams);
  const [deleteMatch, { isLoading: isDeleting }] = useDeleteMatchMutation();

  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreModifyingMatch, setScoreModifyingMatch] = useState<any>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusUpdatingMatch, setStatusUpdatingMatch] = useState<any>(null);

  useEffect(() => {
    setHeaders({
      title: "Matches",
      des: "Manage live broadcasts, schedules, and historical match data.",
    });
  }, []);

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
    toast.info("Filters reset to default");
  };

  const handleView = (match: any) => {
    setSelectedMatch(match);
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
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete match");
    }
  };

  const tableHeaderPayload = {
    title: "Matches Registry",
    des: "Real-time update stream for active league matches.",
    url: "#",
  };

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Top Header & Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Match Management</h2>
          <p className="text-xs text-gray-500">Filter, search, and manage match schedules and scores.</p>
        </div>
        <Link href="/match-management/create-match">
          <CreateButton text="Add Match" />
        </Link>
      </div>

      {/* Filter Control Section matching Client Reference UI */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-700 font-bold text-sm">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Match Filters</span>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        {/* Top Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Competition / League */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Competition</label>
            <CustomSearchableSelect
              value={leagueFilter}
              onChange={handleSetLeagueFilter}
              options={competitionOptions}
              placeholder="Competition : All"
            />
          </div>

          {/* Date Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Date</label>
            <CustomSearchableSelect
              value={dateFilter}
              onChange={handleSetDateFilter}
              options={dateOptions}
              placeholder="Date : All"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Status</label>
            <CustomSearchableSelect
              value={statusFilter}
              onChange={handleSetStatusFilter}
              options={statusOptions}
              placeholder="Status : All"
            />
          </div>

          {/* Match Date Status */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Match Date Status</label>
            <CustomSearchableSelect
              value={matchDateStatusFilter}
              onChange={handleSetMatchDateStatusFilter}
              options={matchDateStatusOptions}
              placeholder="Match Date Status : All"
            />
          </div>

          {/* Venue Filter */}
          <div>
            <label className="text-[11px] font-bold text-gray-600 block mb-1">Venue</label>
            <CustomSearchableSelect
              value={venueFilter}
              onChange={handleSetVenueFilter}
              options={venueOptions}
              placeholder="Venue : All"
            />
          </div>
        </div>

        {/* Bottom Filter Row: Team Filter & More Filters Checkboxes */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2 border-t border-gray-100">
          {/* Team Filter - Custom Searchable & Scrollable Dropdown with Team Logos */}
          <div className="w-full md:w-1/3">
            <CustomSearchableSelect
              label="Team Filter"
              badgeText="Select Team"
              value={teamFilter}
              onChange={handleSetTeamFilter}
              options={teamOptions}
              placeholder="Team : All"
            />
          </div>

          {/* More Filters Checkboxes */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-700">
            <span className="text-[11px] font-bold text-gray-500 block w-full md:w-auto">More filters:</span>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={unplayedOnly}
                onChange={(e) => {
                  resetPageInUrl();
                  setUnplayedOnly(e.target.checked);
                }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span>Show unplayed matches only</span>
            </label>
          </div>

          {/* Search Term Input */}
          <div className="relative w-full md:w-1/4">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search match notes, venue..."
              className="w-full pl-9 pr-8 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-md py-4 flex flex-col shadow-sm border border-gray-100">
        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4">
            <CustomTable<any>
              columns={getMatchColumns(handleView, handleDelete, handleModifyScore, handleUpdateStatus)}
              data={matchData?.data || []}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="pt-8 px-4">
          <CustomPagination TOTAL_PAGES={matchData?.pagination?.totalPage || 1} qryName="matchPage" />
        </div>
      </div>

      <MatchViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
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

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const formatForInput = (d: any) => {
  if (!d) return "";
  return dayjs(d).tz("Europe/London").format("YYYY-MM-DDTHH:mm");
};

const parseFromInput = (str: string) => {
  if (!str) return null;
  return dayjs.tz(str, "Europe/London").utc().toISOString();
};

const UpdateStatusModal = ({
  isOpen,
  onClose,
  match,
}: {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("scheduled");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("first_half");

  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [startedAt, setStartedAt] = useState<string>("");
  const [firstHalfStartedAt, setFirstHalfStartedAt] = useState<string>("");
  const [halfTimeAt, setHalfTimeAt] = useState<string>("");
  const [secondHalfStartedAt, setSecondHalfStartedAt] = useState<string>("");
  const [finishedAt, setFinishedAt] = useState<string>("");

  const [showAdvancedTimestamps, setShowAdvancedTimestamps] = useState<boolean>(false);
  const [updateMatchStatus, { isLoading }] = useUpdateMatchStatusMutation();

  useEffect(() => {
    if (match) {
      const currentStatus = match.status === "upcoming" ? "scheduled" : (match.status || "scheduled");
      setSelectedStatus(currentStatus);
      setSelectedPeriod(
        match.period ||
          (currentStatus === "half_time"
            ? "first_half"
            : currentStatus === "finished"
            ? "second_half"
            : "first_half")
      );

      setScheduledAt(formatForInput(match.scheduledAt || match.matchDate));
      setStartedAt(formatForInput(match.startedAt));
      setFirstHalfStartedAt(formatForInput(match.firstHalfStartedAt));
      setHalfTimeAt(formatForInput(match.halfTimeAt));
      setSecondHalfStartedAt(formatForInput(match.secondHalfStartedAt));
      setFinishedAt(formatForInput(match.finishedAt));
    }
  }, [match]);

  if (!isOpen || !match) return null;

  const handleSaveStatus = async () => {
    try {
      const payload: any = {
        id: match._id || match.id,
        status: selectedStatus,
        period: selectedPeriod || null,
      };

      if (showAdvancedTimestamps) {
        payload.scheduledAt = parseFromInput(scheduledAt);
        payload.startedAt = parseFromInput(startedAt);
        payload.firstHalfStartedAt = parseFromInput(firstHalfStartedAt);
        payload.halfTimeAt = parseFromInput(halfTimeAt);
        payload.secondHalfStartedAt = parseFromInput(secondHalfStartedAt);
        payload.finishedAt = parseFromInput(finishedAt);
      }

      const res = await updateMatchStatus(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "Match status & timing updated successfully");
        onClose();
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update match status & timing"));
    }
  };

  const presetOptions = [
    {
      id: "upcoming",
      status: "upcoming",
      period: null,
      label: "Upcoming",
      subLabel: "Match planned for future date",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "live_1st_half",
      status: "live",
      period: "first_half",
      label: "Live - 1st Half",
      subLabel: "Match is live in First Half",
      badgeColor: "bg-red-100 text-red-700",
    },
    {
      id: "half_time",
      status: "half_time",
      period: "first_half",
      label: "Half Time",
      subLabel: "15 minute interval break",
      badgeColor: "bg-amber-100 text-amber-700",
    },
    {
      id: "live_2nd_half",
      status: "live",
      period: "second_half",
      label: "Live - 2nd Half",
      subLabel: "Match is live in Second Half",
      badgeColor: "bg-purple-100 text-purple-700",
    },
    {
      id: "finished",
      status: "finished",
      period: "second_half",
      label: "Finished",
      subLabel: "Match fully completed",
      badgeColor: "bg-green-100 text-green-700",
    },
    {
      id: "cancelled",
      status: "cancelled",
      period: null,
      label: "Cancelled",
      subLabel: "Match called off",
      badgeColor: "bg-gray-100 text-gray-700",
    },
  ];

  const currentPresetId =
    selectedStatus === "upcoming" || selectedStatus === "scheduled"
      ? "upcoming"
      : selectedStatus === "half_time"
      ? "half_time"
      : selectedStatus === "finished"
      ? "finished"
      : selectedStatus === "cancelled"
      ? "cancelled"
      : selectedPeriod === "second_half"
      ? "live_2nd_half"
      : "live_1st_half";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Update Match Status & Stage</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              {match?.homeTeam?.teamName} vs {match?.awayTeam?.teamName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Select Match State
            </label>
            <div className="space-y-2">
              {presetOptions.map((opt) => {
                const isSelected = currentPresetId === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => {
                      setSelectedStatus(opt.status);
                      setSelectedPeriod(opt.period as any);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="matchStatePreset"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedStatus(opt.status);
                          setSelectedPeriod(opt.period as any);
                        }}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-gray-800 block">{opt.label}</span>
                        <span className="text-[10px] text-gray-400 font-medium">{opt.subLabel}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${opt.badgeColor}`}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Toggle Advanced Timestamp Correction */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedTimestamps(!showAdvancedTimestamps)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showAdvancedTimestamps ? "Hide" : "Edit"} Advanced Match Timestamps (UK Time)</span>
            </button>
          </div>

          {showAdvancedTimestamps && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
              <span className="text-[11px] font-extrabold text-slate-700 block">
                Manual Timestamp Overwrite (Europe/London UK Time)
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">Scheduled At</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">Started At</label>
                  <input
                    type="datetime-local"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">1st Half Started</label>
                  <input
                    type="datetime-local"
                    value={firstHalfStartedAt}
                    onChange={(e) => setFirstHalfStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">Half Time At</label>
                  <input
                    type="datetime-local"
                    value={halfTimeAt}
                    onChange={(e) => setHalfTimeAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">2nd Half Started</label>
                  <input
                    type="datetime-local"
                    value={secondHalfStartedAt}
                    onChange={(e) => setSecondHalfStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-600 text-[10px] mb-1">Finished At</label>
                  <input
                    type="datetime-local"
                    value={finishedAt}
                    onChange={(e) => setFinishedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveStatus}
            disabled={isLoading}
            className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Save Status & Timings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;