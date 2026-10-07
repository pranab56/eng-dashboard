"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetMatchEvaluationQuery,
  useSaveMatchEvaluationMutation,
} from "@/features/match/matchApi";
import {
  useGetSingleTeamQuery,
  useGetBudgetAndEconomayQuery,
} from "@/features/teamManagement/teamApi";
import { formatImagePath } from "@/utils/formatImagePath";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AdjustMatchConductModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
  onSuccess?: () => void;
}

const CONDUCT_TIERS: Record<number, { label: string; desc: string }> = {
  10: { label: "Exceptional", desc: "Exemplary fair play and sporting conduct." },
  9: { label: "Good", desc: "High fair play standard with positive team conduct." },
  8: { label: "Good", desc: "High fair play standard with positive team conduct." },
  7: { label: "Satisfactory", desc: "Acceptable conduct, minor cautions only." },
  6: { label: "Satisfactory", desc: "Acceptable conduct, minor cautions only." },
  5: { label: "Average", desc: "Moderate cautions or dissent recorded." },
  4: { label: "Poor", desc: "Frequent dissent or unsporting conduct recorded." },
  3: { label: "Poor", desc: "Frequent dissent or unsporting conduct recorded." },
  2: { label: "Unprofessional", desc: "Severe disciplinary breaches or multiple cautions." },
  1: { label: "Gross Misconduct", desc: "Hostile conduct or serious disciplinary violation." },
};

