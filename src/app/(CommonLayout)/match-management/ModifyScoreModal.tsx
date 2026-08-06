"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModifyScoreMutation } from "@/features/match/matchApi";
import { useGetSingleTeamQuery } from "@/features/teamManagement/teamApi";
import { toast } from "sonner";
import Image from "next/image";
import { formatImagePath } from "../../../utils/formatImagePath";
import { X, Plus, Trash2, UserCheck, Shield } from "lucide-react";

interface ModifyScoreModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

interface GoalScorerEntry {
  id: string;
  team: string; // team ID
  player: string; // player ID
  assistPlayer?: string;
  minute: number;
}

const ModifyScoreModal = ({ match, isOpen, onClose }: ModifyScoreModalProps) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [goalScorers, setGoalScorers] = useState<GoalScorerEntry[]>([]);

  const [modifyScore, { isLoading }] = useModifyScoreMutation();

  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;

  // Fetch players for home & away teams
  const { data: homeTeamData } = useGetSingleTeamQuery(homeTeamId, {
    skip: !homeTeamId || !isOpen,
  });
  const { data: awayTeamData } = useGetSingleTeamQuery(awayTeamId, {
    skip: !awayTeamId || !isOpen,
  });

  const homeMembers: any[] = homeTeamData?.data?.members || homeTeamData?.members || [];
  const awayMembers: any[] = awayTeamData?.data?.members || awayTeamData?.members || [];

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setGoalScorers([]);
    }
  }, [match, isOpen]);

  if (!match) return null;

  const handleAddGoalScorer = (teamId: string) => {
    setGoalScorers((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        team: teamId,
        player: "",
        assistPlayer: "",
        minute: 1,
      },
    ]);
  };

  const handleRemoveGoalScorer = (id: string) => {
    setGoalScorers((prev) => prev.filter((item) => item.id !== id));
  };

  const handleScorerChange = (id: string, field: string, value: any) => {
    setGoalScorers((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Filter valid goal scorers that have a player selected
    const validScorers = goalScorers
      .filter((g) => g.player && g.team)
      .map((g) => ({
        team: g.team,
        player: g.player,
        assistPlayer: g.assistPlayer || undefined,
        minute: Number(g.minute) || 1,
      }));

    try {
      const res = await modifyScore({
        id: match._id,
        data: {
          homeScore,
          awayScore,
          goalScorers: validScorers,
        },
      }).unwrap();

      if (res.success) {
        toast.success(res.message || "Match score modified successfully!");
      } else {
        toast.success("Match score modified successfully!");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to modify match score");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="bg-slate-950 p-6 text-white relative text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Modify Match Score & Assign Goals
          </DialogTitle>
          <p className="text-xs text-gray-400 mt-1">
            Update total goals & assign individual player scores
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Score Counter Box */}
          <div className="flex items-center justify-between gap-6 bg-gray-50/80 p-6 rounded-2xl border border-gray-100 shadow-inner">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center space-y-2">
              <div className="relative w-14 h-14 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-2">
                {match.homeTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.homeTeam.teamLogo)}
                    alt="home"
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <Shield className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <span className="font-semibold text-sm text-gray-800 line-clamp-1">
                {match.homeTeam?.teamName || "Home"}
              </span>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl py-2 text-center text-xl font-bold text-gray-900 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Separator / VS */}
            <div className="text-gray-300 font-light text-3xl">:</div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center space-y-2">
              <div className="relative w-14 h-14 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-2">
                {match.awayTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.awayTeam.teamLogo)}
                    alt="away"
                    fill
                    className="object-contain p-1"
                  />
                ) : (
                  <Shield className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <span className="font-semibold text-sm text-gray-800 line-clamp-1">
                {match.awayTeam?.teamName || "Away"}
              </span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-20 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg py-2 text-center text-xl font-bold text-gray-900 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Goal Scorer Assignment Section */}
          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Assign Goal Scorers
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select players to credit goals, assists, coins & leaderboards
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(homeTeamId)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Home Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(awayTeamId)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>Away Goal</span>
                </button>
              </div>
            </div>

            {/* Goal Scorers List */}
            {goalScorers.length === 0 ? (
              <div className="p-5 rounded-2xl bg-gray-50/70 text-center border border-dashed border-gray-200">
                <p className="text-xs text-gray-400 font-medium">
                  No goal scorers added yet. Click "+ Home Goal" or "+ Away Goal" to credit players.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {goalScorers.map((entry, idx) => {
                  const isHome = entry.team === homeTeamId;
                  const memberList = isHome ? homeMembers : awayMembers;
                  const teamName = isHome
                    ? match.homeTeam?.teamName || "Home"
                    : match.awayTeam?.teamName || "Away";

                  return (
                    <div
                      key={entry.id}
                      className="p-4 bg-gray-50/90 rounded-2xl border border-gray-200 space-y-3 relative shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                          ⚽ Goal #{idx + 1} —{" "}
                          <span className={isHome ? "text-emerald-600" : "text-blue-600"}>
                            {teamName}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoalScorer(entry.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
                        {/* Scorer Player Select */}
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Scorer Player <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={entry.player}
                            onChange={(e) => handleScorerChange(entry.id, "player", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-emerald-500 shadow-xs"
                          >
                            <option value="">Select Scorer</option>
                            {memberList.map((m) => (
                              <option key={m._id} value={m._id}>
                                {m.firstName} {m.lastName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Assist Player Select */}
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Assist Player (Optional)
                          </label>
                          <select
                            value={entry.assistPlayer || ""}
                            onChange={(e) => handleScorerChange(entry.id, "assistPlayer", e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-emerald-500 shadow-xs"
                          >
                            <option value="">None</option>
                            {memberList
                              .filter((m) => m._id !== entry.player)
                              .map((m) => (
                                <option key={m._id} value={m._id}>
                                  {m.firstName} {m.lastName}
                                </option>
                              ))}
                          </select>
                        </div>

                        {/* Minute Input */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Minute
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={entry.minute}
                            onChange={(e) =>
                              handleScorerChange(entry.id, "minute", parseInt(e.target.value) || 1)
                            }
                            className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-medium text-gray-800 focus:outline-none focus:border-emerald-500 text-center shadow-xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl cursor-pointer text-gray-600 font-semibold hover:bg-gray-50 border-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Save Score & Goals"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyScoreModal;
