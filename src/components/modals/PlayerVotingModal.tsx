/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { NomineePlayerSelectDropdown } from "@/components/dropdowns/NomineePlayerSelectDropdown";
import { useGetAllLeagueQuery, useGetLeagueAgeGroupsQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllAgeGroupQuery } from "@/features/categoryManagement/categoryApi";
import { useGetAllPlayerQuery } from "@/features/player/playerApi";
import { TPlayerVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Upload, Loader2, Plus, Trash2, AlertCircle } from "lucide-react";

interface PlayerVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TPlayerVoting | null;
  isLoading: boolean;
}

const getInitialVotingType = (item: TPlayerVoting | null): "WEEK" | "MONTH" => {
  const raw = String(item?.votingType || "WEEK").toUpperCase();
  return raw === "MONTH" ? "MONTH" : "WEEK";
};

const getInitialLeagueId = (item: TPlayerVoting | null): string => {
  if (!item) return "all";
  if (item.isOverall || !item.league) return "all";
  if (typeof item.league === "object") {
    return item.league._id ? String(item.league._id) : "all";
  }
  return String(item.league);
};

const getInitialStatus = (
  item: TPlayerVoting | null
): "upcoming" | "active" | "completed" => {
  const raw = String(item?.status || "upcoming").toLowerCase();
  if (raw === "active" || raw === "completed" || raw === "upcoming") {
    return raw;
  }
  return "upcoming";
};

const getInitialNominees = (
  item: TPlayerVoting | null
): { player: string; statsHighlight: string }[] => {
  if (item?.nominees && item.nominees.length >= 2) {
    return item.nominees.map((n) => ({
      player:
        n.player && typeof n.player === "object"
          ? String(n.player._id || "")
          : String(n.player || ""),
      statsHighlight: n.statsHighlight || "",
    }));
  }
  return [
    { player: "", statsHighlight: "" },
    { player: "", statsHighlight: "" },
  ];
};

