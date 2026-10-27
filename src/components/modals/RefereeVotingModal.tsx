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
import { NomineeRefereeSelectDropdown } from "@/components/dropdowns/NomineeRefereeSelectDropdown";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetEligibleRefereesQuery } from "@/features/refereeVoting/refereeVotingApi";
import { useGetRefereeQuery } from "@/features/referee/refereeApi";
import { TRefereeVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Upload, Loader2, Plus, Trash2, AlertCircle } from "lucide-react";

interface RefereeVotingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TRefereeVoting | null;
  isLoading: boolean;
}

export default function RefereeVotingModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: RefereeVotingModalProps) {
  const [title, setTitle] = useState("");
  const [votingType, setVotingType] = useState<"WEEK" | "MONTH">("WEEK");
  const [league, setLeague] = useState<string>("all");
  const [weekNumber, setWeekNumber] = useState<number>(1);
  const [month, setMonth] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"upcoming" | "active" | "completed">("upcoming");
  const [description, setDescription] = useState("");

  const [nominees, setNominees] = useState<
    { referee: string; statsHighlight: string }[]
  >([
    { referee: "", statsHighlight: "" },
    { referee: "", statsHighlight: "" },
  ]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch leagues
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const leagues: any[] = useMemo(() => {
    if (Array.isArray(leaguesData?.data)) return leaguesData.data;
    if (Array.isArray(leaguesData?.data?.result)) return leaguesData.data.result;
    return [];
  }, [leaguesData]);

  // Fetch eligible referees (tries both endpoints for maximum compatibility)
  const { data: eligibleRes, isLoading: isLoadingEligible } = useGetEligibleRefereesQuery({});
  const { data: userRefRes, isLoading: isLoadingUserRef } = useGetRefereeQuery(undefined);

  const referees: any[] = useMemo(() => {
    const list1 = Array.isArray(eligibleRes?.data)
      ? eligibleRes.data
      : Array.isArray(eligibleRes?.data?.result)
      ? eligibleRes.data.result
      : [];
    if (list1.length > 0) return list1;

    const list2 = Array.isArray(userRefRes?.data)
      ? userRefRes.data
      : Array.isArray(userRefRes?.data?.result)
      ? userRefRes.data.result
      : Array.isArray(userRefRes)
      ? userRefRes
      : [];
    return list2;
  }, [eligibleRes, userRefRes]);

  const isLoadingReferees = isLoadingEligible && isLoadingUserRef;

  // Initialize or populate form
  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setTitle(editingItem.title || "");
      setVotingType(editingItem.votingType || "WEEK");
      setLeague(
        editingItem.league?._id
          ? String(editingItem.league._id)
          : editingItem.league
          ? String(editingItem.league)
          : "all"
      );
      setWeekNumber(editingItem.weekNumber || 1);
      setMonth(editingItem.month || "");
      setStartDate(
        editingItem.startDate ? editingItem.startDate.substring(0, 10) : ""
      );
      setEndDate(
        editingItem.endDate ? editingItem.endDate.substring(0, 10) : ""
      );
      setStatus(
        editingItem.status === "cancelled" ? "upcoming" : editingItem.status || "upcoming"
      );
      setDescription(editingItem.description || "");

      if (editingItem.nominees && editingItem.nominees.length >= 2) {
        setNominees(
          editingItem.nominees.map((n) => ({
            referee: n.referee?._id ? String(n.referee._id) : String(n.referee || ""),
            statsHighlight: n.statsHighlight || "",
          }))
        );
      } else {
        setNominees([
          { referee: "", statsHighlight: "" },
          { referee: "", statsHighlight: "" },
        ]);
      }

      setBannerPreview(
        editingItem.banner ? formatImagePath(editingItem.banner) : null
      );
      setBannerFile(null);
    } else {
      const now = new Date();
      const end = new Date();
      end.setDate(now.getDate() + 7);

      setTitle("Referee of the Week");
      setVotingType("WEEK");
      setLeague("all");
      setWeekNumber(Math.ceil(now.getDate() / 7));
      setMonth(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
      );
      setStartDate(now.toISOString().substring(0, 10));
      setEndDate(end.toISOString().substring(0, 10));
      setStatus("active");
      setDescription("");
      setNominees([
        { referee: "", statsHighlight: "" },
        { referee: "", statsHighlight: "" },
      ]);
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [isOpen, editingItem]);

  const handleNomineeChange = (
    index: number,
    field: "referee" | "statsHighlight",
    val: string
  ) => {
    setNominees((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const addNominee = () => {
    setNominees((prev) => [...prev, { referee: "", statsHighlight: "" }]);
  };

  const removeNominee = (index: number) => {
    if (nominees.length <= 2) {
      setErrorMsg("A minimum of 2 referee nominees is required.");
      return;
    }
    setNominees((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Campaign title is required.");
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg("Both start and end dates are required.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("End date must be strictly after the start date.");
      return;
    }

    const validNominees = nominees.filter((n) => n.referee.trim() !== "");
    if (validNominees.length < 2) {
      setErrorMsg("Please select at least 2 official referee nominees.");
      return;
    }

    const uniqueRefIds = new Set(validNominees.map((n) => n.referee));
    if (uniqueRefIds.size !== validNominees.length) {
      setErrorMsg("Duplicate referees cannot be added to the same voting round.");
      return;
    }

    const formData = new FormData();
    const payload: any = {
      title: title.trim(),
      votingType,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status,
      description: description.trim(),
      nominees: validNominees,
    };

    if (league && league !== "all") {
      payload.league = league;
    }

    if (votingType === "WEEK") {
      payload.weekNumber = Number(weekNumber);
    } else {
      payload.month = month;
    }

    formData.append("data", JSON.stringify(payload));

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save referee voting poll.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-4xl my-8 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {editingItem ? "Edit Referee Voting Campaign" : "New Referee Voting Campaign"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure official referee nomination ballots and schedule for Referee of the Week or Month.
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
                placeholder="e.g. Referee of the Week - Week 43"
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
                  setVotingType(val);
                  if (val === "WEEK") {
                    setTitle(`Referee of the Week - Week ${weekNumber}`);
                  } else {
                    setTitle("Referee of the Month");
                  }
                }}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[100]">
                  <SelectItem value="WEEK">Referee of the Week (ROTW)</SelectItem>
                  <SelectItem value="MONTH">Referee of the Month (ROTM)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {votingType === "WEEK" ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Week Number (1-53)
                </label>
                <input
                  type="number"
                  min={1}
                  max={53}
                  value={weekNumber}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setWeekNumber(num);
                    setTitle(`Referee of the Week - Week ${num}`);
                  }}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Target Month
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Competition League (Optional)
              </label>
              <Select
                value={league || "all"}
                onValueChange={(val: string) => setLeague(val)}
              >
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                  <SelectValue placeholder="All Leagues / System-wide" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[100]">
                  <SelectItem value="all">All Leagues / System-wide</SelectItem>
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
                Initial Status
              </label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white capitalize">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 z-[100]">
                  <SelectItem value="upcoming">Scheduled (Upcoming)</SelectItem>
                  <SelectItem value="active">Active (Voting Live)</SelectItem>
                  <SelectItem value="completed">Closed (Completed)</SelectItem>
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
          </div>

          {/* Nominees Section */}
          <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-3 pb-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  Ballot Nominees ({nominees.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Select official referees and their performance highlights for this voting round.
                </span>
              </div>
              <button
                type="button"
                onClick={addNominee}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add Official</span>
              </button>
            </div>

            {isLoadingReferees ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading referees list...
              </div>
            ) : (
              <div className="space-y-2.5">
                {nominees.map((nom, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-md border border-slate-200 bg-white"
                  >
                    <span className="w-5 text-center text-xs font-mono text-slate-400 font-medium">
                      #{idx + 1}
                    </span>

                    {/* Custom Referee Select Dropdown */}
                    <div className="flex-1 min-w-[200px]">
                      <NomineeRefereeSelectDropdown
                        referees={referees}
                        selectedRefereeId={nom.referee}
                        onChange={(refId) => handleNomineeChange(idx, "referee", refId)}
                        placeholder="Select official referee..."
                      />
                    </div>

                    {/* Stats Highlight */}
                    <div className="flex-1 min-w-[180px]">
                      <input
                        type="text"
                        placeholder="e.g. 4 Matches, 0 Red Cards"
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
                      onClick={() => removeNominee(idx)}
                      disabled={nominees.length <= 2}
                      className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      title="Remove Nominee"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              placeholder="Context or notes about this referee voting round..."
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
