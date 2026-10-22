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
import { TRefereeVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Upload, Loader2, Plus, Trash2, AlertCircle, Shield } from "lucide-react";

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

  // Fetch eligible referees from backend
  const { data: refereesRes, isLoading: isLoadingReferees } =
    useGetEligibleRefereesQuery({});
  const referees: any[] = useMemo(() => {
    if (Array.isArray(refereesRes?.data)) return refereesRes.data;
    return [];
  }, [refereesRes]);

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
      // Default new form
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

  // Handle Nominee changes
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
      setErrorMsg("A referee voting round requires at least 2 nominees.");
      return;
    }
    setNominees((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle File Selection
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a campaign title.");
      return;
    }

    if (!startDate || !endDate) {
      setErrorMsg("Please set both start and end dates.");
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("End date must be strictly after the start date.");
      return;
    }

    // Nominees validation
    const validNominees = nominees.filter((n) => n.referee.trim() !== "");
    if (validNominees.length < 2) {
      setErrorMsg("Please select at least 2 official referee nominees.");
      return;
    }

    const uniqueRefIds = new Set(validNominees.map((n) => n.referee));
    if (uniqueRefIds.size !== validNominees.length) {
      setErrorMsg("Duplicate referees cannot be chosen in the same voting round.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#800020]/10 flex items-center justify-center text-[#800020]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingItem ? "Edit Referee Voting Poll" : "Create Referee Voting Poll"}
              </h2>
              <p className="text-xs text-slate-500">
                Configure Referee of the Week or Month voting poll
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Campaign Title & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Campaign Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Referee of the Week - Week 43"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] text-slate-800"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Voting Period <span className="text-rose-500">*</span>
              </label>
              <Select
                value={votingType}
                onValueChange={(val: "WEEK" | "MONTH") => {
                  setVotingType(val);
                  if (val === "WEEK") {
                    setTitle(`Referee of the Week - Week ${weekNumber}`);
                  } else {
                    setTitle("Referee of the Month");
                  }
                }}
              >
                <SelectTrigger className="text-xs bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEK">Week Round</SelectItem>
                  <SelectItem value="MONTH">Month Round</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Week/Month Number & League */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {votingType === "WEEK" ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
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
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] text-slate-800"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Target Month
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] text-slate-800"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Associated League (Optional)
              </label>
              <Select value={league} onValueChange={(val) => setLeague(val)}>
                <SelectTrigger className="text-xs bg-white border-slate-200">
                  <SelectValue placeholder="All Leagues / Open" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues / System-wide</SelectItem>
                  {leagues.map((l) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.leagueName} {l.ageGroup ? `(${l.ageGroup})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Start Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                date={startDate ? new Date(startDate) : undefined}
                setDate={(d) => d && setStartDate(d.toISOString().substring(0, 10))}
                placeholder="Start Date"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                End Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                date={endDate ? new Date(endDate) : undefined}
                setDate={(d) => d && setEndDate(d.toISOString().substring(0, 10))}
                placeholder="End Date"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Poll Status
              </label>
              <Select
                value={status}
                onValueChange={(val: "upcoming" | "active" | "completed") =>
                  setStatus(val)
                }
              >
                <SelectTrigger className="text-xs bg-white border-slate-200 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming (Scheduled)</SelectItem>
                  <SelectItem value="active">Active (Voting Live)</SelectItem>
                  <SelectItem value="completed">Completed (Closed)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Referee Nominees Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Referee Nominees <span className="text-rose-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select at least 2 official referees who will compete in this round
                </p>
              </div>
              <button
                type="button"
                onClick={addNominee}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#800020] bg-[#800020]/10 hover:bg-[#800020]/20 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Nominee
              </button>
            </div>

            {isLoadingReferees ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Loading official referees list...
              </div>
            ) : (
              <div className="space-y-3">
                {nominees.map((nom, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                      <span>Nominee #{idx + 1}</span>
                      {nominees.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeNominee(idx)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <NomineeRefereeSelectDropdown
                        referees={referees}
                        selectedRefereeId={nom.referee}
                        onChange={(refId) => handleNomineeChange(idx, "referee", refId)}
                        placeholder="Choose official referee..."
                      />

                      <input
                        type="text"
                        value={nom.statsHighlight}
                        onChange={(e) =>
                          handleNomineeChange(idx, "statsHighlight", e.target.value)
                        }
                        placeholder="e.g. 4 Matches, 0 Red Cards"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banner Upload */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="text-xs font-semibold text-slate-700">
              Banner Image (Optional)
            </label>
            <div className="flex items-center gap-4">
              {bannerPreview ? (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden border border-slate-200 group shrink-0">
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
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}

              <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-[#800020] cursor-pointer transition-colors bg-white">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-xs text-slate-600 font-medium">
                  Upload campaign banner
                </span>
                <span className="text-[10px] text-slate-400">
                  PNG, JPG or WEBP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Highlight special performances, fair play moments, or rules..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#800020] text-slate-800"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-[#800020] hover:bg-[#68001a] rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {editingItem ? "Update Campaign" : "Publish Voting Campaign"}
          </button>
        </div>
      </div>
    </div>
  );
}