export default function PlayerVotingModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: PlayerVotingModalProps) {
  const [title, setTitle] = useState(() => editingItem?.title || "");
  const [votingType, setVotingType] = useState<"WEEK" | "MONTH">(() =>
    getInitialVotingType(editingItem)
  );
  const [league, setLeague] = useState<string>(() =>
    getInitialLeagueId(editingItem)
  );
  const [ageGroup, setAgeGroup] = useState<string>(
    () => editingItem?.ageGroup || ""
  );
  const [weekNumber, setWeekNumber] = useState<number>(
    () => editingItem?.weekNumber || 1
  );
  const [month, setMonth] = useState(() => editingItem?.month || "");
  const [startDate, setStartDate] = useState(() =>
    editingItem?.startDate ? String(editingItem.startDate).split("T")[0] : ""
  );
  const [endDate, setEndDate] = useState(() =>
    editingItem?.endDate ? String(editingItem.endDate).split("T")[0] : ""
  );
  const [status, setStatus] = useState<"upcoming" | "active" | "completed">(
    () => getInitialStatus(editingItem)
  );
  const [description, setDescription] = useState(
    () => editingItem?.description || ""
  );

  const [nominees, setNominees] = useState<
    { player: string; statsHighlight: string }[]
  >(() => getInitialNominees(editingItem));

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(() =>
    editingItem?.banner ? formatImagePath(editingItem.banner) : null
  );
  const [errorMsg, setErrorMsg] = useState("");

  // Safely fetch leagues
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const leagues: any[] = useMemo(() => {
    const rawList: any[] = Array.isArray(leaguesData?.data)
      ? leaguesData.data
      : Array.isArray(leaguesData?.data?.result)
      ? leaguesData.data.result
      : [];

    const editLeague = editingItem?.league;
    if (
      editLeague &&
      typeof editLeague === "object" &&
      editLeague._id &&
      !rawList.some((l) => String(l?._id) === String(editLeague._id))
    ) {
      return [editLeague, ...rawList];
    }
    return rawList;
  }, [leaguesData, editingItem]);

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

    if (editingItem?.ageGroup) {
      addUnique(editingItem.ageGroup);
    }
    if (ageGroup) {
      addUnique(ageGroup);
    }

    return uniqueList.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [ageGroupRes, leagueAgeGroupsRes, leagues, editingItem, ageGroup]);

  // Safely fetch players filtered by selected ageGroup (or all if toggled)
  const playerQueryParams = useMemo(() => {
    const params: Record<string, any> = { limit: 500 };
    if (ageGroup) {
      params.ageGroup = ageGroup;
    }
    return params;
  }, [ageGroup]);

  const { data: playersData } = useGetAllPlayerQuery(playerQueryParams);
  const players: any[] = useMemo(() => {
    const fetched: any[] = Array.isArray(playersData?.data?.players)
      ? playersData.data.players
      : Array.isArray(playersData?.data?.result)
      ? playersData.data.result
      : Array.isArray(playersData?.data)
      ? playersData.data
      : [];

    // Ensure currently selected nominees from editingItem always exist in the dropdown list
    const mergedMap = new Map<string, any>();
    if (editingItem?.nominees) {
      editingItem.nominees.forEach((n) => {
        const p: any = n?.player;
        if (p && typeof p === "object" && (p._id || p.id)) {
          mergedMap.set(String(p._id || p.id), {
            ...p,
            selectTeam: n.team || p.selectTeam,
          });
        }
      });
    }
    fetched.forEach((p) => {
      if (p && (p._id || p.id)) {
        mergedMap.set(String(p._id || p.id), p);
      }
    });
    return Array.from(mergedMap.values());
  }, [playersData, editingItem]);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setVotingType(getInitialVotingType(editingItem));
      setLeague(getInitialLeagueId(editingItem));

      const rawAge = editingItem.ageGroup || "";
      const matchedAge = rawAge
        ? dynamicAgeGroups.find(
            (ag) => ag.toLowerCase() === rawAge.toLowerCase()
          ) || rawAge
        : dynamicAgeGroups[0] || "";
      setAgeGroup(matchedAge);

      setWeekNumber(editingItem.weekNumber || 1);
      setMonth(editingItem.month || "");
      setStartDate(
        editingItem.startDate ? String(editingItem.startDate).split("T")[0] : ""
      );
      setEndDate(
        editingItem.endDate ? String(editingItem.endDate).split("T")[0] : ""
      );
      setStatus(getInitialStatus(editingItem));
      setDescription(editingItem.description || "");
      setNominees(getInitialNominees(editingItem));
      setBannerPreview(
        editingItem.banner ? formatImagePath(editingItem.banner) : null
      );
      setBannerFile(null);
    } else {
      setTitle("");
      setVotingType("WEEK");
      setLeague("all");
      setAgeGroup(dynamicAgeGroups[0] || leagues[0]?.ageGroup || "U16");
      setWeekNumber(1);
      setMonth("");
      const today = new Date().toISOString().split("T")[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setStartDate(today);
      setEndDate(nextWeek);
      setStatus("upcoming");
      setDescription("");
      setNominees([
        { player: "", statsHighlight: "" },
        { player: "", statsHighlight: "" },
      ]);
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  // Match editingItem.ageGroup casing once dynamicAgeGroups loads
  useEffect(() => {
    if (editingItem?.ageGroup && dynamicAgeGroups.length > 0) {
      const exactMatch = dynamicAgeGroups.find(
        (ag) => ag.toLowerCase() === editingItem.ageGroup.toLowerCase()
      );
      if (exactMatch && ageGroup && exactMatch !== ageGroup && exactMatch.toLowerCase() === ageGroup.toLowerCase()) {
        setAgeGroup(exactMatch);
      }
    }
  }, [dynamicAgeGroups, editingItem, ageGroup]);

  // Fallback auto-assign league & ageGroup when leagues finish loading
  useEffect(() => {
    if (!editingItem && leagues.length > 0) {
      if (!league && leagues[0]?._id) {
        setLeague(String(leagues[0]._id));
      }
      if (!ageGroup) {
        setAgeGroup(leagues[0]?.ageGroup || dynamicAgeGroups[0] || "");
      }
    }
  }, [leagues, dynamicAgeGroups, editingItem, league, ageGroup]);

  // When admin switches league, auto-sync ageGroup from selected league
  const handleLeagueSelect = (selectedId: string) => {
    if (!selectedId) return;
    setLeague(selectedId);
    if (selectedId === "all") return;
    const matched = leagues.find((l) => String(l._id) === String(selectedId));
    if (matched?.ageGroup) {
      setAgeGroup(matched.ageGroup);
    }
  };

  if (!isOpen) return null;

  const handleAddNominee = () => {
    setNominees([...nominees, { player: "", statsHighlight: "" }]);
  };

  const handleRemoveNominee = (index: number) => {
    if (nominees.length <= 2) {
      setErrorMsg("A voting round must contain at least 2 nominees.");
      return;
    }
    const updated = nominees.filter((_, i) => i !== index);
    setNominees(updated);
  };

  const handleNomineeChange = (
    index: number,
    field: "player" | "statsHighlight",
    val: string
  ) => {
    const updated = [...nominees];
    updated[index][field] = val;
    setNominees(updated);
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please provide a voting campaign title.");
      return;
    }
    const isOverallRound = !league || league === "all" || league === "overall";

    // Validate nominees: ensure at least 2 valid unique players
    const selectedPlayerIds = nominees
      .map((n) => (n.player || "").trim())
      .filter(Boolean);
    if (selectedPlayerIds.length < 2) {
      setErrorMsg("Please select at least 2 valid nominee players.");
      return;
    }
    const uniqueIds = new Set(selectedPlayerIds);
    if (uniqueIds.size !== selectedPlayerIds.length) {
      setErrorMsg("Duplicate players selected. Each nominee must be unique.");
      return;
    }

    const payloadNominees = nominees
      .filter((n) => Boolean(n.player))
      .map((n) => ({
        player: n.player,
        statsHighlight: n.statsHighlight,
      }));

    const formData = new FormData();
    if (title) formData.append("title", title);
    if (votingType) formData.append("votingType", votingType);
    if (!isOverallRound && league) {
      formData.append("league", league);
      formData.append("isOverall", "false");
    } else {
      formData.append("league", "all");
      formData.append("isOverall", "true");
    }
    if (ageGroup) formData.append("ageGroup", ageGroup);
    if (votingType === "WEEK") {
      if (weekNumber) formData.append("weekNumber", String(weekNumber));
    } else if (month) {
      formData.append("month", month);
    }
    if (startDate) formData.append("startDate", startDate);
    if (endDate) formData.append("endDate", endDate);
    if (status) formData.append("status", status);
    if (description) formData.append("description", description);
    formData.append("nominees", JSON.stringify(payloadNominees));

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-4xl my-8 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {editingItem ? "Edit Voting Campaign" : "New Player Voting Campaign"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure nomination ballots and schedule for Player of the Week or Month.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Campaign Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Premier Division - Week 14 POTW"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign Type
              </label>
              <Select
                value={votingType}
                onValueChange={(val: any) => {
                  if (val) setVotingType(val);
                }}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEK">Player of the Week (POTW)</SelectItem>
                  <SelectItem value="MONTH">Player of the Month (POTM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {votingType === "WEEK" ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Week Number
                </label>
                <input
                  type="number"
                  min={1}
                  max={52}
                  value={weekNumber}
                  onChange={(e) => setWeekNumber(Number(e.target.value))}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Month
                </label>
                <input
                  type="text"
                  placeholder="e.g. October 2026"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Competition League
              </label>
              <Select
                value={league || "all"}
                onValueChange={handleLeagueSelect}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="All Leagues (Overall)" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="all">All Leagues (Overall)</SelectItem>
                  {leagues
                    .filter((l) => Boolean(l?._id))
                    .map((l) => (
                      <SelectItem key={String(l._id)} value={String(l._id)}>
                        {l.leagueName} ({l.season || "Active"})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Age Group / Division
              </label>
              <Select
                value={ageGroup || undefined}
                onValueChange={(val: any) => {
                  if (val) setAgeGroup(val);
                }}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="Select Age Group" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {dynamicAgeGroups.map((ag) => (
                    <SelectItem key={ag} value={ag}>
                      {ag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Date Pickers */}
            <div>
              <CustomDatePicker
                label="Voting Opens"
                value={startDate}
                onChange={(val) => setStartDate(val)}
                placeholder="Select start date"
              />
            </div>

            <div>
              <CustomDatePicker
                label="Voting Closes"
                value={endDate}
                onChange={(val) => setEndDate(val)}
                placeholder="Select close date"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Initial Status
              </label>
              <Select
                value={status || undefined}
                onValueChange={(val: any) => {
                  if (val) setStatus(val);
                }}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="upcoming">Scheduled (Upcoming)</SelectItem>
                  <SelectItem value="active">Active (Voting Live)</SelectItem>
                  <SelectItem value="completed">Closed (Completed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Nominees Section */}
          <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Ballot Nominees ({nominees.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Select players and their performance highlights for this round.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddNominee}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Nominee</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {nominees.map((nom, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-md border border-slate-200 bg-white"
                >
                  <span className="w-5 text-center text-xs font-mono text-slate-400 font-medium">
                    #{idx + 1}
                  </span>

                  {/* Custom Player Select Dropdown */}
                  <div className="flex-1 min-w-[200px]">
                    <NomineePlayerSelectDropdown
                      players={players}
                      selectedPlayerId={nom.player}
                      onChange={(pId) => handleNomineeChange(idx, "player", pId)}
                      placeholder="Select Nominee Player..."
                    />
                  </div>

                  {/* Stats Highlight */}
                  <div className="flex-1 min-w-[180px]">
                    <input
                      type="text"
                      placeholder="e.g. 4 Goals, 1 Assist"
                      value={nom.statsHighlight}
                      onChange={(e) =>
                        handleNomineeChange(idx, "statsHighlight", e.target.value)
                      }
                      className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                    />
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveNominee(idx)}
                    disabled={nominees.length <= 2}
                    className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Remove Nominee"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Internal Notes / Summary
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Context or notes about this campaign round..."
              className="w-full p-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white resize-none"
            />
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Banner Artwork <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="border border-dashed border-slate-300 rounded-md p-3 flex items-center gap-3 bg-slate-50/50">
              <div className="w-16 h-10 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400">None</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>{bannerFile || bannerPreview ? "Replace File" : "Choose File"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-8 px-3 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-8 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingItem ? "Save Changes" : "Create Campaign"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
