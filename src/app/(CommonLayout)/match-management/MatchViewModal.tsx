/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import Image from "next/image";
import Link from "next/link";
import { formatImagePath } from "../../../utils/formatImagePath";
import {
  useUpdateMatchMutation,
  useGetMatchEventsQuery,
  useCreateMatchEventMutation,
  useDeleteMatchEventMutation,
} from "@/features/match/matchApi";
import { useGetSingleTeamQuery } from "@/features/teamManagement/teamApi";
import { toast } from "sonner";
import {
  X,
  Loader2,
  ShieldCheck,
  ChevronDown,
  Search,
  Check,
  Trash2,
  Plus,
} from "lucide-react";

interface MatchViewModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
  onManageCleanSheet?: (match: any) => void;
  onModifyScore?: (match: any) => void;
  onUpdateStatus?: (match: any) => void;
  onAdjustConduct?: (match: any) => void;
  initialTab?: "overview" | "events" | "actions";
}

interface EventTypeOption {
  value: string;
  label: string;
  category?: string;
  indicator?: "yellow_card" | "red_card" | "goal" | "assist" | "sin_bin" | "rating" | "none";
}

const EVENT_TYPE_OPTIONS: EventTypeOption[] = [
  // Scoring & Play
  { value: "goal", label: "Goal", category: "Scoring", indicator: "goal" },
  { value: "assist", label: "Goal Assist", category: "Scoring", indicator: "assist" },
  { value: "clean_sheet", label: "Clean Sheet", category: "Scoring", indicator: "none" },
  { value: "playing_match", label: "Match Appearance", category: "Scoring", indicator: "none" },

  // Disciplinary
  { value: "yellow_card", label: "Yellow Card", category: "Discipline", indicator: "yellow_card" },
  { value: "red_card", label: "Red Card", category: "Discipline", indicator: "red_card" },
  { value: "foul", label: "Foul Committed", category: "Discipline", indicator: "none" },
  { value: "sin_bin", label: "Sin Bin (10 Min Penalty)", category: "Discipline", indicator: "sin_bin" },
  { value: "disrespect_to_referee", label: "Disrespect to Referee", category: "Discipline", indicator: "none" },
  { value: "gross_misconduct", label: "Gross Misconduct", category: "Discipline", indicator: "red_card" },

  // Squad Management
  { value: "substitution", label: "Substitution", category: "Squad", indicator: "none" },

  // Ratings & Accolades
  { value: "player_of_the_day", label: "Player of the Match (POTD)", category: "Accolades", indicator: "rating" },
  { value: "good_rating", label: "Good Rating", category: "Accolades", indicator: "rating" },
  { value: "great_rating", label: "Great Rating", category: "Accolades", indicator: "rating" },
  { value: "elite_rating", label: "Elite Rating", category: "Accolades", indicator: "rating" },
];

/**
 * Custom Event Type Dropdown with semantic indicators (cards, goal dots)
 */
