"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUpdateTableStandingMutation,
  useResetTableStandingMutation,
} from "@/features/tableManagement/tableApi";
import { formatImagePath } from "@/utils/formatImagePath";
import { toast } from "sonner";
import {
  Trophy,
  X,
  Loader2,
  RotateCcw,
  Check,
  Shield,
  Sparkles,
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

  // Quick auto-recalculate helper
  const handleAutoCalculate = () => {
    const computedPlayed = win + draw + loss;
    const computedGD = goalsFor - goalsAgainst;
    const computedPts = win * 3 + draw;
    setPlayed(computedPlayed);
    setGoalDifference(computedGD);
    setPoints(computedPts);
    toast.info("Auto-calculated: Played = " + computedPlayed + ", GD = " + (computedGD >= 0 ? "+" + computedGD : computedGD) + ", PTS = " + computedPts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!league?._id) {
      toast.error("League information missing");
      return;
    }
    if (!teamId) {
      toast.error("Team information missing");
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
      toast.success(res?.message || "Table standing updated successfully!");
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
      toast.success(res?.message || "Reset standing back to match-calculated totals!");
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
        className="sm:max-w-lg w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-2xl text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {team?.teamLogo ? (
              <Image
                src={formatImagePath(team.teamLogo)}
                alt="logo"
                width={48}
                height={48}
                className="w-12 h-12 rounded-xl border border-slate-200 object-cover shadow-xs bg-white"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-base shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                  {team?.teamName || "Edit Standing"}
                </DialogTitle>
                {standing?.isManual && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Manual Override
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 font-medium">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{league?.leagueName || "League"}</span>
                {league?.season && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>{league.season}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Top Quick Actions Bar */}
          <div className="flex items-center justify-between bg-blue-50/60 border border-blue-100/80 rounded-xl px-4 py-2.5">
            <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Team Standing Metrics
            </span>
            <button
              type="button"
              onClick={handleAutoCalculate}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer hover:underline"
              title="Recalculate Played, Goal Difference, and Points from W/D/L and GF/GA"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Auto-Calculate PTS & GD</span>
            </button>
          </div>

          {/* Matches & Results Grid */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Match Record (P / W / D / L)
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* Played */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Played (P)
                </span>
                <input
                  type="number"
                  min="0"
                  value={played}
                  onChange={(e) => setPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-center text-lg font-bold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Wins */}
              <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-2.5 text-center focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Won (W)
                </span>
                <input
                  type="number"
                  min="0"
                  value={win}
                  onChange={(e) => {
                    const newW = Math.max(0, parseInt(e.target.value) || 0);
                    setWin(newW);
                  }}
                  className="w-full bg-transparent text-center text-lg font-bold text-emerald-800 focus:outline-none"
                />
              </div>

              {/* Draws */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center focus-within:border-slate-500 focus-within:ring-1 focus-within:ring-slate-500 transition-all">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                  Drawn (D)
                </span>
                <input
                  type="number"
                  min="0"
                  value={draw}
                  onChange={(e) => {
                    const newD = Math.max(0, parseInt(e.target.value) || 0);
                    setDraw(newD);
                  }}
                  className="w-full bg-transparent text-center text-lg font-bold text-slate-800 focus:outline-none"
                />
              </div>

              {/* Losses */}
              <div className="bg-rose-50/50 border border-rose-200/80 rounded-xl p-2.5 text-center focus-within:border-rose-500 focus-within:ring-1 focus-within:ring-rose-500 transition-all">
                <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                  Lost (L)
                </span>
                <input
                  type="number"
                  min="0"
                  value={loss}
                  onChange={(e) => {
                    const newL = Math.max(0, parseInt(e.target.value) || 0);
                    setLoss(newL);
                  }}
                  className="w-full bg-transparent text-center text-lg font-bold text-rose-800 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Goals & Standing Stats Grid */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Goals & Points (GF / GA / GD / PTS)
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {/* Goals For */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Goals For (GF)
                </span>
                <input
                  type="number"
                  min="0"
                  value={goalsFor}
                  onChange={(e) => {
                    const newGf = Math.max(0, parseInt(e.target.value) || 0);
                    setGoalsFor(newGf);
                  }}
                  className="w-full bg-transparent text-center text-lg font-bold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Goals Against */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Goals Ag (GA)
                </span>
                <input
                  type="number"
                  min="0"
                  value={goalsAgainst}
                  onChange={(e) => {
                    const newGa = Math.max(0, parseInt(e.target.value) || 0);
                    setGoalsAgainst(newGa);
                  }}
                  className="w-full bg-transparent text-center text-lg font-bold text-slate-900 focus:outline-none"
                />
              </div>

              {/* Goal Difference */}
              <div className="bg-blue-50/40 border border-blue-200/80 rounded-xl p-2.5 text-center focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  Goal Diff (GD)
                </span>
                <input
                  type="number"
                  value={goalDifference}
                  onChange={(e) => setGoalDifference(parseInt(e.target.value) || 0)}
                  className="w-full bg-transparent text-center text-lg font-bold text-blue-900 focus:outline-none"
                />
              </div>

              {/* Points */}
              <div className="bg-amber-50/50 border border-amber-300 rounded-xl p-2.5 text-center focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
                <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                  Points (PTS)
                </span>
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-transparent text-center text-xl font-black text-amber-900 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
            {standing?.isManual ? (
              <button
                type="button"
                onClick={handleResetToAuto}
                disabled={isResetting || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                title="Restore standings calculated strictly from actual match scores"
              >
                {isResetting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Reset to Auto-Calc</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating || isResetting}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isResetting}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-98"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
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
