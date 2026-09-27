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
  X,
  Loader2,
  RotateCcw,
  Check,
  RefreshCw,
  Trophy,
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

  // Recalculate helper (standard football math)
  const handleAutoCalculate = () => {
    const computedPlayed = win + draw + loss;
    const computedGD = goalsFor - goalsAgainst;
    const computedPts = win * 3 + draw;
    setPlayed(computedPlayed);
    setGoalDifference(computedGD);
    setPoints(computedPts);
    toast.info("Recalculated: Played=" + computedPlayed + ", GD=" + computedGD + ", PTS=" + computedPts);
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
      toast.success(res?.message || "Table standing updated successfully");
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
        className="sm:max-w-lg w-full bg-white rounded-xl p-0 overflow-hidden border border-gray-200 shadow-xl text-gray-900"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {team?.teamLogo ? (
              <Image
                src={formatImagePath(team.teamLogo)}
                alt="logo"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                {team?.shortName || "FC"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-gray-900">
                  {team?.teamName || "Edit Standing"}
                </DialogTitle>
                {standing?.isManual && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-200 text-gray-700">
                    Manual
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {league?.leagueName} {league?.season ? `(${league.season})` : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Matches */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Match Record
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Played (P)
                </label>
                <input
                  type="number"
                  min="0"
                  value={played}
                  onChange={(e) => setPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Won (W)
                </label>
                <input
                  type="number"
                  min="0"
                  value={win}
                  onChange={(e) => setWin(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Drawn (D)
                </label>
                <input
                  type="number"
                  min="0"
                  value={draw}
                  onChange={(e) => setDraw(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Lost (L)
                </label>
                <input
                  type="number"
                  min="0"
                  value={loss}
                  onChange={(e) => setLoss(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Goals & Points */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Goals & Points
              </span>
              <button
                type="button"
                onClick={handleAutoCalculate}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                title="Recalculate Played, GD and Points from W, D, L, GF, GA"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Recalculate PTS & GD</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Goals For (GF)
                </label>
                <input
                  type="number"
                  min="0"
                  value={goalsFor}
                  onChange={(e) => setGoalsFor(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Goals Against (GA)
                </label>
                <input
                  type="number"
                  min="0"
                  value={goalsAgainst}
                  onChange={(e) => setGoalsAgainst(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-gray-500 block mb-1">
                  Goal Diff (GD)
                </label>
                <input
                  type="number"
                  value={goalDifference}
                  onChange={(e) => setGoalDifference(parseInt(e.target.value) || 0)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  Points (PTS)
                </label>
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={(e) => setPoints(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm font-bold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            {standing?.isManual ? (
              <button
                type="button"
                onClick={handleResetToAuto}
                disabled={isResetting || isUpdating}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>Reset to Match Results</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating || isResetting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || isResetting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
