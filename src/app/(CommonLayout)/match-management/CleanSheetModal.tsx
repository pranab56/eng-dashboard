"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetMatchCleanSheetsQuery,
  useAwardCleanSheetMutation,
  useRevokeCleanSheetMutation,
} from "@/features/match/matchApi";
import { useGetSingleTeamQuery } from "@/features/teamManagement/teamApi";
import { formatImagePath } from "@/utils/formatImagePath";
import { toast } from "sonner";
import Image from "next/image";
import {
  Shield,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CleanSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export const CleanSheetModal: React.FC<CleanSheetModalProps> = ({
  isOpen,
  onClose,
  match,
}) => {
  const matchId = match?._id || match?.id;

  const {
    data: cleanSheetsData,
    isLoading,
    refetch,
  } = useGetMatchCleanSheetsQuery(matchId, {
    skip: !matchId || !isOpen,
  });

  const [awardCleanSheet, { isLoading: isAwarding }] = useAwardCleanSheetMutation();
  const [revokeCleanSheet, { isLoading: isRevoking }] = useRevokeCleanSheetMutation();

  const [selectedTeamTab, setSelectedTeamTab] = useState<"teamA" | "teamB">("teamA");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [awardReason, setAwardReason] = useState<string>("");

  const [revokingPlayerId, setRevokingPlayerId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState<string>("");

  const teamAInfo = cleanSheetsData?.data?.teamA;
  const teamBInfo = cleanSheetsData?.data?.teamB;

  const homeTeamId = match?.homeTeam?._id || match?.homeTeam?.id || match?.homeTeam;
  const awayTeamId = match?.awayTeam?._id || match?.awayTeam?.id || match?.awayTeam;

  const { data: homeTeamData } = useGetSingleTeamQuery(homeTeamId, {
    skip: !homeTeamId || !isOpen,
  });
  const { data: awayTeamData } = useGetSingleTeamQuery(awayTeamId, {
    skip: !awayTeamId || !isOpen,
  });

  const homeMembers: any[] = React.useMemo(
    () => homeTeamData?.data?.members || homeTeamData?.members || [],
    [homeTeamData]
  );
  const awayMembers: any[] = React.useMemo(
    () => awayTeamData?.data?.members || awayTeamData?.members || [],
    [awayTeamData]
  );

  const activeMembers = selectedTeamTab === "teamA" ? homeMembers : awayMembers;
  const activeTeamInfo = selectedTeamTab === "teamA" ? teamAInfo : teamBInfo;

  const eligibleCandidatePlayers = React.useMemo(() => {
    if (!activeMembers || !activeTeamInfo?.eligiblePlayers) return activeMembers || [];
    const currentCleanSheetPlayerIds = new Set(
      activeTeamInfo.eligiblePlayers
        .filter((ep: any) => ep.hasCleanSheet)
        .map((ep: any) => String(ep.player?._id || ep.player?.id || ep.player))
    );
    return activeMembers.filter((m: any) => !currentCleanSheetPlayerIds.has(String(m._id || m.id)));
  }, [activeMembers, activeTeamInfo]);

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      toast.error("Please select a player to award a clean sheet");
      return;
    }
    if (!awardReason.trim()) {
      toast.error("Please provide an audit reason for manual override");
      return;
    }

    try {
      const res = await awardCleanSheet({
        matchId,
        data: {
          playerId: selectedPlayerId,
          reason: awardReason.trim(),
        },
      }).unwrap();

      toast.success(res.message || "Clean sheet awarded successfully");
      setSelectedPlayerId("");
      setAwardReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to award clean sheet");
    }
  };

  const handleConfirmRevoke = async (playerId: string) => {
    if (!revokeReason.trim()) {
      toast.error("Please enter a reason for revoking this clean sheet");
      return;
    }

    try {
      const res = await revokeCleanSheet({
        matchId,
        playerId,
        data: {
          reason: revokeReason.trim(),
        },
      }).unwrap();

      toast.success(res.message || "Clean sheet revoked successfully");
      setRevokingPlayerId(null);
      setRevokeReason("");
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to revoke clean sheet");
    }
  };

  if (!match) return null;

  const homeName = match.homeTeam?.teamName || "Home Team";
  const awayName = match.awayTeam?.teamName || "Away Team";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col text-slate-800"
      >
        {/* Clean Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Clean Sheet Management
              </DialogTitle>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                Audit & Overrides
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {homeName} ({match.homeScore ?? 0}) vs {awayName} ({match.awayScore ?? 0}) • 0 goals conceded automatically awards GK & DF clean sheets
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
              <p className="text-xs font-medium">Loading clean sheet data...</p>
            </div>
          ) : (
            <>
              {/* Dual Team Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Home Team Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0">
                        {match.homeTeam?.teamLogo ? (
                          <Image
                            src={formatImagePath(match.homeTeam.teamLogo)}
                            alt={homeName}
                            fill
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          {homeName}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Conceded: {teamAInfo?.conceded ?? match.awayScore ?? 0}
                        </span>
                      </div>
                    </div>

                    {teamAInfo?.cleanSheetAwarded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        No Clean Sheet
                      </span>
                    )}
                  </div>

                  {/* Recipients List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Recipients ({teamAInfo?.eligiblePlayers?.filter((p: any) => p.hasCleanSheet)?.length || 0})
                    </span>

                    {(!teamAInfo?.eligiblePlayers ||
                      teamAInfo.eligiblePlayers.filter((p: any) => p.hasCleanSheet).length === 0) ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No recipients recorded for this match.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {teamAInfo.eligiblePlayers
                          .filter((ep: any) => ep.hasCleanSheet)
                          .map((ep: any, idx: number) => {
                            const p = ep.player;
                            const playerId = String(p?._id || p?.id || p);
                            const fullName = p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "Player";
                            const pos = ep.position || "DF";

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center shrink-0">
                                    {pos === "Goalkeeper" ? "GK" : pos === "Defender" ? "DF" : pos.substring(0, 2).toUpperCase()}
                                  </span>
                                  <span className="font-medium text-slate-800">{fullName}</span>
                                  {ep.isManual ? (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                                      Manual
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                                      Auto
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevokingPlayerId(playerId);
                                    setRevokeReason("");
                                  }}
                                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                >
                                  Revoke
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Away Team Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0">
                        {match.awayTeam?.teamLogo ? (
                          <Image
                            src={formatImagePath(match.awayTeam.teamLogo)}
                            alt={awayName}
                            fill
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <Shield className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-900 leading-tight">
                          {awayName}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          Conceded: {teamBInfo?.conceded ?? match.homeScore ?? 0}
                        </span>
                      </div>
                    </div>

                    {teamBInfo?.cleanSheetAwarded ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        No Clean Sheet
                      </span>
                    )}
                  </div>

                  {/* Recipients List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-slate-400 block">
                      Recipients ({teamBInfo?.eligiblePlayers?.filter((p: any) => p.hasCleanSheet)?.length || 0})
                    </span>

                    {(!teamBInfo?.eligiblePlayers ||
                      teamBInfo.eligiblePlayers.filter((p: any) => p.hasCleanSheet).length === 0) ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No recipients recorded for this match.
                      </p>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                        {teamBInfo.eligiblePlayers
                          .filter((ep: any) => ep.hasCleanSheet)
                          .map((ep: any, idx: number) => {
                            const p = ep.player;
                            const playerId = String(p?._id || p?.id || p);
                            const fullName = p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() : "Player";
                            const pos = ep.position || "DF";

                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center shrink-0">
                                    {pos === "Goalkeeper" ? "GK" : pos === "Defender" ? "DF" : pos.substring(0, 2).toUpperCase()}
                                  </span>
                                  <span className="font-medium text-slate-800">{fullName}</span>
                                  {ep.isManual ? (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-medium">
                                      Manual
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-medium">
                                      Auto
                                    </span>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setRevokingPlayerId(playerId);
                                    setRevokeReason("");
                                  }}
                                  className="text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
                                >
                                  Revoke
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Revoke Inline Prompt */}
              {revokingPlayerId && (
                <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Confirm Revocation</span>
                  </div>
                  <p className="text-xs text-rose-700">
                    This will remove the clean sheet stat and rollback bonus coins for this player.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={revokeReason}
                      onChange={(e) => setRevokeReason(e.target.value)}
                      placeholder="Audit reason (required)..."
                      className="flex-1 bg-white border border-rose-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                    />
                    <div className="flex gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRevokingPlayerId(null);
                          setRevokeReason("");
                        }}
                        className="text-xs font-medium rounded-lg h-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={isRevoking || !revokeReason.trim()}
                        onClick={() => handleConfirmRevoke(revokingPlayerId)}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg h-8"
                      >
                        {isRevoking && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />}
                        Confirm Revoke
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Clean Sheet Award Form */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Manually Award Clean Sheet
                  </h4>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeamTab("teamA");
                        setSelectedPlayerId("");
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        selectedTeamTab === "teamA"
                          ? "bg-white text-slate-900 shadow-xs font-semibold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {homeName}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTeamTab("teamB");
                        setSelectedPlayerId("");
                      }}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        selectedTeamTab === "teamB"
                          ? "bg-white text-slate-900 shadow-xs font-semibold"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {awayName}
                    </button>
                  </div>
                </div>

                <form onSubmit={handleAward} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <Select value={selectedPlayerId} onValueChange={(val) => setSelectedPlayerId(val)}>
                    <SelectTrigger className="w-full bg-white border border-slate-200 rounded-lg h-9 text-xs">
                      <SelectValue placeholder="Select player..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white max-h-48">
                      {eligibleCandidatePlayers.length === 0 ? (
                        <div className="p-2 text-xs text-slate-400">All players already awarded</div>
                      ) : (
                        eligibleCandidatePlayers.map((m: any) => (
                          <SelectItem key={String(m._id || m.id)} value={String(m._id || m.id)}>
                            {m.firstName} {m.lastName} ({m.position || "Squad"})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  <input
                    type="text"
                    value={awardReason}
                    onChange={(e) => setAwardReason(e.target.value)}
                    placeholder="Audit reason note..."
                    className="w-full bg-white border border-slate-200 focus:border-slate-400 rounded-lg px-3 h-9 text-xs text-slate-800 focus:outline-none transition-colors"
                  />

                  <Button
                    type="submit"
                    disabled={isAwarding || !selectedPlayerId || !awardReason.trim()}
                    className="w-full h-9 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {isAwarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    Award Clean Sheet
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Clean Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200/80 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CleanSheetModal;
