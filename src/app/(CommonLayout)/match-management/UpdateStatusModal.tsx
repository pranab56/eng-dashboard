"use client";

import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUpdateMatchStatusMutation } from "@/features/match/matchApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { toast } from "sonner";
import { Clock, X, Check, ChevronDown, ChevronUp } from "lucide-react";

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

interface UpdateStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

const presetOptions = [
  {
    id: "upcoming",
    status: "upcoming",
    period: null,
    label: "Upcoming / Scheduled",
    subLabel: "Match planned for future date",
    badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "live_1st_half",
    status: "live",
    period: "first_half",
    label: "Live · 1st Half",
    subLabel: "First half in-play",
    badgeClasses: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "half_time",
    status: "half_time",
    period: "first_half",
    label: "Half Time",
    subLabel: "Interval break between halves",
    badgeClasses: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "live_2nd_half",
    status: "live",
    period: "second_half",
    label: "Live · 2nd Half",
    subLabel: "Second half in-play",
    badgeClasses: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "finished",
    status: "finished",
    period: "second_half",
    label: "Full Time / Finished",
    subLabel: "Match fully completed",
    badgeClasses: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "cancelled",
    status: "cancelled",
    period: null,
    label: "Cancelled / Postponed",
    subLabel: "Fixture called off",
    badgeClasses: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

const UpdateStatusModal: React.FC<UpdateStatusModalProps> = ({
  isOpen,
  onClose,
  match,
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
      const currentStatus =
        match.status === "upcoming" ? "scheduled" : match.status || "scheduled";
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

  const homeName = match?.homeTeam?.teamName || "Home";
  const awayName = match?.awayTeam?.teamName || "Away";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg bg-white p-0 border border-slate-200 rounded-xl shadow-lg overflow-hidden text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <DialogTitle className="text-base font-semibold text-slate-900 tracking-tight">
              Update Match Status & Stage
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5 font-medium truncate max-w-sm">
              {homeName} <span className="text-slate-400">vs</span> {awayName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Select Match State
            </div>
            <div className="space-y-2">
              {presetOptions.map((opt) => {
                const isSelected = currentPresetId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      setSelectedStatus(opt.status);
                      setSelectedPeriod(opt.period as any);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? "border-slate-900 bg-slate-50/70"
                        : "border-slate-200 bg-white hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block">
                          {opt.label}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {opt.subLabel}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded border ${opt.badgeClasses}`}
                    >
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Timestamps Overwrite Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAdvancedTimestamps(!showAdvancedTimestamps)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              <span>{showAdvancedTimestamps ? "Hide" : "Show"} Advanced Match Timestamps (UK Time)</span>
              {showAdvancedTimestamps ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {showAdvancedTimestamps && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
              <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                Manual Timestamp Overwrite (Europe/London UK Time)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    Scheduled At
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    Started At
                  </label>
                  <input
                    type="datetime-local"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    1st Half Started
                  </label>
                  <input
                    type="datetime-local"
                    value={firstHalfStartedAt}
                    onChange={(e) => setFirstHalfStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    Half Time At
                  </label>
                  <input
                    type="datetime-local"
                    value={halfTimeAt}
                    onChange={(e) => setHalfTimeAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    2nd Half Started
                  </label>
                  <input
                    type="datetime-local"
                    value={secondHalfStartedAt}
                    onChange={(e) => setSecondHalfStartedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 text-[11px] mb-1">
                    Finished At
                  </label>
                  <input
                    type="datetime-local"
                    value={finishedAt}
                    onChange={(e) => setFinishedAt(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md text-xs bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 px-3.5 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveStatus}
            disabled={isLoading}
            className="h-8 px-4 rounded-md text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Status & Timing</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusModal;
