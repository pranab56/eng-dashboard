"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUpdateTableStandingMutation,
  useResetTableStandingMutation,
} from "@/features/tableManagement/tableApi";
import { formatImagePath } from "@/utils/formatImagePath";
import { toast } from "sonner";
import {
  X,
  Loader2,
  RotateCcw,
  Check,
  Calculator,
} from "lucide-react";

interface EditTableStandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  league: {
    _id: string;
    leagueName?: string;
    season?: string;
  } | null;
  standing: any | null;
  onSuccess?: () => void;
}

export const EditTableStandingModal: React.FC<EditTableStandingModalProps> = ({
  isOpen,
  onClose,
  league,
  standing,
  onSuccess,
}) => {
  const [played, setPlayed] = useState<number>(0);
  const [win, setWin] = useState<number>(0);
  const [draw, setDraw] = useState<number>(0);
  const [loss, setLoss] = useState<number>(0);
  const [goalsFor, setGoalsFor] = useState<number>(0);
  const [goalsAgainst, setGoalsAgainst] = useState<number>(0);
  const [goalDifference, setGoalDifference] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);

  const [updateTableStanding, { isLoading: isUpdating }] =
    useUpdateTableStandingMutation();
  const [resetTableStanding, { isLoading: isResetting }] =
    useResetTableStandingMutation();

  const team = standing?.team;
  const teamId = team?._id || team?.id;

  useEffect(() => {
    if (isOpen && standing) {
      const p = Number(standing.played ?? 0);
      const w = Number(standing.win ?? 0);
      const d = Number(standing.draw ?? 0);
      const l = Number(standing.loss ?? 0);
      const gf = Number(standing.goalsFor ?? 0);
      const ga = Number(standing.goalsAgainst ?? 0);
      const gd =
        standing.goalDifference !== undefined
          ? Number(standing.goalDifference)
          : gf - ga;
      const pts =
        standing.points !== undefined ? Number(standing.points) : w * 3 + d;

      setPlayed(p);
      setWin(w);
      setDraw(d);
      setLoss(l);
      setGoalsFor(gf);
      setGoalsAgainst(ga);
      setGoalDifference(gd);
      setPoints(pts);
    }
  }, [isOpen, standing]);

  // Football math auto-calculator (Played = W+D+L, GD = GF-GA, PTS = W*3 + D)
  const handleAutoCalculate = () => {
    const computedPlayed = win + draw + loss;
    const computedGD = goalsFor - goalsAgainst;
    const computedPts = win * 3 + draw;
    setPlayed(computedPlayed);
    setGoalDifference(computedGD);
    setPoints(computedPts);
    toast.info(`Recalculated: Played=${computedPlayed}, GD=${computedGD}, PTS=${computedPts}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!league?._id) {
      toast.error("League information is missing");
      return;
    }
    if (!teamId) {
      toast.error("Team information is missing");
      return;
    }

    try {
      const payload = {
        league: league._id,
        team: teamId,
        played: Number(played),
        win: Number(win),
        draw: Number(draw),
        loss: Number(loss),
        goalsFor: Number(goalsFor),
        goalsAgainst: Number(goalsAgainst),
        goalDifference: Number(goalDifference),
        points: Number(points),
      };

      const res = await updateTableStanding(payload).unwrap();
      toast.success(res?.message || "Standing record updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update standing");
    }
  };

  const handleResetToAuto = async () => {
    if (!league?._id || !teamId) return;

    try {
      const res = await resetTableStanding({
        league: league._id,
        team: teamId,
      }).unwrap();
      toast.success(res?.message || "Standing reset to match-calculated totals");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to reset standing");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg w-full bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-lg text-slate-900"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {team?.teamLogo ? (
              <div className="w-10 h-10 rounded-full border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                <Image
                  src={formatImagePath(team.teamLogo)}
                  alt={team?.teamName || "Club crest"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-mono font-semibold text-slate-600 shrink-0">
                {team?.shortName?.slice(0, 3) || "FC"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  {team?.teamName || "Edit Standing"}
                </DialogTitle>
                {standing?.isManual ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    Manual Override
                  </span>
                ) : (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Match Computed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {league?.leagueName} {league?.season ? `(${league.season})` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Section 1: Matches */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Match Record
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Played (P)
                </label>
                <input
                  type="number"
                  min="0"
                  value={played}
                  onChange={(e) => setPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Won (W)
                </label>
                <input
                  type="number"
                  min="0"
                  value={win}
                  onChange={(e) => setWin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Drawn (D)
                </label>
                <input
                  type="number"
                  min="0"
                  value={draw}
                  onChange={(e) => setDraw(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Lost (L)
                </label>
                <input
                  type="number"
                  min="0"
                  value={loss}
                  onChange={(e) => setLoss(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Points */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Goals & Standings
              </span>
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 cursor-pointer"
                title="Recalculate Played, GD and PTS automatically"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Auto-Calculate</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2.5">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Goals For (GF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Goals Against (GA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">
                  Goal Diff (GD)
                </label>
                <input
                  type="number"
                  value={goalDifference}
                  onChange={(e) => setGoalDifference(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-semibold text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Points (PTS)
                </label>
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-center text-sm font-mono font-bold text-slate-950 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
            {standing?.isManual ? (
              <button
                type="button"
                onClick={handleResetToAuto}
                disabled={isResetting || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                title="Wipe manual override and recalculate from match engine"
              >
                {isResetting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Reset to Matches</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating || isResetting}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isResetting}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Standing</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
