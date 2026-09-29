/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModifyScoreMutation, useGetSingleMatchQuery } from "@/features/match/matchApi";
import { useGetSingleTeamQuery } from "@/features/teamManagement/teamApi";
import { toast } from "sonner";
import Image from "next/image";
import { formatImagePath } from "../../../utils/formatImagePath";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  Search,
  Check,
} from "lucide-react";

interface ModifyScoreModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

interface GoalScorerEntry {
  id: string;
  team: string; // team ID
  player: string; // player ID
  assistPlayer?: string;
  assistName?: string;
  goalType: "normal" | "penalty" | "header" | "own_goal" | "free_kick";
  minute: number | string;
}

const GOAL_TYPES = [
  { value: "normal", label: "Normal Goal" },
  { value: "penalty", label: "Penalty" },
  { value: "header", label: "Header" },
  { value: "own_goal", label: "Own Goal" },
  { value: "free_kick", label: "Free Kick" },
];

/**
 * Custom Goal Type Dropdown
 */
const CustomGoalTypeDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedOpt = GOAL_TYPES.find((g) => g.value === value) || GOAL_TYPES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors text-left"
      >
        <span className="font-medium text-slate-800 truncate">{selectedOpt.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1">
          {GOAL_TYPES.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer ${
                  isSelected ? "bg-slate-50 text-slate-900 font-semibold" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/**
 * Custom Searchable Player Dropdown (Scorer, Assist, and Player of the Match)
 */
const SearchablePlayerDropdown = ({
  players,
  value,
  onChange,
  placeholder = "Select player",
  allowNone = false,
  noneLabel = "None",
  autoFocusSearch = false,
}: {
  players: any[];
  value: string;
  onChange: (id: string, memberObj?: any) => void;
  placeholder?: string;
  allowNone?: boolean;
  noneLabel?: string;
  autoFocusSearch?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedItem = players.find((m) => {
    const p = m.player || m;
    const pId = p._id || p.id;
    return String(pId) === String(value);
  });

  const selectedPlayerName = selectedItem
    ? selectedItem.name ||
      `${selectedItem.firstName || ""} ${selectedItem.lastName || ""}`.trim() ||
      (selectedItem.player
        ? selectedItem.player.name || `${selectedItem.player.firstName || ""} ${selectedItem.player.lastName || ""}`.trim()
        : "") ||
      "Selected Player"
    : "";

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter((m) => {
      const p = m.player || m;
      const name = (
        m.name ||
        `${p.firstName || ""} ${p.lastName || ""}` ||
        p.displayName ||
        p.userName ||
        ""
      ).toLowerCase();
      const pos = (p.position || "").toLowerCase();
      const team = (m.teamName || "").toLowerCase();
      return name.includes(q) || pos.includes(q) || team.includes(q);
    });
  }, [players, search]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors text-left"
      >
        <span
          className={`truncate ${
            selectedPlayerName ? "font-medium text-slate-800" : "text-slate-400"
          }`}
        >
          {selectedPlayerName || (value === "" && allowNone ? noneLabel : placeholder)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 max-h-64 overflow-y-auto">
          {players.length > 5 && (
            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search player..."
                className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:bg-white text-slate-800"
                autoFocus={autoFocusSearch}
              />
            </div>
          )}

          <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
            {allowNone && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 text-xs flex items-center justify-between text-left rounded-md transition-colors cursor-pointer ${
                  !value ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{noneLabel}</span>
                {!value && <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              </button>
            )}

            {filtered.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">No players found</div>
            ) : (
              filtered.map((m) => {
                const p = m.player || m;
                const pId = String(p._id || p.id);
                const name =
                  m.name ||
                  `${p.firstName || ""} ${p.lastName || ""}`.trim() ||
                  p.displayName ||
                  p.userName ||
                  "Player";
                const pos = p.position;
                const team = m.teamName;
                const isSelected = pId === String(value);

                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      onChange(pId, m);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs flex items-center justify-between text-left rounded-md transition-colors cursor-pointer ${
                      isSelected ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{name}</span>
                      {team && (
                        <span className="text-[10px] text-slate-400">({team})</span>
                      )}
                      {pos && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase">
                          {pos}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ModifyScoreModal = ({ match, isOpen, onClose }: ModifyScoreModalProps) => {
  const currentMatchId = match?._id || match?.id;
  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [goalScorers, setGoalScorers] = useState<GoalScorerEntry[]>([]);
  const [selectedPOTD, setSelectedPOTD] = useState<string>("");

  const [modifyScore, { isLoading }] = useModifyScoreMutation();
  const loadedMatchIdRef = useRef<string | null>(null);

  // Fetch players for home & away teams
  const { data: homeTeamData } = useGetSingleTeamQuery(homeTeamId, {
    skip: !homeTeamId || !isOpen,
  });
  const { data: awayTeamData } = useGetSingleTeamQuery(awayTeamId, {
    skip: !awayTeamId || !isOpen,
  });

  const homeMembers: any[] = useMemo(
    () => homeTeamData?.data?.members || homeTeamData?.members || [],
    [homeTeamData]
  );
  const awayMembers: any[] = useMemo(
    () => awayTeamData?.data?.members || awayTeamData?.members || [],
    [awayTeamData]
  );

  // All players combined for Player of the Day selector
  const allPlayers = useMemo(() => {
    const list: Array<{ id: string; name: string; teamName: string }> = [];
    homeMembers.forEach((m) => {
      const p = m.player || m;
      list.push({
        id: String(p._id || p.id),
        name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Player",
        teamName: match?.homeTeam?.teamName || "Home",
      });
    });
    awayMembers.forEach((m) => {
      const p = m.player || m;
      list.push({
        id: String(p._id || p.id),
        name: p.name || `${p.firstName || ""} ${p.lastName || ""}`.trim() || "Player",
        teamName: match?.awayTeam?.teamName || "Away",
      });
    });
    return list;
  }, [homeMembers, awayMembers, match]);

  // Detailed match info query
  const { data: singleMatchData, isLoading: isMatchLoading } = useGetSingleMatchQuery(currentMatchId, {
    skip: !currentMatchId || !isOpen,
  });

  // Only reset form when opening modal for a new/different match
  useEffect(() => {
    if (isOpen && currentMatchId && currentMatchId !== loadedMatchIdRef.current) {
      loadedMatchIdRef.current = currentMatchId;
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setGoalScorers([]);
      setSelectedPOTD("");
    }
    if (!isOpen) {
      loadedMatchIdRef.current = null;
    }
  }, [isOpen, currentMatchId, match]);

  // Populate goals and evaluations when detailed match data arrives
  useEffect(() => {
    if (isOpen && singleMatchData?.data) {
      const detailedMatch = singleMatchData.data;
      setHomeScore(detailedMatch.homeScore ?? 0);
      setAwayScore(detailedMatch.awayScore ?? 0);

      const motmId =
        detailedMatch.refereeReport?.manOfTheMatch?._id ||
        detailedMatch.refereeReport?.manOfTheMatch?.id ||
        detailedMatch.refereeReport?.manOfTheMatch;
      if (motmId) {
        setSelectedPOTD(String(motmId));
      }

      if (Array.isArray(detailedMatch.goals)) {
        const scorers: GoalScorerEntry[] = detailedMatch.goals.map((g: any) => ({
          id: g._id || Math.random().toString(36).substring(2, 9),
          team: g.team?._id || g.team?.id || g.team,
          player: g.player?._id || g.player?.id || g.player || "",
          assistPlayer: g.assist?._id || g.assist?.id || g.assist || "",
          assistName: g.assist
            ? `${g.assist.firstName || ""} ${g.assist.lastName || ""}`.trim()
            : "",
          goalType: g.goalType || "normal",
          minute: g.minute !== undefined && g.minute !== null ? g.minute : 1,
        }));
        setGoalScorers(scorers);
      }
    }
  }, [isOpen, singleMatchData]);

  if (!match) return null;

  const handleAddGoalScorer = (teamId: string) => {
    const newId = Math.random().toString(36).substring(2, 9);
    setGoalScorers((prev) => [
      ...prev,
      {
        id: newId,
        team: teamId,
        player: "",
        assistPlayer: "",
        goalType: "normal",
        minute: 1,
      },
    ]);

    if (teamId === homeTeamId) {
      setHomeScore((prev) => prev + 1);
    } else if (teamId === awayTeamId) {
      setAwayScore((prev) => prev + 1);
    }
  };

  const handleRemoveGoalScorer = (id: string) => {
    const itemToRemove = goalScorers.find((item) => item.id === id);
    if (itemToRemove) {
      if (itemToRemove.team === homeTeamId) {
        setHomeScore((prev) => Math.max(0, prev - 1));
      } else if (itemToRemove.team === awayTeamId) {
        setAwayScore((prev) => Math.max(0, prev - 1));
      }
    }
    setGoalScorers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScorerChange = (id: string, field: string, value: any) => {
    setGoalScorers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validScorers = goalScorers
      .filter((g) => g.player && g.team)
      .map((g) => ({
        ...(g.id && /^[0-9a-fA-F]{24}$/.test(g.id) ? { _id: g.id } : {}),
        team: g.team,
        player: g.player,
        assistPlayer: g.assistPlayer || undefined,
        goalType: g.goalType || "normal",
        minute: Number(g.minute) || 1,
      }));

    try {
      const res = await modifyScore({
        id: match._id,
        data: {
          homeScore,
          awayScore,
          manOfTheMatch: selectedPOTD || null,
          goalScorers: validScorers,
        },
      }).unwrap();

      if (res.success) {
        toast.success(res.message || "Match score modified successfully");
      } else {
        toast.success("Match score modified successfully");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to modify match score");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl w-full bg-white rounded-xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[92vh] flex flex-col text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Modify Match Score
              </DialogTitle>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Official Result
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Update scoreline, assign goalscorers & assists, and select Player of the Match
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          {/* Match Score Header */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="grid grid-cols-11 items-center gap-3">
              {/* Home Team */}
              <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {match.homeTeam?.teamName || "Home"}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Home</span>
                </div>
                <div className="relative w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  {match.homeTeam?.teamLogo ? (
                    <Image
                      src={formatImagePath(match.homeTeam.teamLogo)}
                      alt="home"
                      fill
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">H</span>
                  )}
                </div>
              </div>

              {/* Score Input Center */}
              <div className="col-span-3 flex items-center justify-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 h-11 text-center font-mono text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
                <span className="text-slate-300 font-bold text-lg">:</span>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-12 h-11 text-center font-mono text-xl font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              {/* Away Team */}
              <div className="col-span-4 flex items-center justify-start gap-3 text-left">
                <div className="relative w-9 h-9 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                  {match.awayTeam?.teamLogo ? (
                    <Image
                      src={formatImagePath(match.awayTeam.teamLogo)}
                      alt="away"
                      fill
                      className="object-contain p-0.5"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-slate-400">A</span>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                    {match.awayTeam?.teamName || "Away"}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Away</span>
                </div>
              </div>
            </div>
          </div>

          {/* Player of the Day Section */}
          <div className="border border-amber-200/70 bg-amber-50/40 rounded-lg p-3 sm:flex sm:items-center sm:justify-between gap-4">
            <div className="mb-2 sm:mb-0">
              <h4 className="text-xs font-semibold text-amber-950">
                Player of the Match (POTD)
              </h4>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Award coin bonus and market value for standout match performance.
              </p>
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <SearchablePlayerDropdown
                players={allPlayers}
                value={selectedPOTD}
                onChange={(id) => setSelectedPOTD(id)}
                placeholder="Select player..."
                allowNone={true}
                noneLabel="No Player Selected"
              />
            </div>
          </div>

          {/* Assign Goal Scorers Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Assign Goal Scorers
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select players to credit goals, assists, coins and stats.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(homeTeamId)}
                  className="h-8 px-3 text-xs font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Home Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(awayTeamId)}
                  className="h-8 px-3 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Away Goal</span>
                </button>
              </div>
            </div>

            {/* Goal Scorers List */}
            {isMatchLoading ? (
              <div className="p-8 rounded-lg bg-slate-50 text-center border border-slate-200 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                <p className="text-xs text-slate-400">Loading match details & goals...</p>
              </div>
            ) : goalScorers.length === 0 ? (
              <div className="p-8 rounded-lg bg-slate-50 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-400">
                  No goal scorers added yet. Click "+ Home Goal" or "+ Away Goal" to credit players.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goalScorers.map((entry, idx) => {
                  const isHome = entry.team === homeTeamId;
                  const memberList = isHome ? homeMembers : awayMembers;
                  const teamName = isHome
                    ? match.homeTeam?.teamName || "Home"
                    : match.awayTeam?.teamName || "Away";

                  return (
                    <div
                      key={entry.id}
                      className={`p-3.5 bg-white border border-slate-200 rounded-lg border-l-4 transition-colors space-y-2.5 ${
                        isHome ? "border-l-emerald-600" : "border-l-blue-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700">
                            GOAL {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span
                            className={`text-xs font-semibold ${
                              isHome ? "text-emerald-700" : "text-blue-700"
                            }`}
                          >
                            {teamName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoalScorer(entry.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Remove goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
                        {/* Scorer Player Select */}
                        <div className="lg:col-span-4">
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">
                            Scorer <span className="text-rose-500">*</span>
                          </label>
                          <SearchablePlayerDropdown
                            players={memberList}
                            value={entry.player ? String(entry.player) : ""}
                            onChange={(val) => handleScorerChange(entry.id, "player", val)}
                            placeholder="Select scorer..."
                          />
                        </div>

                        {/* Assist Player Select */}
                        <div className="lg:col-span-3">
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">
                            Assist (Optional)
                          </label>
                          <SearchablePlayerDropdown
                            players={memberList.filter((m) => {
                              const p = m.player || m;
                              return String(p._id || p.id) !== String(entry.player);
                            })}
                            value={entry.assistPlayer ? String(entry.assistPlayer) : ""}
                            onChange={(val, memberObj) => {
                              const assistName = memberObj
                                ? memberObj.name ||
                                  `${memberObj.firstName || ""} ${memberObj.lastName || ""}`.trim()
                                : "";
                              setGoalScorers((prev) =>
                                prev.map((item) =>
                                  item.id === entry.id
                                    ? {
                                        ...item,
                                        assistPlayer: val || "",
                                        assistName: val ? assistName : "",
                                      }
                                    : item
                                )
                              );
                            }}
                            placeholder="None"
                            allowNone={true}
                            noneLabel="No Assist"
                          />
                        </div>

                        {/* Goal Type Select */}
                        <div className="lg:col-span-3">
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">
                            Goal Type
                          </label>
                          <CustomGoalTypeDropdown
                            value={entry.goalType}
                            onChange={(val) => handleScorerChange(entry.id, "goalType", val)}
                          />
                        </div>

                        {/* Minute Input */}
                        <div className="lg:col-span-2">
                          <label className="text-[11px] font-medium text-slate-600 block mb-1">
                            Minute
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              min="1"
                              max="130"
                              value={
                                entry.minute !== undefined && entry.minute !== null
                                  ? entry.minute
                                  : ""
                              }
                              onChange={(e) =>
                                handleScorerChange(entry.id, "minute", e.target.value)
                              }
                              onBlur={(e) => {
                                const val = parseInt(e.target.value, 10);
                                handleScorerChange(
                                  entry.id,
                                  "minute",
                                  isNaN(val) ? 1 : Math.max(1, Math.min(130, val))
                                );
                              }}
                              className="w-full h-9 pl-3 pr-8 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                            />
                            <span className="absolute right-2.5 text-[11px] font-medium text-slate-400 pointer-events-none">
                              min
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading || isMatchLoading}
              className="h-9 px-4 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isMatchLoading}
              className="h-9 px-4 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Score & Goals</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyScoreModal;
