/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  X,
  Upload,
  Coins,
  AlertCircle,
  CheckCircle2,
  Search,
  Loader2,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { useGetAllMatchQuery } from "@/features/match/matchApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

interface ScorePredictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem?: any;
  isLoading?: boolean;
}

export default function ScorePredictionModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: ScorePredictionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lockTime, setLockTime] = useState("");
  const [status, setStatus] = useState<"upcoming" | "active" | "locked">("active");
  const [coinsPerExactScore, setCoinsPerExactScore] = useState<number>(50);
  const [coinsPerCorrectOutcome, setCoinsPerCorrectOutcome] = useState<number>(10);
  const [jackpotBonusCoins, setJackpotBonusCoins] = useState<number>(500);

  // Selected matches and details map (to retain data even when filtering)
  const [selectedMatchIds, setSelectedMatchIds] = useState<string[]>([]);
  const [selectedMatchesMap, setSelectedMatchesMap] = useState<Record<string, any>>({});

  // Match Filter & Infinite Scroll State
  const [matchStatusFilter, setMatchStatusFilter] = useState<string>("upcoming");
  const [leagueFilter, setLeagueFilter] = useState<string>("ALL");
  const [matchSearchInput, setMatchSearchInput] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [matchPage, setMatchPage] = useState<number>(1);
  const [accumulatedMatches, setAccumulatedMatches] = useState<any[]>([]);

  const listContainerRef = useRef<HTMLDivElement | null>(null);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Debounce search input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(matchSearchInput.trim());
    }, 350);
    return () => clearTimeout(handler);
  }, [matchSearchInput]);

  // Fetch leagues for the filter dropdown
  const { data: leaguesData } = useGetAllLeagueQuery(
    { limit: 100 },
    { skip: !isOpen }
  );

  const leaguesList = useMemo(() => {
    if (Array.isArray(leaguesData?.data)) return leaguesData.data;
    if (Array.isArray(leaguesData?.data?.result)) return leaguesData.data.result;
    return [];
  }, [leaguesData]);

  // Reset page and accumulated list when filters change
  useEffect(() => {
    setMatchPage(1);
    setAccumulatedMatches([]);
    if (listContainerRef.current) {
      listContainerRef.current.scrollTop = 0;
    }
  }, [matchStatusFilter, leagueFilter, debouncedSearch, isOpen]);

  // Fetch matches from backend
  const { data: matchesResponse, isFetching: isFetchingMatches } = useGetAllMatchQuery(
    {
      page: matchPage,
      limit: 25,
      ...(matchStatusFilter !== "ALL" ? { status: matchStatusFilter } : {}),
      ...(leagueFilter !== "ALL" ? { leagueId: leagueFilter } : {}),
      ...(debouncedSearch ? { searchTerm: debouncedSearch } : {}),
      sort: "matchDate:asc",
    },
    { skip: !isOpen }
  );

  // Accumulate matches across pages
  useEffect(() => {
    const newItems = Array.isArray(matchesResponse?.data) ? matchesResponse.data : [];
    if (matchPage === 1) {
      setAccumulatedMatches(newItems);
    } else if (newItems.length > 0) {
      setAccumulatedMatches((prev) => {
        const existingIds = new Set(prev.map((m) => String(m._id)));
        const filtered = newItems.filter((m: any) => !existingIds.has(String(m._id)));
        return [...prev, ...filtered];
      });
    }
  }, [matchesResponse, matchPage]);

  // Pagination meta
  const totalMatchesCount: number = matchesResponse?.pagination?.total ?? 0;
  const totalPagesCount: number = matchesResponse?.pagination?.totalPage ?? 1;
  const hasMoreMatches = matchPage < totalPagesCount;

  // Handle scroll pagination
  const handleMatchListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 60) {
      if (!isFetchingMatches && hasMoreMatches) {
        setMatchPage((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setDescription(editingItem.description || "");
      setLockTime(
        editingItem.lockTime ? editingItem.lockTime.split("T")[0] : ""
      );
      setStatus(editingItem.status || "active");
      setCoinsPerExactScore(editingItem.coinsPerExactScore ?? 50);
      setCoinsPerCorrectOutcome(editingItem.coinsPerCorrectOutcome ?? 10);
      setJackpotBonusCoins(editingItem.jackpotBonusCoins ?? 500);

      const mIds: string[] = [];
      const mMap: Record<string, any> = {};
      if (Array.isArray(editingItem.matches)) {
        editingItem.matches.forEach((m: any) => {
          const id = String(m._id || m);
          mIds.push(id);
          if (typeof m === "object" && m._id) {
            mMap[id] = m;
          }
        });
      }
      setSelectedMatchIds(mIds);
      setSelectedMatchesMap(mMap);

      setBannerPreview(formatImagePath(editingItem.banner));
      setBannerFile(null);
    } else {
      setTitle("");
      setDescription("");
      setLockTime("");
      setStatus("active");
      setCoinsPerExactScore(50);
      setCoinsPerCorrectOutcome(10);
      setJackpotBonusCoins(500);
      setSelectedMatchIds([]);
      setSelectedMatchesMap({});
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleToggleMatch = (matchId: string, matchObj?: any) => {
    if (selectedMatchIds.includes(matchId)) {
      setSelectedMatchIds(selectedMatchIds.filter((id) => id !== matchId));
    } else {
      if (selectedMatchIds.length >= 5) {
        setErrorMsg("You can select up to 5 matches for this prediction round.");
        return;
      }
      setErrorMsg("");
      setSelectedMatchIds([...selectedMatchIds, matchId]);
      if (matchObj) {
        setSelectedMatchesMap((prev) => ({ ...prev, [matchId]: matchObj }));
      }
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const url = URL.createObjectURL(file);
      setBannerPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a prediction round title.");
      return;
    }
    if (!lockTime) {
      setErrorMsg("Please select a lock deadline date.");
      return;
    }
    if (selectedMatchIds.length === 0) {
      setErrorMsg("Please select at least 1 match (up to 5 fixtures).");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("lockTime", new Date(lockTime).toISOString());
    formData.append("status", status);
    formData.append("coinsPerExactScore", String(coinsPerExactScore));
    formData.append("coinsPerCorrectOutcome", String(coinsPerCorrectOutcome));
    formData.append("jackpotBonusCoins", String(jackpotBonusCoins));
    if (description.trim()) formData.append("description", description.trim());

    formData.append("matches", JSON.stringify(selectedMatchIds));

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err?.data?.message || err?.message || "Failed to save prediction round.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div>
            <span className="text-sm font-semibold text-slate-900 block">
              {editingItem ? "Edit Score Prediction Round" : "Create 5-Match Score Prediction Round"}
            </span>
            <span className="text-xs text-slate-500">
              Select 5 fixtures from upcoming matches and set coin rewards for exact score predictions.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-md">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Round Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gameweek 12 - Big 5 Fixtures Prediction"
                className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white shadow-2xs cursor-pointer">
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="active" className="text-xs">Active (Open for Predictions)</SelectItem>
                  <SelectItem value="upcoming" className="text-xs">Upcoming (Scheduled)</SelectItem>
                  <SelectItem value="locked" className="text-xs">Locked (Deadline Passed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Rules (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Predict the correct scores of these 5 fixtures before kick-off to win coins!"
              className="w-full p-2 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Reward Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/70 border border-slate-200 rounded-md">
            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Coins per Exact Score</span>
              </label>
              <input
                type="number"
                min={0}
                value={coinsPerExactScore}
                onChange={(e) => setCoinsPerExactScore(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Rewarded for matching exact score (e.g. 2-1)
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Coins per Correct Outcome</span>
              </label>
              <input
                type="number"
                min={0}
                value={coinsPerCorrectOutcome}
                onChange={(e) => setCoinsPerCorrectOutcome(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Consolation for Win/Draw/Loss outcome
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                <Coins className="w-3.5 h-3.5 text-indigo-600" />
                <span>Jackpot Bonus (5/5 Exact)</span>
              </label>
              <input
                type="number"
                min={0}
                value={jackpotBonusCoins}
                onChange={(e) => setJackpotBonusCoins(Number(e.target.value))}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Grand jackpot for predicting all 5 exact
              </span>
            </div>
          </div>

          {/* Lock Deadline & Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <CustomDatePicker
                label="Lock Deadline (Kick-off)"
                value={lockTime}
                onChange={setLockTime}
                placeholder="Select kick-off deadline"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Predictions lock automatically when this deadline arrives.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Banner Image (Optional)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Upload Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerSelect}
                    className="hidden"
                  />
                </label>
                {bannerPreview && (
                  <div className="relative inline-block border border-slate-200 rounded overflow-hidden h-9 w-20 bg-slate-100">
                    <img
                      src={bannerPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview(null);
                      }}
                      className="absolute top-0.5 right-0.5 bg-slate-900/70 text-white rounded p-0.5 hover:bg-rose-600 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5-Match Selector Section */}
          <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-3">
            {/* Top Bar: Title & Selection Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900 block">
                    Pick 5 Fixtures for Prediction ({selectedMatchIds.length}/5)
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      selectedMatchIds.length === 5
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200"
                    }`}
                  >
                    {selectedMatchIds.length === 5
                      ? "✓ All 5 Matches Selected"
                      : `Select ${5 - selectedMatchIds.length} more`}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Filter by league, search teams, or scroll down to load more upcoming fixtures.
                </span>
              </div>

              {selectedMatchIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedMatchIds([])}
                  className="text-[11px] text-rose-600 hover:text-rose-700 font-medium cursor-pointer self-start sm:self-auto"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Selected Match Chips (Pinned at Top so user never loses track) */}
            {selectedMatchIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-2 bg-indigo-50/50 border border-indigo-100 rounded-md">
                {selectedMatchIds.map((mId, index) => {
                  const mObj =
                    selectedMatchesMap[mId] ||
                    accumulatedMatches.find((m: any) => String(m._id) === mId);
                  const hName = mObj?.homeTeam?.teamName || "Home";
                  const aName = mObj?.awayTeam?.teamName || "Away";
                  const dateStr = mObj?.matchDate
                    ? dayjs(mObj.matchDate).format("DD MMM")
                    : "";

                  return (
                    <div
                      key={mId}
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-indigo-200 rounded text-xs text-indigo-950 shadow-2xs"
                    >
                      <span className="text-[10px] font-bold text-indigo-600">#{index + 1}</span>
                      <span className="font-medium truncate max-w-[110px]">{hName}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">vs</span>
                      <span className="font-medium truncate max-w-[110px]">{aName}</span>
                      {dateStr && (
                        <span className="text-[10px] text-slate-400 font-mono">({dateStr})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleMatch(mId)}
                        className="p-0.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer ml-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Filter Toolbar: Status, League, and Search */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              {/* Status Filter */}
              <div className="sm:col-span-3">
                <Select
                  value={matchStatusFilter}
                  onValueChange={(val) => setMatchStatusFilter(val)}
                >
                  <SelectTrigger className="w-full h-8 px-2.5 rounded border border-slate-200 text-xs text-slate-900 bg-white cursor-pointer shadow-2xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="upcoming" className="text-xs">Upcoming Matches</SelectItem>
                    <SelectItem value="ALL" className="text-xs">All Statuses</SelectItem>
                    <SelectItem value="live" className="text-xs">Live Matches</SelectItem>
                    <SelectItem value="finished" className="text-xs">Finished Matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* League Filter */}
              <div className="sm:col-span-4">
                <Select
                  value={leagueFilter}
                  onValueChange={(val) => setLeagueFilter(val)}
                >
                  <SelectTrigger className="w-full h-8 px-2.5 rounded border border-slate-200 text-xs text-slate-900 bg-white cursor-pointer shadow-2xs truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <Filter className="w-3 h-3 text-slate-400 shrink-0" />
                      <SelectValue placeholder="Filter by League" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 max-h-56">
                    <SelectItem value="ALL" className="text-xs font-medium">
                      All Leagues ({leaguesList.length})
                    </SelectItem>
                    {leaguesList.map((lg: any) => (
                      <SelectItem key={lg._id} value={lg._id} className="text-xs">
                        {lg.leagueName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Bar */}
              <div className="sm:col-span-5 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search team, venue..."
                  value={matchSearchInput}
                  onChange={(e) => setMatchSearchInput(e.target.value)}
                  className="w-full h-8 pl-8 pr-7 text-xs bg-white border border-slate-200 rounded text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 shadow-2xs"
                />
                {matchSearchInput && (
                  <button
                    type="button"
                    onClick={() => setMatchSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Results count & Scroll Notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1">
              <span>
                Showing <strong className="text-slate-800">{accumulatedMatches.length}</strong> of{" "}
                <strong className="text-slate-800">{totalMatchesCount}</strong> fixtures
              </span>
              {hasMoreMatches && (
                <span className="text-[10px] text-indigo-600 font-medium">
                  Scroll down to load more ↓
                </span>
              )}
            </div>

            {/* Match Scroll Container with Infinite Scroll */}
            <div
              ref={listContainerRef}
              onScroll={handleMatchListScroll}
              className="max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded bg-white p-1"
            >
              {accumulatedMatches.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  {isFetchingMatches ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                      <span>Loading fixtures...</span>
                    </div>
                  ) : (
                    <span>No matches found matching your filters.</span>
                  )}
                </div>
              ) : (
                accumulatedMatches.map((m: any) => {
                  const mId = String(m._id);
                  const isSelected = selectedMatchIds.includes(mId);
                  const hTeam = m.homeTeam;
                  const aTeam = m.awayTeam;
                  const hLogo = formatImagePath(hTeam?.teamLogo);
                  const aLogo = formatImagePath(aTeam?.teamLogo);
                  const dateStr = m.matchDate
                    ? dayjs(m.matchDate).format("DD MMM, HH:mm")
                    : "Scheduled";
                  const leagueName = m.league?.leagueName || m.leagueName || "";

                  return (
                    <div
                      key={mId}
                      onClick={() => handleToggleMatch(mId, m)}
                      className={`flex items-center justify-between p-2.5 rounded transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-50/80 border border-indigo-200"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}} // handled by parent div click
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-0 cursor-pointer pointer-events-none"
                        />

                        {/* Match Details */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            {/* Home Team */}
                            <div className="flex items-center gap-1.5 min-w-[110px] max-w-[150px]">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[9px] font-semibold">
                                {hLogo ? (
                                  <img src={hLogo} alt="Home" className="w-full h-full object-cover" />
                                ) : (
                                  (hTeam?.shortName || "H").slice(0, 1)
                                )}
                              </div>
                              <span className="text-xs font-medium text-slate-900 truncate">
                                {hTeam?.teamName || "Home Team"}
                              </span>
                            </div>

                            <span className="text-[10px] font-bold text-slate-400 px-1">VS</span>

                            {/* Away Team */}
                            <div className="flex items-center gap-1.5 min-w-[110px] max-w-[150px]">
                              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[9px] font-semibold">
                                {aLogo ? (
                                  <img src={aLogo} alt="Away" className="w-full h-full object-cover" />
                                ) : (
                                  (aTeam?.shortName || "A").slice(0, 1)
                                )}
                              </div>
                              <span className="text-xs font-medium text-slate-900 truncate">
                                {aTeam?.teamName || "Away Team"}
                              </span>
                            </div>
                          </div>

                          {/* Extra info: League tag if available */}
                          {leagueName && (
                            <span className="text-[10px] text-slate-400 pl-6 truncate max-w-[280px]">
                              {leagueName}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Venue & Date */}
                      <div className="text-right text-[10px] text-slate-500 shrink-0 pl-2">
                        <span className="block font-mono text-slate-700 font-medium">
                          {dateStr}
                        </span>
                        {m.venueName && (
                          <span className="block text-slate-400 truncate max-w-[130px]">
                            {m.venueName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Infinite Scroll Footer Indicator */}
              {isFetchingMatches && accumulatedMatches.length > 0 && (
                <div className="py-2.5 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Loading more fixtures...</span>
                </div>
              )}

              {!hasMoreMatches && accumulatedMatches.length > 0 && (
                <div className="py-2 text-center text-[11px] text-slate-400 border-t border-slate-50">
                  All {totalMatchesCount} fixtures loaded
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 rounded hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            {isLoading ? "Saving..." : editingItem ? "Update Round" : "Publish Round"}
          </button>
        </div>
      </div>
    </div>
  );
}
