"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetMatchFeedbackSettingQuery,
  useUpdateMatchFeedbackSettingMutation,
} from "@/features/match/matchApi";
import { toast } from "sonner";
import { X, Loader2 } from "lucide-react";

interface RatingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_HOURS = [
  { label: "24h", value: 24 },
  { label: "48h", value: 48 },
  { label: "72h", value: 72 },
  { label: "7 Days", value: 168 },
];

const RatingRuleModal = ({ isOpen, onClose }: RatingRuleModalProps) => {
  const { data: settingData, isLoading: isFetching } =
    useGetMatchFeedbackSettingQuery(undefined, { skip: !isOpen });
  const [updateMatchFeedbackSetting, { isLoading: isSaving }] =
    useUpdateMatchFeedbackSettingMutation();

  const [isRestricted, setIsRestricted] = useState(true);
  const [feedbackHours, setFeedbackHours] = useState(24);
  const [feedbackTimezone, setFeedbackTimezone] = useState("Europe/London");

  useEffect(() => {
    if (settingData?.data) {
      const { isFeedbackWindowRestricted, feedbackWindowHours, timezone } =
        settingData.data;
      setIsRestricted(isFeedbackWindowRestricted !== false);
      setFeedbackHours(Number(feedbackWindowHours) || 24);
      if (timezone) setFeedbackTimezone(timezone);
    }
  }, [settingData]);

  const handleSave = async () => {
    try {
      const payload = {
        isFeedbackWindowRestricted: isRestricted,
        feedbackWindowHours: Number(feedbackHours) || 0,
        timezone: feedbackTimezone,
      };

      const res = await updateMatchFeedbackSetting(payload).unwrap();
      if (res?.success) {
        toast.success(
          isRestricted
            ? `Feedback rule updated: ${feedbackHours}-hour submission window.`
            : "Feedback restriction disabled: Open submission enabled."
        );
      } else {
        toast.success("Settings saved successfully.");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update rating rule");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg p-0 overflow-hidden"
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Match Rating & Feedback Rule
            </DialogTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure submission deadlines for coach and referee post-match evaluations.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Restriction Switch Row */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="restriction-toggle"
                  className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
                >
                  Enforce Time Restriction
                </label>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                    isRestricted
                      ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                  }`}
                >
                  {isRestricted ? "Restricted" : "Open Window"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal max-w-sm">
                When enabled, ratings and feedback must be submitted within the specified time window after a match ends.
              </p>
            </div>

            {/* Custom Accessible Toggle */}
            <button
              id="restriction-toggle"
              type="button"
              role="switch"
              aria-checked={isRestricted}
              onClick={() => setIsRestricted((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${
                isRestricted ? "bg-slate-900 dark:bg-slate-100" : "bg-slate-200 dark:bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-slate-900 shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isRestricted ? "translate-x-5 dark:bg-slate-900" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800" />

          {/* Submission Window Configuration */}
          {isRestricted ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Submission Window (Hours)
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                  Allowed duration after final whistle for coaches and referees to complete ratings.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={feedbackHours}
                    onChange={(e) =>
                      setFeedbackHours(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="h-8.5 w-24 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:border-slate-900 dark:focus:border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    hrs
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {PRESET_HOURS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFeedbackHours(preset.value)}
                      className={`h-8.5 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        feedbackHours === preset.value
                          ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
                          : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Time restriction is turned off. Evaluators can submit ratings and feedback at any point after the match without encountering an expiration block.
            </div>
          )}

          {/* Timezone Information */}
          <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">System Timezone</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {feedbackTimezone} (UTC)
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-8.5 px-3.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving || isFetching}
            onClick={handleSave}
            className="h-8.5 px-4 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-2xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Changes</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingRuleModal;
