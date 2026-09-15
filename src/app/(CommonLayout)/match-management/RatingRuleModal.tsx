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
import { Clock, ShieldCheck, X, Sparkles, CheckCircle2 } from "lucide-react";

interface RatingRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RatingRuleModal = ({ isOpen, onClose }: RatingRuleModalProps) => {
  const { data: settingData } =
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
            ? `Feedback rule updated: ${feedbackHours} hours allowed.`
            : "Feedback restriction disabled: Coaches & referees can rate anytime!"
        );
      } else {
        toast.success("Settings saved successfully!");
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
        className="sm:max-w-xl w-full bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <DialogHeader className="bg-slate-50 p-6 border-b border-slate-100 relative shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-800">
                Match Rating & Feedback Rule
              </DialogTitle>
              <p className="text-xs text-slate-500">
                Set or disable the time limit for coaches and referees to submit ratings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-700 block">
                Current Restriction Status
              </span>
              <span className="text-xs text-slate-500 block">
                {isRestricted
                  ? `Ratings allowed within ${feedbackHours} hours after match finishes.`
                  : "No restriction. Coaches & referees can rate anytime!"}
              </span>
            </div>
            {isRestricted ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Restricted</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Unlimited</span>
              </span>
            )}
          </div>

          {/* Restriction Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="space-y-1 max-w-[80%]">
              <span className="text-sm font-bold text-slate-900 block">
                Enforce Time Restriction
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isRestricted
                  ? "Submissions are locked once the time window expires."
                  : "Restriction is DISABLED. Coaches will never see 'Already done' or expiration errors."}
              </p>
            </div>

            {/* Switch button */}
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

          {/* Configurable Hours (Active if restricted) */}
          <div className={`space-y-4 transition-all duration-200 ${isRestricted ? "opacity-100" : "opacity-50 pointer-events-none"}`}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Feedback Window (Hours)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="720"
                  disabled={!isRestricted}
                  value={feedbackHours}
                  onChange={(e) => setFeedbackHours(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs text-center"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "24h", val: 24 },
                    { label: "48h", val: 48 },
                    { label: "72h", val: 72 },
                    { label: "7 Days", val: 168 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setFeedbackHours(preset.val)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        feedbackHours === preset.val
                          ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
                Timezone Standard
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                <span>🇬🇧 Europe/London (UK Time)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">Fixed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? <span>Saving...</span> : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Save Rule</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingRuleModal;