const CustomEventDropdown = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
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

  const selectedOpt = EVENT_TYPE_OPTIONS.find((o) => o.value === value) || EVENT_TYPE_OPTIONS[0];

  const renderIndicator = (indicator?: string) => {
    if (indicator === "yellow_card") {
      return <span className="w-2 h-2.5 rounded-[1px] bg-amber-400 border border-amber-500/60 shrink-0 inline-block" />;
    }
    if (indicator === "red_card") {
      return <span className="w-2 h-2.5 rounded-[1px] bg-rose-600 shrink-0 inline-block" />;
    }
    if (indicator === "goal") {
      return <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 inline-block" />;
    }
    if (indicator === "assist") {
      return <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 inline-block" />;
    }
    if (indicator === "sin_bin") {
      return <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 inline-block" />;
    }
    if (indicator === "rating") {
      return <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 inline-block" />;
    }
    return null;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg flex items-center justify-between hover:border-slate-300 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors text-left"
      >
        <div className="flex items-center gap-2 truncate">
          {renderIndicator(selectedOpt.indicator)}
          <span className="font-medium text-slate-800 truncate">{selectedOpt.label}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
          {EVENT_TYPE_OPTIONS.map((opt) => {
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
                <div className="flex items-center gap-2">
                  {renderIndicator(opt.indicator)}
                  <span>{opt.label}</span>
                </div>
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
 * Custom Searchable Player Dropdown
 */
const SearchablePlayerDropdown = ({
  players,
  value,
  onChange,
  placeholder = "Select player",
  emptyLabel = "No player available",
}: {
  players: any[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
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

  const selectedPlayer = players.find((m) => {
    const p = m.player || m;
    return (p._id || p.id) === value;
  });

  const selectedPlayerName = selectedPlayer
    ? (selectedPlayer.player || selectedPlayer).name ||
      (selectedPlayer.player || selectedPlayer).displayName ||
      "Selected Player"
    : "";

  const filtered = useMemo(() => {
    if (!search.trim()) return players;
    const q = search.toLowerCase();
    return players.filter((m) => {
      const p = m.player || m;
      const name = (p.name || p.displayName || p.userName || "").toLowerCase();
      const pos = (p.position || "").toLowerCase();
      return name.includes(q) || pos.includes(q);
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
        <span className={`truncate ${selectedPlayerName ? "font-medium text-slate-800" : "text-slate-400"}`}>
          {selectedPlayerName || placeholder}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 max-h-64 overflow-y-auto">
          <div className="relative mb-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full h-8 pl-8 pr-2.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 focus:bg-white text-slate-800"
              autoFocus
            />
          </div>

          <div className="max-h-44 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="py-3 text-center text-xs text-slate-400">{emptyLabel}</div>
            ) : (
              filtered.map((m) => {
                const p = m.player || m;
                const pId = p._id || p.id;
                const name = p.name || p.displayName || p.userName || "Player";
                const pos = p.position;
                const isSelected = pId === value;

                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      onChange(pId);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 text-xs flex items-center justify-between text-left rounded-md transition-colors cursor-pointer ${
                      isSelected ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate">{name}</span>
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

const MatchViewModal = ({
  match,
  isOpen,
  onClose,
  onManageCleanSheet,
  onModifyScore,
  onUpdateStatus,
  onAdjustConduct,
  initialTab = "overview",
}: MatchViewModalProps) => {
  const [activeTab, setActiveTab] = useState<"overview" | "events" | "actions">(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const [updateMatch, { isLoading: isUnassigning }] = useUpdateMatchMutation();
  const matchId = match?._id || match?.id;

  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    refetch: refetchEvents,
  } = useGetMatchEventsQuery(matchId, {
    skip: !matchId || !isOpen,
  });

  const [createMatchEvent, { isLoading: isCreatingEvent }] = useCreateMatchEventMutation();
  const [deleteMatchEvent, { isLoading: isDeletingEvent }] = useDeleteMatchEventMutation();

  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;

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

  // Event Form State
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [eventTeam, setEventTeam] = useState<"home" | "away">("home");
  const [eventType, setEventType] = useState<string>("goal");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [selectedAssistId, setSelectedAssistId] = useState<string>("");
  const [isOwnGoal, setIsOwnGoal] = useState<boolean>(false);
  const [subType, setSubType] = useState<"in" | "out">("in");
  const [eventMinute, setEventMinute] = useState<number>(1);
  const [eventNote, setEventNote] = useState<string>("");
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  if (!match) return null;

  const matchStatus = (match.status || "SCHEDULED").toUpperCase();
  const matchType = (match.matchType || "league").toLowerCase();

  const homeTeamName = match.homeTeam?.shortName || match.homeTeam?.teamName || "Home";
  const awayTeamName = match.awayTeam?.shortName || match.awayTeam?.teamName || "Away";

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;

  const homeCleanSheet =
    homeScore >= 0 && awayScore === 0 && (matchStatus === "COMPLETED" || matchStatus === "FINISHED");
  const awayCleanSheet =
    awayScore >= 0 && homeScore === 0 && (matchStatus === "COMPLETED" || matchStatus === "FINISHED");

  const currentMembers = eventTeam === "home" ? homeMembers : awayMembers;
  const currentTeamId = eventTeam === "home" ? homeTeamId : awayTeamId;

  const rawEventsList: any[] = Array.isArray(eventsData?.data)
    ? eventsData.data
    : Array.isArray(eventsData?.result)
    ? eventsData.result
    : [];

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      toast.error("Please select a player for this event");
      return;
    }

    try {
      const payload: any = {
        match: matchId,
        team: currentTeamId,
        player: selectedPlayerId,
        eventType,
        minute: Number(eventMinute) || 1,
        league: match.league?._id || match.league || undefined,
      };

      const eventMetaObj: any = {};
      if (eventType === "goal") {
        eventMetaObj.goalType = isOwnGoal ? "own_goal" : "normal";
        if (selectedAssistId) eventMetaObj.assist = selectedAssistId;
      } else if (eventType === "yellow_card") {
        eventMetaObj.cardType = "yellow";
      } else if (eventType === "red_card") {
        eventMetaObj.cardType = "red";
      } else if (eventType === "substitution") {
        eventMetaObj.substitutionType = subType || "in";
      }

      if (eventNote.trim()) {
        eventMetaObj.note = eventNote.trim();
      }

      payload.eventMeta = eventMetaObj;

      const res = await createMatchEvent(payload).unwrap();
      if (res.success) {
        toast.success("Event recorded successfully");
        setIsAddEventOpen(false);
        setSelectedPlayerId("");
        setSelectedAssistId("");
        setIsOwnGoal(false);
        setEventNote("");
        refetchEvents();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to record event");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setDeletingEventId(eventId);
      const res = await deleteMatchEvent(eventId).unwrap();
      if (res.success) {
        toast.success("Event removed and scores updated");
        refetchEvents();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete event");
    } finally {
      setDeletingEventId(null);
    }
  };

  const refereeName = match.referee
    ? match.referee.displayName ||
      match.referee.name ||
      match.referee.userName ||
      (match.referee.firstName
        ? `${match.referee.firstName} ${match.referee.lastName || ""}`.trim()
        : "") ||
      match.referee.email ||
      "Assigned Referee"
    : null;

  const handleUnassignReferee = async () => {
    try {
      const res = await updateMatch({
        id: match._id || match.id,
        data: { referee: null },
      }).unwrap();
      if (res.success) {
        toast.success("Referee unassigned successfully");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to unassign referee");
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
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Match Administration
              </DialogTitle>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                {matchType === "league" ? match.league?.leagueName || "League Match" : `${matchType.toUpperCase()} Match`}
              </span>
              {match.ageGroup && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                  {match.ageGroup}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              ID: {match._id || match.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded text-xs font-medium tracking-wide uppercase border border-slate-200 bg-slate-50 text-slate-700">
              {match.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 bg-white flex items-center gap-6 shrink-0 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`py-3 font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Match Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("events")}
            className={`py-3 font-medium border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === "events"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>Events & Cards</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
              {rawEventsList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("actions")}
            className={`py-3 font-medium border-b-2 transition-colors ${
              activeTab === "actions"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Administration
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto max-h-[72vh] space-y-6 text-slate-800">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Scoreboard Section */}
              <div className="border border-slate-200 rounded-lg p-5 bg-white">
                <div className="grid grid-cols-11 items-center gap-3">
                  <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {match.homeTeam?.teamName || "Home Team"}
                      </h3>
                      <span className="text-xs text-slate-400">Home</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {match.homeTeam?.teamLogo ? (
                        <Image
                          src={formatImagePath(match.homeTeam.teamLogo)}
                          alt="home"
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">H</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center justify-center gap-2 font-mono font-bold text-2xl text-slate-900">
                      <span>{homeScore}</span>
                      <span className="text-slate-300 font-normal">:</span>
                      <span>{awayScore}</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-1">
                      {match.period ? match.period.replace(/_/g, " ") : "Full Time"}
                    </span>
                  </div>

                  <div className="col-span-4 flex items-center justify-start gap-3 text-left">
                    <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0">
                      {match.awayTeam?.teamLogo ? (
                        <Image
                          src={formatImagePath(match.awayTeam.teamLogo)}
                          alt="away"
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">A</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {match.awayTeam?.teamName || "Away Team"}
                      </h3>
                      <span className="text-xs text-slate-400">Away</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clean Sheet Bar */}
              <div className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 ${homeCleanSheet || awayCleanSheet ? "text-teal-600" : "text-slate-400"}`} />
                  <span className="text-slate-700">
                    {homeCleanSheet && awayCleanSheet
                      ? "Clean sheet recorded for both teams (0-0)."
                      : homeCleanSheet
                      ? `Clean sheet recorded for ${match.homeTeam?.teamName || "Home"}.`
                      : awayCleanSheet
                      ? `Clean sheet recorded for ${match.awayTeam?.teamName || "Away"}.`
                      : "No clean sheet awarded."}
                  </span>
                </div>
                {onManageCleanSheet && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onManageCleanSheet(match);
                    }}
                    className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Manage
                  </button>
                )}
              </div>

              {/* Match Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Venue</span>
                  <p className="font-medium text-slate-800 line-clamp-1" title={match.venueName || "Unassigned"}>
                    {match.venueName || "Unassigned"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Formation</span>
                  <p className="font-medium text-slate-800">{match.formation || "Standard Pitch"}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Kickoff Time</span>
                  <p className="font-medium text-slate-800">
                    {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("DD MMM, HH:mm") : "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Duration</span>
                  <p className="font-medium text-slate-800">{match.durationMinutes ? `${match.durationMinutes} min` : "90 min"}</p>
                </div>
              </div>

              {/* Referee Section */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Match Referee</span>
                    <p className="text-xs font-medium text-slate-900">{refereeName || "No referee assigned"}</p>
                    {match.referee?.email && <p className="text-xs text-slate-500 mt-0.5">{match.referee.email}</p>}
                  </div>
                  {refereeName && (
                    <button
                      type="button"
                      onClick={handleUnassignReferee}
                      disabled={isUnassigning}
                      className="text-xs text-rose-600 hover:text-rose-700 font-medium disabled:opacity-50"
                    >
                      {isUnassigning ? "Unassigning..." : "Unassign"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS & CARDS TIMELINE */}
          {activeTab === "events" && (
            <div className="space-y-5">
              {/* Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Match Events</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official match log for goals, disciplinary cards, and infractions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(!isAddEventOpen)}
                  className="h-8 px-3 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddEventOpen ? "Close Form" : "Add Event"}</span>
                </button>
              </div>

              {/* Form Section */}
              {isAddEventOpen && (
                <form
                  onSubmit={handleCreateEvent}
                  className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Event Type */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Event Type <span className="text-rose-500">*</span>
                      </label>
                      <CustomEventDropdown value={eventType} onChange={setEventType} />
                    </div>

                    {/* Team Segmented Control */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Team <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex h-9 rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
                        <button
                          type="button"
                          onClick={() => {
                            setEventTeam("home");
                            setSelectedPlayerId("");
                            setSelectedAssistId("");
                          }}
                          className={`flex-1 text-xs font-medium rounded-md transition-all truncate ${
                            eventTeam === "home"
                              ? "bg-white text-slate-900 shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {homeTeamName}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEventTeam("away");
                            setSelectedPlayerId("");
                            setSelectedAssistId("");
                          }}
                          className={`flex-1 text-xs font-medium rounded-md transition-all truncate ${
                            eventTeam === "away"
                              ? "bg-white text-slate-900 shadow-xs font-semibold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {awayTeamName}
                        </button>
                      </div>
                    </div>

                    {/* Player Dropdown */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Player <span className="text-rose-500">*</span>
                      </label>
                      <SearchablePlayerDropdown
                        players={currentMembers}
                        value={selectedPlayerId}
                        onChange={setSelectedPlayerId}
                        placeholder="Select player..."
                      />
                    </div>

                    {/* Minute Input */}
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Minute (1-120) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={eventMinute}
                          onChange={(e) => setEventMinute(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
                          className="w-full h-9 pl-3 pr-9 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        />
                        <span className="absolute right-3 text-[11px] text-slate-400 font-medium pointer-events-none">
                          min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Fields */}
                  {eventType === "goal" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1.5">
                          Assisted by (Optional)
                        </label>
                        <SearchablePlayerDropdown
                          players={currentMembers.filter((m) => {
                            const p = m.player || m;
                            return (p._id || p.id) !== selectedPlayerId;
                          })}
                          value={selectedAssistId}
                          onChange={setSelectedAssistId}
                          placeholder="Select assist..."
                          emptyLabel="No eligible teammates"
                        />
                      </div>
                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isOwnGoal}
                            onChange={(e) => setIsOwnGoal(e.target.checked)}
                            className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                          />
                          <span>Own Goal (credited to opposing score)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {eventType === "substitution" && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Substitution Type
                      </label>
                      <div className="flex items-center gap-4 text-xs">
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="subType"
                            value="in"
                            checked={subType === "in"}
                            onChange={() => setSubType("in")}
                            className="text-slate-900"
                          />
                          <span>Player In (Coming onto pitch)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                          <input
                            type="radio"
                            name="subType"
                            value="out"
                            checked={subType === "out"}
                            onChange={() => setSubType("out")}
                            className="text-slate-900"
                          />
                          <span>Player Out (Leaving pitch)</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {(eventType === "yellow_card" ||
                    eventType === "red_card" ||
                    eventType === "foul" ||
                    eventType === "sin_bin" ||
                    eventType === "disrespect_to_referee" ||
                    eventType === "gross_misconduct") && (
                    <div className="pt-2 border-t border-slate-200/60">
                      <label className="text-xs font-medium text-slate-700 block mb-1.5">
                        Infraction Details (Optional)
                      </label>
                      <input
                        type="text"
                        value={eventNote}
                        onChange={(e) => setEventNote(e.target.value)}
                        placeholder="e.g. Unsporting behavior, careless tackle, dissent, time wasting"
                        className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                      />
                    </div>
                  )}

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setIsAddEventOpen(false)}
                      className="h-8 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingEvent}
                      className="h-8 px-3.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isCreatingEvent && <Loader2 className="w-3 h-3 animate-spin" />}
                      <span>Save Event</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Table Ledger */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                {isLoadingEvents ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400 mb-2" />
                    Loading events...
                  </div>
                ) : rawEventsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No events recorded for this match.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-4 w-16">Min</th>
                          <th className="py-2.5 px-4">Event</th>
                          <th className="py-2.5 px-4">Player</th>
                          <th className="py-2.5 px-4">Team</th>
                          <th className="py-2.5 px-4">Details</th>
                          <th className="py-2.5 px-4 w-12 text-right"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rawEventsList.map((ev: any) => {
                          const p = ev.player || {};
                          const pName = p.name || p.displayName || "Player";
                          const t = ev.team || {};
                          const tName = t.shortName || t.teamName || "Team";
                          const isOwn = ev.eventMeta?.goalType === "own_goal";
                          const assistObj = ev.eventMeta?.assist;
                          const note = ev.eventMeta?.note;

                          const renderEventBadge = () => {
                            if (ev.eventType === "goal") {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Goal
                                </span>
                              );
                            }
                            if (ev.eventType === "assist") {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                  Goal Assist
                                </span>
                              );
                            }
                            if (ev.eventType === "yellow_card") {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                                  <span className="w-2 h-2.5 rounded-[1px] bg-amber-400 border border-amber-500/60" />
                                  Yellow Card
                                </span>
                              );
                            }
                            if (ev.eventType === "red_card") {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                                  <span className="w-2 h-2.5 rounded-[1px] bg-rose-600" />
                                  Red Card
                                </span>
                              );
                            }
                            if (ev.eventType === "sin_bin") {
                              return (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/80">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  Sin Bin
                                </span>
                              );
                            }
                            if (ev.eventType === "foul") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Foul
                                </span>
                              );
                            }
                            if (ev.eventType === "disrespect_to_referee") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  Disrespect to Referee
                                </span>
                              );
                            }
                            if (ev.eventType === "gross_misconduct") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                                  Gross Misconduct
                                </span>
                              );
                            }
                            if (ev.eventType === "substitution") {
                              const subDir = ev.eventMeta?.substitutionType === "out" ? "Out" : "In";
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Sub {subDir}
                                </span>
                              );
                            }
                            if (ev.eventType === "clean_sheet") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
                                  Clean Sheet
                                </span>
                              );
                            }
                            if (ev.eventType === "player_of_the_day") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  Player of the Match
                                </span>
                              );
                            }
                            if (ev.eventType === "good_rating") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                  Good Rating
                                </span>
                              );
                            }
                            if (ev.eventType === "great_rating") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                  Great Rating
                                </span>
                              );
                            }
                            if (ev.eventType === "elite_rating") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                  Elite Rating
                                </span>
                              );
                            }
                            if (ev.eventType === "playing_match") {
                              return (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  Appearance
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                {ev.eventType ? ev.eventType.replace(/_/g, " ") : "Event"}
                              </span>
                            );
                          };

                          return (
                            <tr key={ev._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-4 font-mono text-slate-500 font-medium">
                                {ev.minute}'
                              </td>
                              <td className="py-2.5 px-4 whitespace-nowrap">
                                {renderEventBadge()}
                              </td>
                              <td className="py-2.5 px-4 font-medium text-slate-800 whitespace-nowrap">
                                {pName}
                              </td>
                              <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">
                                {tName}
                              </td>
                              <td className="py-2.5 px-4 text-slate-500 text-xs">
                                {isOwn && <span className="text-rose-600 font-medium mr-1.5">Own Goal</span>}
                                {assistObj && <span>Assist: {assistObj.name || assistObj.displayName}</span>}
                                {note && <span>{note}</span>}
                                {!isOwn && !assistObj && !note && "-"}
                              </td>
                              <td className="py-2.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteEvent(ev._id)}
                                  disabled={deletingEventId === ev._id || isDeletingEvent}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                                  title="Delete event"
                                >
                                  {deletingEventId === ev._id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADMINISTRATION */}
          {activeTab === "actions" && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Administration & Overrides</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Administrative tools for fixture schedule, scores, and status overrides.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/match-management/create-match?id=${match._id || match.id}`}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left block"
                >
                  <h5 className="text-xs font-semibold text-slate-900">Edit Match Setup</h5>
                  <p className="text-xs text-slate-500 mt-1">
                    Modify schedule, pitch formation, venue, duration, or referee.
                  </p>
                </Link>

                {onAdjustConduct && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onAdjustConduct(match);
                    }}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  >
                    <h5 className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Adjust Team Conduct Ratings
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Override referee fair-play conduct scores and club economy rewards.
                    </p>
                  </button>
                )}

                {onModifyScore && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onModifyScore(match);
                    }}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  >
                    <h5 className="text-xs font-semibold text-slate-900">Modify Final Score</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Directly adjust home and away scores and sync clean sheets.
                    </p>
                  </button>
                )}

                {onUpdateStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUpdateStatus(match);
                    }}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  >
                    <h5 className="text-xs font-semibold text-slate-900">Update Match Status</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Set fixture status to Upcoming, Live, Half-Time, or Finished.
                    </p>
                  </button>
                )}

                {onManageCleanSheet && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onManageCleanSheet(match);
                    }}
                    className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left cursor-pointer"
                  >
                    <h5 className="text-xs font-semibold text-slate-900">Clean Sheet Override</h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Manually grant or revoke clean sheet bonus coins.
                    </p>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">Match Administration Control</span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3.5 font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchViewModal;
