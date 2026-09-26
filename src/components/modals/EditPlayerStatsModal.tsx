"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEditPlayerStatsMutation } from "@/features/player/playerApi";
import { toast } from "sonner";
import {
  Activity,
  Award,
  Calendar,
  Check,
  FileText,
  Loader2,
  Shield,
  Trophy,
  X,
  AlertCircle,
} from "lucide-react";

interface EditPlayerStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  currentStats: any;
  onSuccess?: () => void;
}

export const EditPlayerStatsModal: React.FC<EditPlayerStatsModalProps> = ({
  isOpen,
  onClose,
  player,
  currentStats,
  onSuccess,
}) => {
  const [goals, setGoals] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [cleanSheets, setCleanSheets] = useState<number>(0);
  const [yellowCards, setYellowCards] = useState<number>(0);
  const [redCards, setRedCards] = useState<number>(0);
  const [matchesPlayed, setMatchesPlayed] = useState<number>(0);
  const [playerOfTheDay, setPlayerOfTheDay] = useState<number>(0);
  const [reason, setReason] = useState<string>("");

  const [editPlayerStats, { isLoading }] = useEditPlayerStatsMutation();

  const playerId = player?._id || player?.id;
  const fullName = player ? `${player.firstName || ""} ${player.lastName || ""}`.trim() || player.userName : "Player";

  useEffect(() => {
    if (isOpen) {
      setGoals(Number(currentStats?.goals ?? 0));
      setAssists(Number(currentStats?.assists ?? 0));
      setCleanSheets(Number(currentStats?.cleanSheets ?? 0));
      setYellowCards(Number(currentStats?.yellowCards ?? 0));
      setRedCards(Number(currentStats?.redCards ?? 0));
      setMatchesPlayed(Number(currentStats?.matchesPlayed ?? 0));
      setPlayerOfTheDay(Number(currentStats?.playerOfTheDay ?? 0));
      setReason("");
    }
  }, [isOpen, currentStats]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) {
      toast.error("Player ID missing");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a mandatory audit reason for changing player stats");
      return;
    }

    try {
      const res = await editPlayerStats({
        playerId,
        data: {
          goals: Math.max(0, goals),
          assists: Math.max(0, assists),
          cleanSheets: Math.max(0, cleanSheets),
          yellowCards: Math.max(0, yellowCards),
          redCards: Math.max(0, redCards),
          matchesPlayed: Math.max(0, matchesPlayed),
          playerOfTheDay: Math.max(0, playerOfTheDay),
          reason: reason.trim(),
        },
      }).unwrap();

      toast.success(res.message || "Player stats updated and logged to audit trail!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update player stats");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl text-slate-800"
      >
        {/* Clean Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Edit Career Statistics
              </DialogTitle>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Audit Trail Protected
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Adjust official match metrics for <span className="font-semibold text-slate-800">{fullName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
          {/* Stats Inputs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Matches */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Matches
              </label>
              <input
                type="number"
                min="0"
                value={matchesPlayed}
                onChange={(e) => setMatchesPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* Goals */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Goals
              </label>
              <input
                type="number"
                min="0"
                value={goals}
                onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* Assists */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Assists
              </label>
              <input
                type="number"
                min="0"
                value={assists}
                onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* Clean Sheets */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Clean Sheets
              </label>
              <input
                type="number"
                min="0"
                value={cleanSheets}
                onChange={(e) => setCleanSheets(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* POTD */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                POTD Awards
              </label>
              <input
                type="number"
                min="0"
                value={playerOfTheDay}
                onChange={(e) => setPlayerOfTheDay(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* Yellow Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Yellow Cards
              </label>
              <input
                type="number"
                min="0"
                value={yellowCards}
                onChange={(e) => setYellowCards(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>

            {/* Red Cards */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
              <label className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                Red Cards
              </label>
              <input
                type="number"
                min="0"
                value={redCards}
                onChange={(e) => setRedCards(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-center text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-slate-900"
              />
            </div>
          </div>

          {/* Audit Reason Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Reason for Adjustment <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">Required for compliance</span>
            </div>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Match official score sheet review: credited 1 missing goal from fixture against Tigers FC"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 resize-none transition-colors"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !reason.trim()}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
