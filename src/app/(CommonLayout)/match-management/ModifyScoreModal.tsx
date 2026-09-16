"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModifyScoreMutation, useGetSingleMatchQuery } from "@/features/match/matchApi";
import { useGetSingleTeamQuery } from "@/features/teamManagement/teamApi";
import { toast } from "sonner";
import Image from "next/image";
import { formatImagePath } from "../../../utils/formatImagePath";
import { X, Plus, Trash2, UserCheck, Shield, Award, Loader2 } from "lucide-react";

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
  assistName?: string;
  goalType: 'normal' | 'penalty' | 'header' | 'own_goal' | 'free_kick';
  minute: number | string;
}

const ModifyScoreModal = ({ match, isOpen, onClose }: ModifyScoreModalProps) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [goalScorers, setGoalScorers] = useState<GoalScorerEntry[]>([]);
  const [selectedPOTD, setSelectedPOTD] = useState<string>("");

  const [modifyScore, { isLoading }] = useModifyScoreMutation();

  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;
  const currentMatchId = match?._id || match?.id;
  const loadedMatchIdRef = React.useRef<string | null>(null);

  // Fetch players for home & away teams
  const { data: homeTeamData } = useGetSingleTeamQuery(homeTeamId, {
    skip: !homeTeamId || !isOpen,
  });
  const { data: awayTeamData } = useGetSingleTeamQuery(awayTeamId, {
    skip: !awayTeamId || !isOpen,
  });

  const homeMembers: any[] = homeTeamData?.data?.members || homeTeamData?.members || [];
  const awayMembers: any[] = awayTeamData?.data?.members || awayTeamData?.members || [];

  // All players combined for Player of the Day selector
  const allPlayers = React.useMemo(() => {
    const list: Array<{ id: string; name: string; teamName: string }> = [];
    homeMembers.forEach((m) => {
      list.push({
        id: String(m._id),
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        teamName: match?.homeTeam?.teamName || "Home",
      });
    });
    awayMembers.forEach((m) => {
      list.push({
        id: String(m._id),
        name: `${m.firstName || ""} ${m.lastName || ""}`.trim(),
        teamName: match?.awayTeam?.teamName || "Away",
      });
    });
    return list;
  }, [homeMembers, awayMembers, match]);

  // Fetch detailed match info (which includes goals, cards, evaluations, etc.)
  const { data: singleMatchData, isLoading: isMatchLoading } = useGetSingleMatchQuery(currentMatchId, {
    skip: !currentMatchId || !isOpen,
  });

  // Only reset form when opening modal for a new/different match
  useEffect(() => {
    if (isOpen && currentMatchId && currentMatchId !== loadedMatchIdRef.current) {
      loadedMatchIdRef.current = currentMatchId;
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
      setGoalScorers([]);
      setSelectedPOTD("");
    }
    if (!isOpen) {
      loadedMatchIdRef.current = null;
    }
  }, [isOpen, currentMatchId, match]);

  // Populate goals and evaluations when detailed match data arrives
  useEffect(() => {
    if (isOpen && singleMatchData?.data) {
      const detailedMatch = singleMatchData.data;
      setHomeScore(detailedMatch.homeScore ?? 0);
      setAwayScore(detailedMatch.awayScore ?? 0);

      const motmId =
        detailedMatch.refereeReport?.manOfTheMatch?._id ||
        detailedMatch.refereeReport?.manOfTheMatch?.id ||
        detailedMatch.refereeReport?.manOfTheMatch;
      if (motmId) {
        setSelectedPOTD(String(motmId));
      }

      if (Array.isArray(detailedMatch.goals)) {
        const scorers: GoalScorerEntry[] = detailedMatch.goals.map((g: any) => ({
          id: g._id || Math.random().toString(36).substring(2, 9),
          team: g.team?._id || g.team?.id || g.team,
          player: g.player?._id || g.player?.id || g.player || "",
          assistPlayer: g.assist?._id || g.assist?.id || g.assist || "",
          assistName: g.assist
            ? `${g.assist.firstName || ""} ${g.assist.lastName || ""}`.trim()
            : "",
          goalType: g.goalType || "normal",
          minute: g.minute !== undefined && g.minute !== null ? g.minute : 1,
        }));
        setGoalScorers(scorers);
      }
    }
  }, [isOpen, singleMatchData]);

  if (!match) return null;

  const handleAddGoalScorer = (teamId: string) => {
    setGoalScorers((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        team: teamId,
        player: "",
        assistPlayer: "",
        goalType: "normal",
        minute: 1,
      },
    ]);

    if (teamId === homeTeamId) {
      setHomeScore((prev) => prev + 1);
    } else if (teamId === awayTeamId) {
      setAwayScore((prev) => prev + 1);
    }
  };

  const handleRemoveGoalScorer = (id: string) => {
    const itemToRemove = goalScorers.find((item) => item.id === id);
    if (itemToRemove) {
      if (itemToRemove.team === homeTeamId) {
        setHomeScore((prev) => Math.max(0, prev - 1));
      } else if (itemToRemove.team === awayTeamId) {
        setAwayScore((prev) => Math.max(0, prev - 1));
      }
    }
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
        ...(g.id && /^[0-9a-fA-F]{24}$/.test(g.id) ? { _id: g.id } : {}),
        team: g.team,
        player: g.player,
        assistPlayer: g.assistPlayer || undefined,
        goalType: g.goalType || "normal",
        minute: Number(g.minute) || 1,
      }));

    try {
      const res = await modifyScore({
        id: match._id,
        data: {
          homeScore,
          awayScore,
          manOfTheMatch: selectedPOTD || null,
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
        className="sm:max-w-4xl w-full bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <DialogHeader className="bg-slate-50 p-6 border-b border-slate-100 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Modify Match Score & Assign Goals
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Update total goals & assign individual player scores with specific goal types
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 bg-white">
          {/* Score Counter Box */}
          <div className="grid grid-cols-3 items-center bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
            {/* Home Team */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-center p-2.5 transition-all">
                {match.homeTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.homeTeam.teamLogo)}
                    alt="home"
                    fill
                    className="object-contain p-1.5"
                  />
                ) : (
                  <Shield className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <span className="font-bold text-sm text-slate-850 line-clamp-1">
                {match.homeTeam?.teamName || "Home"}
              </span>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-2 text-center text-2xl font-black text-slate-950 outline-none transition-all shadow-xs"
              />
            </div>

            {/* Separator / VS */}
            <div className="flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-slate-350 font-bold text-4xl">:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/60 text-slate-600 uppercase tracking-wider">
                vs
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-xs flex items-center justify-center p-2.5 transition-all">
                {match.awayTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.awayTeam.teamLogo)}
                    alt="away"
                    fill
                    className="object-contain p-1.5"
                  />
                ) : (
                  <Shield className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <span className="font-bold text-sm text-slate-850 line-clamp-1">
                {match.awayTeam?.teamName || "Away"}
              </span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-24 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-2xl py-2 text-center text-2xl font-black text-slate-950 outline-none transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Player of the Day / Match Section */}
          <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <Award className="w-4 h-4 text-amber-600" />
                Player of the Day / Match
              </h4>
              <p className="text-xs text-amber-700/80 font-medium mt-0.5">
                Reward coins and market value for outstanding player performance
              </p>
            </div>
            <div className="w-full sm:w-72">
              <Select
                value={selectedPOTD || "none"}
                onValueChange={(val) => setSelectedPOTD(val === "none" ? "" : val)}
              >
                <SelectTrigger className="w-full bg-white border border-amber-200 rounded-xl px-3 h-10 text-xs font-semibold text-slate-800 transition-all shadow-xs cursor-pointer">
                  <SelectValue placeholder="Select Player of the Day" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">None / No Player Selected</SelectItem>
                  {allPlayers.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.teamName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal Scorer Assignment Section */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-650" />
                  Assign Goal Scorers
                </h4>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Select players to credit goals, assists, coins & stats
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(homeTeamId)}
                  className="px-4 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 active:scale-95 border border-emerald-100 hover:border-emerald-200 text-emerald-700 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>+ Home Goal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddGoalScorer(awayTeamId)}
                  className="px-4 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 active:scale-95 border border-blue-100 hover:border-blue-200 text-blue-700 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 shrink-0 text-blue-600" />
                  <span>+ Away Goal</span>
                </button>
              </div>
            </div>

            {/* Goal Scorers List */}
            {isMatchLoading ? (
              <div className="p-8 rounded-3xl bg-slate-50 text-center border border-dashed border-slate-200 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                <p className="text-xs text-slate-400 font-bold">Loading match details & goals...</p>
              </div>
            ) : goalScorers.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 text-center border border-dashed border-slate-200">
                <p className="text-xs text-slate-400 font-bold">
                  No goal scorers added yet. Click "+ Home Goal" or "+ Away Goal" to credit players.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {goalScorers.map((entry, idx) => {
                  const isHome = entry.team === homeTeamId;
                  const memberList = isHome ? homeMembers : awayMembers;
                  const teamName = isHome
                    ? match.homeTeam?.teamName || "Home"
                    : match.awayTeam?.teamName || "Away";

                  return (
                    <div
                      key={entry.id}
                      className={`p-5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 relative shadow-xs transition-all border-l-4 ${
                        isHome ? "border-l-emerald-500" : "border-l-blue-500"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          ⚽ Goal #{idx + 1} —{" "}
                          <span className={isHome ? "text-emerald-700 font-bold" : "text-blue-700 font-bold"}>
                            {teamName}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoalScorer(entry.id)}
                          className="text-slate-400 hover:text-red-650 p-2 rounded-xl hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                          title="Remove goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-7 gap-4">
                        {/* Scorer Player Select */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            Scorer Player <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={entry.player ? String(entry.player) : ""}
                            onValueChange={(val) => handleScorerChange(entry.id, "player", val)}
                          >
                            <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-semibold text-slate-800 transition-all shadow-xs cursor-pointer">
                              <SelectValue placeholder="Select Scorer" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {memberList.map((m) => (
                                <SelectItem key={String(m._id)} value={String(m._id)}>
                                  {m.firstName} {m.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Assist Player Select */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            Assist Player (Optional)
                          </label>
                          <Select
                            value={entry.assistPlayer ? String(entry.assistPlayer) : "none"}
                            onValueChange={(val) => {
                              const selectedMember = memberList.find((m) => String(m._id) === val);
                              const assistName = selectedMember
                                ? `${selectedMember.firstName || ""} ${selectedMember.lastName || ""}`.trim()
                                : "";
                              setGoalScorers((prev) =>
                                prev.map((item) =>
                                  item.id === entry.id
                                    ? {
                                        ...item,
                                        assistPlayer: val === "none" ? "" : val,
                                        assistName: val === "none" ? "" : assistName,
                                      }
                                    : item
                                )
                              );
                            }}
                          >
                            <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-semibold text-slate-800 transition-all shadow-xs cursor-pointer">
                              <SelectValue placeholder="None" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="none">None</SelectItem>
                              {entry.assistPlayer &&
                                entry.assistPlayer !== "none" &&
                                !memberList.some((m) => String(m._id) === String(entry.assistPlayer)) && (
                                  <SelectItem value={String(entry.assistPlayer)}>
                                    {entry.assistName || "Assisting Player"}
                                  </SelectItem>
                                )}
                              {memberList
                                .filter((m) => String(m._id) !== String(entry.player))
                                .map((m) => (
                                  <SelectItem key={String(m._id)} value={String(m._id)}>
                                    {m.firstName} {m.lastName}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Goal Type Select */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5">
                            Goal Type
                          </label>
                          <Select
                            value={entry.goalType}
                            onValueChange={(val) => handleScorerChange(entry.id, "goalType", val)}
                          >
                            <SelectTrigger className="w-full bg-white border border-slate-200 rounded-xl px-3 h-10 text-xs font-semibold text-slate-800 transition-all shadow-xs cursor-pointer">
                              <SelectValue placeholder="Normal Goal" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              <SelectItem value="normal">Normal Goal</SelectItem>
                              <SelectItem value="penalty">Penalty</SelectItem>
                              <SelectItem value="header">Header</SelectItem>
                              <SelectItem value="own_goal">Own Goal</SelectItem>
                              <SelectItem value="free_kick">Free Kick</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Minute Input */}
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 text-center">
                            Minute
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="130"
                            value={entry.minute !== undefined && entry.minute !== null ? entry.minute : ""}
                            onChange={(e) =>
                              handleScorerChange(entry.id, "minute", e.target.value)
                            }
                            onBlur={(e) => {
                              const val = parseInt(e.target.value, 10);
                              handleScorerChange(
                                entry.id,
                                "minute",
                                isNaN(val) ? 1 : Math.max(1, Math.min(130, val))
                              );
                            }}
                            className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none text-center shadow-xs"
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
          <div className="flex gap-4 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || isMatchLoading}
              className="flex-1 h-12 rounded-xl cursor-pointer text-slate-700 hover:text-slate-900 font-bold hover:bg-slate-100/50 border-slate-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isMatchLoading}
              className="flex-1 h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-50"
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
