"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useHeaders } from "@/hooks/useHeaders";
import { toast } from "sonner";
import {
  useGetMatchFeedbackSettingQuery,
  useUpdateMatchFeedbackSettingMutation,
} from "@/features/match/matchApi";
import { Loader2, RefreshCw } from "lucide-react";

const PRESET_HOURS = [
  { label: "24h (1 Day)", value: 24 },
  { label: "48h (2 Days)", value: 48 },
  { label: "72h (3 Days)", value: 72 },
  { label: "7 Days (168h)", value: 168 },
];

const Settings = () => {
  const { setHeaders } = useHeaders();

  const {
    data: feedbackSettingData,
    isLoading: isFetching,
    refetch,
  } = useGetMatchFeedbackSettingQuery(undefined);
  const [updateMatchFeedbackSetting, { isLoading: isUpdating }] =
    useUpdateMatchFeedbackSettingMutation();

  const [isRestricted, setIsRestricted] = useState(true);
  const [feedbackHours, setFeedbackHours] = useState(24);
  const [feedbackTimezone, setFeedbackTimezone] = useState("Europe/London");

  // Track initial server state to detect changes
  const [initialState, setInitialState] = useState({
    isRestricted: true,
    feedbackHours: 24,
    feedbackTimezone: "Europe/London",
  });

  useEffect(() => {
    setHeaders({
      title: "General Settings",
      des: "Configure system-wide match evaluation rules and feedback deadlines.",
    });
  }, [setHeaders]);

  useEffect(() => {
    if (feedbackSettingData?.data) {
      const { isFeedbackWindowRestricted, feedbackWindowHours, timezone } =
        feedbackSettingData.data;
      const restricted = isFeedbackWindowRestricted !== false;
      const hours = Number(feedbackWindowHours) || 24;
      const tz = timezone || "Europe/London";

      setIsRestricted(restricted);
      setFeedbackHours(hours);
      setFeedbackTimezone(tz);

      setInitialState({
        isRestricted: restricted,
        feedbackHours: hours,
        feedbackTimezone: tz,
      });
    }
  }, [feedbackSettingData]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      isRestricted !== initialState.isRestricted ||
      feedbackHours !== initialState.feedbackHours
    );
  }, [isRestricted, feedbackHours, initialState]);

  const handleReset = () => {
    setIsRestricted(initialState.isRestricted);
    setFeedbackHours(initialState.feedbackHours);
    setFeedbackTimezone(initialState.feedbackTimezone);
    toast.info("Reverted to saved settings");
  };

  const handleSave = async () => {
    try {
      const payload = {
        isFeedbackWindowRestricted: isRestricted,
        feedbackWindowHours: Number(feedbackHours) || 0,
        timezone: feedbackTimezone || "Europe/London",
      };

      const res = await updateMatchFeedbackSetting(payload).unwrap();
      if (res?.success) {
        toast.success(
          isRestricted
            ? `Feedback rule updated: ${feedbackHours}-hour submission window.`
            : "Feedback restriction disabled: Open evaluation window enabled."
        );
      } else {
        toast.success("Settings saved successfully.");
      }

      setInitialState({
        isRestricted,
        feedbackHours,
        feedbackTimezone,
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update feedback settings");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            General Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage system-wide configuration, match evaluation rules, and submission policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Section Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Match Rating & Feedback Policy
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Control the allowable timeframe for coaches and referees to submit evaluations post-match.
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${
                isRestricted
                  ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
              }`}
            >
              {isRestricted ? `Limit Active (${feedbackHours}h)` : "Open (Unlimited)"}
            </span>
          </div>
        </div>

        {/* Setting Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Row 1: Time Restriction Toggle */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <label
                htmlFor="enforce-restriction-toggle"
                className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer"
              >
                Enforce Feedback Time Limit
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                When enabled, coaches and referees must submit their evaluations within the configured time window. When disabled, submissions are accepted indefinitely without expiration errors.
              </p>
            </div>

            {/* Custom Toggle Switch */}
            <button
              id="enforce-restriction-toggle"
              type="button"
              role="switch"
              aria-checked={isRestricted}
              onClick={() => setIsRestricted((prev) => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:focus-visible:ring-slate-100 focus-visible:ring-offset-2 ${
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

          {/* Row 2: Allowed Window Hours (Shown when restricted) */}
          {isRestricted ? (
            <div className="p-5 sm:p-6 space-y-4 bg-slate-50/20 dark:bg-slate-800/10">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Allowed Submission Window
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Specify the maximum number of hours after a match concludes for rating submission.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Numeric Input */}
                <div className="relative w-full sm:w-32">
                  <input
                    type="number"
                    min="1"
                    max="720"
                    value={feedbackHours}
                    onChange={(e) =>
                      setFeedbackHours(Math.max(1, parseInt(e.target.value, 10) || 1))
                    }
                    className="h-9 w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-sm text-slate-900 dark:text-slate-100 font-medium focus:border-slate-900 dark:focus:border-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                    hours
                  </span>
                </div>

                {/* Preset Options */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESET_HOURS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFeedbackHours(preset.value)}
                      className={`h-9 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
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
            <div className="p-5 sm:p-6 bg-slate-50/40 dark:bg-slate-800/20">
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Time restrictions are currently <strong>disabled</strong>. Evaluators can rate players, teams, and referees at any time without submission deadlines.
              </div>
            </div>
          )}

          {/* Row 3: System Timezone Reference */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                Evaluation Timezone Standard
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All match schedules, final whistles, and expiration cut-offs are synchronized using this timezone standard.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700">
                {feedbackTimezone}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {hasUnsavedChanges ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                You have unsaved changes.
              </span>
            ) : (
              <span>All changes are saved.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {hasUnsavedChanges && (
              <button
                type="button"
                onClick={handleReset}
                disabled={isUpdating}
                className="h-8.5 px-3.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                Discard
              </button>
            )}

            <button
              type="button"
              disabled={isUpdating || !hasUnsavedChanges}
              onClick={handleSave}
              className="h-8.5 px-4 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 rounded-md transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
            >
              {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