export const AdjustMatchConductModal: React.FC<AdjustMatchConductModalProps> = ({
  isOpen,
  onClose,
  match,
  onSuccess,
}) => {
  const matchId = match?._id || match?.id;

  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;

  const { data: evalData, isLoading: isFetchingEval } = useGetMatchEvaluationQuery(
    matchId,
    { skip: !isOpen || !matchId }
  );

  const { data: homeTeamData } = useGetSingleTeamQuery(homeTeamId, {
    skip: !homeTeamId || !isOpen,
  });
  const { data: awayTeamData } = useGetSingleTeamQuery(awayTeamId, {
    skip: !awayTeamId || !isOpen,
  });
  const { data: economyData } = useGetBudgetAndEconomayQuery(undefined, {
    skip: !isOpen,
  });

  const [saveEvaluation, { isLoading: isSaving }] = useSaveMatchEvaluationMutation();

  const [homeRating, setHomeRating] = useState<number>(10);
  const [awayRating, setAwayRating] = useState<number>(10);
  const [motm, setMotm] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const existingEval = evalData?.data;

  useEffect(() => {
    if (isOpen && existingEval) {
      const hRate = Number(existingEval.homeTeamRating);
      const aRate = Number(existingEval.awayTeamRating);
      setHomeRating(!isNaN(hRate) && hRate >= 1 ? (hRate > 10 ? Math.round(hRate / 10) : hRate) : 10);
      setAwayRating(!isNaN(aRate) && aRate >= 1 ? (aRate > 10 ? Math.round(aRate / 10) : aRate) : 10);
      setMotm(existingEval.manOfTheMatch?._id || existingEval.manOfTheMatch || "");
      setNotes(existingEval.notes || "");
    } else if (isOpen) {
      setHomeRating(10);
      setAwayRating(10);
      setMotm(match?.manOfTheMatch?._id || match?.manOfTheMatch || "");
      setNotes("");
    }
  }, [isOpen, existingEval, match]);

  // Combined players list for Man of the Match selection
  const allMatchPlayers = useMemo(() => {
    const homePlayers = (homeTeamData?.data?.members || []).map((p: any) => ({
      ...p,
      teamName: homeTeamData?.data?.teamName || "Home Team",
    }));
    const awayPlayers = (awayTeamData?.data?.members || []).map((p: any) => ({
      ...p,
      teamName: awayTeamData?.data?.teamName || "Away Team",
    }));
    return [...homePlayers, ...awayPlayers];
  }, [homeTeamData, awayTeamData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId) return;

    try {
      await saveEvaluation({
        match: matchId,
        homeTeam: homeTeamId,
        awayTeam: awayTeamId,
        homeTeamRating: homeRating,
        awayTeamRating: awayRating,
        manOfTheMatch: motm && motm.trim() !== "" ? motm : undefined,
        notes: notes.trim() !== "" ? notes.trim() : undefined,
        isAdminOverride: true,
      }).unwrap();

      toast.success("Match conduct ratings updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update match conduct ratings");
    }
  };

  const homeTier = CONDUCT_TIERS[homeRating] || CONDUCT_TIERS[10];
  const awayTier = CONDUCT_TIERS[awayRating] || CONDUCT_TIERS[10];

  const homeLogo = formatImagePath(match?.homeTeam?.teamLogo || homeTeamData?.data?.teamLogo);
  const awayLogo = formatImagePath(match?.awayTeam?.teamLogo || awayTeamData?.data?.teamLogo);

  const homeName = match?.homeTeam?.teamName || homeTeamData?.data?.teamName || "Home Team";
  const awayName = match?.awayTeam?.teamName || awayTeamData?.data?.teamName || "Away Team";

  // Economy reward calculations
  const economyConfig = economyData?.data;
  const getTierCoins = (rating: number): number | null => {
    if (!economyConfig) return null;
    if (rating >= 10) return economyConfig?.exceptionalConduct?.coin ?? 5000;
    if (rating >= 8) return economyConfig?.goodConduct?.coin ?? 3000;
    if (rating >= 6) return economyConfig?.satisfactoryConduct?.coin ?? 1500;
    if (rating >= 5) return economyConfig?.averageConduct?.coin ?? 0;
    if (rating >= 3) return economyConfig?.poorConduct?.coin ?? 0;
    return economyConfig?.unprofessionalConduct?.coin ?? 0;
  };

  const homeCoins = getTierCoins(homeRating);
  const awayCoins = getTierCoins(awayRating);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg p-0 gap-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden rounded-lg">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
            Match Team Conduct Ratings
          </DialogTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record fair play assessments and disciplinary ratings for this match
          </p>
        </div>

        {/* Match Overview Bar (Flat, enterprise-aligned) */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
          {/* Home */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-5 h-5 relative shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              {homeLogo ? (
                <Image src={homeLogo} alt="" fill className="object-contain p-0.5" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700" />
              )}
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {homeName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono uppercase">H</span>
          </div>

          {/* Score / Status */}
          <div className="shrink-0 px-3 text-center">
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {match?.homeScore ?? 0} – {match?.awayScore ?? 0}
            </span>
            <span className="text-[10px] text-slate-400 block uppercase font-mono">
              {match?.status || "MATCH"}
            </span>
          </div>

          {/* Away */}
          <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
            <span className="text-[10px] text-slate-400 font-mono uppercase">A</span>
            <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
              {awayName}
            </span>
            <div className="w-5 h-5 relative shrink-0 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
              {awayLogo ? (
                <Image src={awayLogo} alt="" fill className="object-contain p-0.5" />
              ) : (
                <div className="w-full h-full bg-slate-100 dark:bg-slate-700" />
              )}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isFetchingEval && (
          <div className="px-6 py-2 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
            Loading previous evaluation data...
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Section 1: Home Team Conduct */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {homeName}
                </span>
                <span className="text-slate-400 text-[11px]">(Home)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {homeCoins !== null && homeCoins > 0 && (
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    +{homeCoins.toLocaleString()} coins
                  </span>
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {homeRating}/10
                  <span className="text-slate-400 ml-1 font-normal font-sans">
                    • {homeTier.label}
                  </span>
                </span>
              </div>
            </div>

            {/* Segmented 1-10 selector */}
            <div className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 p-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = homeRating === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setHomeRating(num)}
                    className={`flex-1 h-7 text-xs font-medium rounded transition-colors cursor-pointer text-center ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {homeTier.desc}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Section 2: Away Team Conduct */}
          <div className="space-y-2">
            <div className="flex items-baseline justify-between text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-slate-900 dark:text-slate-100 truncate">
                  {awayName}
                </span>
                <span className="text-slate-400 text-[11px]">(Away)</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {awayCoins !== null && awayCoins > 0 && (
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                    +{awayCoins.toLocaleString()} coins
                  </span>
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {awayRating}/10
                  <span className="text-slate-400 ml-1 font-normal font-sans">
                    • {awayTier.label}
                  </span>
                </span>
              </div>
            </div>

            {/* Segmented 1-10 selector */}
            <div className="flex w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 p-0.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                const isSelected = awayRating === num;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAwayRating(num)}
                    className={`flex-1 h-7 text-xs font-medium rounded transition-colors cursor-pointer text-center ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-50 shadow-xs font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              {awayTier.desc}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Section 3: Man of the Match */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Player of the Match
            </label>
            <select
              value={motm}
              onChange={(e) => setMotm(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600"
            >
              <option value="">Not selected</option>
              {allMatchPlayers.map((player: any) => {
                const pName =
                  `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                  player.userName ||
                  player.name ||
                  "Player";
                const pId = player._id || player.id;
                return (
                  <option key={pId} value={pId}>
                    {pName} ({player.teamName}) {player.jerseyNumber ? `#${player.jerseyNumber}` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Section 4: Disciplinary Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Disciplinary & Official Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Enter match commissioner remarks or fair play observations..."
              className="w-full p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-600 resize-none"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
              Save Ratings
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
