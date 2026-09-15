"use client";
import React, { useEffect, useState } from "react";
import { useHeaders } from "@/hooks/useHeaders";
import { toast } from "sonner";
import {
  useGetMatchFeedbackSettingQuery,
  useUpdateMatchFeedbackSettingMutation,
} from "@/features/match/matchApi";
import { Clock, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

const Settings = () => {
  const { setHeaders } = useHeaders();

  const { data: feedbackSettingData } =
    useGetMatchFeedbackSettingQuery(undefined);
  const [updateMatchFeedbackSetting, { isLoading: isUpdating }] =
    useUpdateMatchFeedbackSettingMutation();

  const [isRestricted, setIsRestricted] = useState(true);
  const [feedbackHours, setFeedbackHours] = useState(24);

  useEffect(() => {
    if (feedbackSettingData?.data) {
      const { isFeedbackWindowRestricted, feedbackWindowHours } =
        feedbackSettingData.data;
      setIsRestricted(isFeedbackWindowRestricted !== false);
      setFeedbackHours(Number(feedbackWindowHours) || 24);
    }
  }, [feedbackSettingData]);

  useEffect(() => {
    setHeaders({
      title: "Match and Rating Settings",
      des: "Configure match rating time limits and feedback submission rules.",
    });
  }, [setHeaders]);

  const handleSave = async () => {
    try {
      const payload = {
        isFeedbackWindowRestricted: isRestricted,
        feedbackWindowHours: Number(feedbackHours) || 0,
        timezone: "Europe/London",
      };

      const res = await updateMatchFeedbackSetting(payload).unwrap();
      if (res?.success) {
        toast.success(
          isRestricted
            ? `Feedback rule updated: ${feedbackHours} hours allowed (UK Time).`
            : "Feedback restriction disabled: Coaches and referees can rate anytime!"
        );
      } else {
        toast.success("Settings saved successfully!");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update feedback settings");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-6 space-y-8 animate-in fade-in duration-300">
      <section className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200/80 shadow-lg shadow-slate-200/40 relative overflow-hidden">
        {/* Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-300" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Match Rating and Feedback Rule
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Set or disable the time window for coaches and referees to submit match ratings (UK Time).
              </p>
            </div>
          </div>

          <div>
            {isRestricted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Limit Active ({feedbackHours}h)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>No Restriction (Unlimited)</span>
              </span>
            )}
          </div>
        </div>

        {/* Toggle Box */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/70 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                Enforce Feedback Time Limit
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  isRestricted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {isRestricted ? "Restricted" : "Unlimited"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isRestricted
                ? `Ratings must be submitted within ${feedbackHours} hours after match finishes.`
                : "Restriction is OFF. Coaches and referees can submit ratings anytime without 24-hour expiration errors."}
            </p>
          </div>

          {/* iOS toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={isRestricted}
            onClick={() => setIsRestricted((prev) => !prev)}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isRestricted ? "bg-amber-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isRestricted ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Hours configuration */}
        <div className={`space-y-5 transition-opacity duration-200 ${isRestricted ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Allowed Feedback Window (Hours)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="number"
                  min="1"
                  max="720"
                  disabled={!isRestricted}
                  value={feedbackHours}
                  onChange={(e) => setFeedbackHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:bg-slate-100 shadow-xs"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  Hours
                </span>
              </div>

              {/* Presets */}
              {isRestricted && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { label: "24h (1 Day)", val: 24 },
                    { label: "48h (2 Days)", val: 48 },
                    { label: "72h (3 Days)", val: 72 },
                    { label: "7 Days", val: 168 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setFeedbackHours(preset.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        feedbackHours === preset.val
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Timezone is locked to <strong>Europe/London (UK Time)</strong> for all matches.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isUpdating ? (
              <span>Saving...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Setting</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
