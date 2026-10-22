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

export default function PlayerVotingModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: PlayerVotingModalProps) {
  const [title, setTitle] = useState("");
  const [votingType, setVotingType] = useState<"WEEK" | "MONTH">("WEEK");
  const [league, setLeague] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState<string>("");
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"upcoming" | "active" | "completed">("upcoming");
  const [description, setDescription] = useState("");

  const [nominees, setNominees] = useState<
    { player: string; statsHighlight: string }[]
  >([
    { player: "", statsHighlight: "" },
    { player: "", statsHighlight: "" },
  ]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAllAgeGroups, setShowAllAgeGroups] = useState(false);

  // Safely fetch leagues
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

  // Safely fetch players filtered by selected ageGroup (or all if toggled)
  const playerQueryParams = useMemo(() => {
    const params: Record<string, any> = { limit: 500 };
    if (ageGroup && !showAllAgeGroups) {
      params.ageGroup = ageGroup;
    }
    return params;
  }, [ageGroup, showAllAgeGroups]);

  const { data: playersData, isFetching: isFetchingPlayers } = useGetAllPlayerQuery(playerQueryParams);
  const players: any[] = useMemo(() => {
    if (Array.isArray(playersData?.data?.players)) return playersData.data.players;
    if (Array.isArray(playersData?.data?.result)) return playersData.data.result;
    if (Array.isArray(playersData?.data)) return playersData.data;
    return [];
  }, [playersData]);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title || "");
      setVotingType(editingItem.votingType || "WEEK");
      setLeague(editingItem.league?._id || (editingItem.league as any) || "");
      setAgeGroup(editingItem.ageGroup || "U16");
      setWeekNumber(editingItem.weekNumber || 1);
      setMonth(editingItem.month || "");
      setStartDate(
        editingItem.startDate ? editingItem.startDate.split("T")[0] : ""
      );
      setEndDate(editingItem.endDate ? editingItem.endDate.split("T")[0] : "");
      setStatus(
        editingItem.status === "cancelled" ? "upcoming" : editingItem.status || "upcoming"
      );
      setDescription(editingItem.description || "");

      if (editingItem.nominees && editingItem.nominees.length >= 2) {
        setNominees(
          editingItem.nominees.map((n) => ({
            player: n.player?._id || (n.player as any) || "",
            statsHighlight: n.statsHighlight || "",
          }))
        );
      } else {
        setNominees([
          { player: "", statsHighlight: "" },
          { player: "", statsHighlight: "" },
        ]);
      }

      setBannerPreview(formatImagePath(editingItem.banner));
      setBannerFile(null);
    } else {
      setTitle("");
      setVotingType("WEEK");
      setLeague(leagues[0]?._id ? String(leagues[0]._id) : "");
      setAgeGroup(leagues[0]?.ageGroup || dynamicAgeGroups[0] || "");
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
    setLeague(selectedId);
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
    if (!league) {
      setErrorMsg("Please select a competition league.");
      return;
    }

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
    formData.append("title", title);
    formData.append("votingType", votingType);
    formData.append("league", league);
    formData.append("ageGroup", ageGroup);
    if (votingType === "WEEK") {
      formData.append("weekNumber", String(weekNumber));
    } else {
      formData.append("month", month);
    }
    if (startDate) formData.append("startDate", startDate);
    if (endDate) formData.append("endDate", endDate);
    formData.append("status", status);
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
                onValueChange={(val: any) => setVotingType(val)}
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
                value={league || undefined}
                onValueChange={handleLeagueSelect}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="Select League" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
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
                value={ageGroup}
                onValueChange={(val: any) => setAgeGroup(val)}
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
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
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
