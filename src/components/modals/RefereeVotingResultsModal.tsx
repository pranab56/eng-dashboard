/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Trophy, X, Loader2, User } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-700">
                {isWeek ? "Referee of the Week" : "Referee of the Month"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                {poll.status}
              </span>
            </div>
            <h2 className="text-sm font-semibold text-slate-900 line-clamp-1">
              {poll.title}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>
                {dayjs(poll.startDate).format("DD MMM")} – {dayjs(poll.endDate).format("DD MMM YYYY")}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-800">
                {Number(totalVotes).toLocaleString()} votes cast
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
              <span className="text-xs">Loading standings...</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Official Nominees & Results
              </div>

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
                const isWinner =
                  poll.status === "completed" &&
                  poll.winner &&
                  String(poll.winner._id || poll.winner) === String(ref._id);

                return (
                  <div
                    key={nom._id || idx}
                    className={`p-3 rounded border transition-colors ${
                      isWinner
                        ? "bg-amber-50/60 border-amber-300"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 text-center text-xs font-mono font-semibold text-slate-500 shrink-0">
                          #{idx + 1}
                        </span>

                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {ref.profile ? (
                            <img
                              src={formatImagePath(ref.profile)}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-4 h-4 text-slate-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-slate-900 truncate">
                              {fullName}
                            </span>
                            {isWinner && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                                <Trophy className="w-3 h-3 text-amber-600" /> Winner
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                            <span>{ref.email || ref.userName || "Official"}</span>
                            {nom.statsHighlight && (
                              <>
                                <span>•</span>
                                <span className="text-slate-700">
                                  {nom.statsHighlight}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-semibold text-xs text-slate-900">
                          {Number(nom.votesCount || 0).toLocaleString()} votes
                        </div>
                        <span className="text-[11px] font-mono text-slate-500">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all duration-300 ${
                          isWinner ? "bg-amber-500" : "bg-slate-800"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
