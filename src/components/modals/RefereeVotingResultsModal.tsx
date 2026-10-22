/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Trophy,
  Users,
  Award,
  X,
  Calendar,
  CheckCircle2,
  Shield,
  Loader2,
} from "lucide-react";
import { formatImagePath } from "@/utils/formatImagePath";
import { TRefereeVoting } from "@/types/columnTypes";
import { useGetVotingLeaderboardQuery } from "@/features/refereeVoting/refereeVotingApi";
import dayjs from "dayjs";

interface RefereeVotingResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  votingItem: TRefereeVoting | null;
}

export default function RefereeVotingResultsModal({
  isOpen,
  onClose,
  votingItem,
}: RefereeVotingResultsModalProps) {
  const votingId = votingItem?._id || votingItem?.id || "";

  const { data: resultsRes, isLoading } = useGetVotingLeaderboardQuery(votingId, {
    skip: !isOpen || !votingId,
  });

  if (!isOpen || !votingItem) return null;

  const poll = resultsRes?.data || votingItem;
  const nominees = poll?.nominees || [];
  const totalVotes = poll?.totalVotes || 0;
  const isWeek = poll?.votingType === "WEEK";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-950 via-[#800020] to-slate-900 text-white flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm">
                {isWeek ? "Referee of the Week" : "Referee of the Month"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-400/20 text-amber-200 border border-amber-300/30 capitalize">
                {poll.status}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight text-white line-clamp-1">
              {poll.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dayjs(poll.startDate).format("MMM D")} - {dayjs(poll.endDate).format("MMM D, YYYY")}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-amber-300">
                <Users className="w-3.5 h-3.5" />
                {totalVotes} total votes
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-[#800020]" />
              <span className="text-xs">Loading live standings...</span>
            </div>
          ) : (
            <>
              {/* Standings List */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Official Nominees & Results
                </h3>

                {nominees.map((nom: any, idx: number) => {
                  const ref = nom.referee || {};
                  const fullName =
                    `${ref.firstName || ""} ${ref.lastName || ""}`.trim() ||
                    ref.userName ||
                    "Referee";
                  const percentage =
                    nom.votePercentage !== undefined
                      ? nom.votePercentage
                      : totalVotes > 0
                      ? Number(((nom.votesCount / totalVotes) * 100).toFixed(1))
                      : 0;
                  const isTop = idx === 0 && nom.votesCount > 0;
                  const isWinner =
                    poll.status === "completed" &&
                    poll.winner &&
                    String(poll.winner._id || poll.winner) === String(ref._id);

                  return (
                    <div
                      key={nom._id || idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isWinner
                          ? "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/30"
                          : isTop
                          ? "bg-slate-50 border-slate-200"
                          : "bg-white border-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank / Trophy Badge */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isWinner
                                ? "bg-amber-400 text-amber-950 shadow-sm"
                                : isTop
                                ? "bg-[#800020] text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isWinner ? (
                              <Trophy className="w-4 h-4" />
                            ) : (
                              `#${idx + 1}`
                            )}
                          </div>

                          {/* Referee Avatar */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {ref.profile ? (
                              <img
                                src={formatImagePath(ref.profile)}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Shield className="w-5 h-5 text-amber-700" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-slate-900 truncate">
                                {fullName}
                              </span>
                              {isWinner && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow-sm">
                                  <Trophy className="w-3 h-3" /> Winner
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 truncate">
                              <span>{ref.email || ref.userName || "Official"}</span>
                              {nom.statsHighlight && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-800 font-medium">
                                    {nom.statsHighlight}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vote Count & Percent */}
                        <div className="text-right shrink-0">
                          <div className="font-mono font-bold text-sm text-slate-900">
                            {nom.votesCount || 0} votes
                          </div>
                          <span className="text-xs font-semibold text-slate-500">
                            {percentage}%
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isWinner
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : isTop
                              ? "bg-gradient-to-r from-[#800020] to-rose-600"
                              : "bg-slate-400"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
