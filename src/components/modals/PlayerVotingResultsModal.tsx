/* eslint-disable @next/next/no-img-element */
"use client";

import { TPlayerVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Award, CheckCircle } from "lucide-react";
import React from "react";
import dayjs from "dayjs";

interface PlayerVotingResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  voting: TPlayerVoting | null;
}

export default function PlayerVotingResultsModal({
  isOpen,
  onClose,
  voting,
}: PlayerVotingResultsModalProps) {
  if (!isOpen || !voting) return null;

  const totalVotes = voting.totalVotes || 0;
  const isWeek = voting.votingType === "WEEK";

  // Sort nominees descending by votesCount
  const sortedNominees = [...(voting.nominees || [])].sort(
    (a, b) => (b.votesCount || 0) - (a.votesCount || 0)
  );

  const winnerId =
    voting.winner && typeof voting.winner === "object"
      ? voting.winner._id
      : voting.winner || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                  isWeek
                    ? "bg-slate-100 text-slate-700 border border-slate-200"
                    : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                {isWeek ? "Player of the Week" : "Player of the Month"}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {voting.league?.leagueName || "League"} • {voting.ageGroup}
              </span>
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mt-0.5">
              {voting.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Flat 3-Part Metric Strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-200 border border-slate-200 rounded-md bg-slate-50/40 text-xs">
            <div className="p-3">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Total Ballots
              </span>
              <span className="font-semibold text-slate-900 text-base tabular-nums">
                {totalVotes.toLocaleString()}
              </span>
            </div>

            <div className="p-3 pl-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Voting Period
              </span>
              <span className="font-medium text-slate-700 text-xs font-mono">
                {voting.startDate ? dayjs(voting.startDate).format("MMM D") : "—"} -{" "}
                {voting.endDate ? dayjs(voting.endDate).format("MMM D, YYYY") : "—"}
              </span>
            </div>

            <div className="p-3 pl-4">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
                Poll Status
              </span>
              <span className="font-medium text-slate-800 text-xs uppercase tracking-wide">
                {voting.status}
              </span>
            </div>
          </div>

          {/* Winner Strip if declared */}
          {voting.winner && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-md p-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                  <Award className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 block">
                    Certified Round Winner
                  </span>
                  <div className="text-xs font-bold text-slate-900">
                    {typeof voting.winner === "object"
                      ? `${voting.winner.firstName || ""} ${voting.winner.lastName || ""}`.trim()
                      : "Official Winner"}
                  </div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-white/90 px-2 py-0.5 rounded border border-amber-200">
                <CheckCircle className="w-3 h-3 text-amber-600" />
                Verified
              </span>
            </div>
          )}

          {/* Leaderboard Standings */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-0.5 pb-1 border-b border-slate-100">
              <span className="font-medium text-slate-700">
                Nominees & Vote Distribution
              </span>
              <span>{sortedNominees.length} Nominees</span>
            </div>

            {sortedNominees.map((nominee, idx) => {
              const count = nominee.votesCount || 0;
              const percentage =
                totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isWinner = winnerId && winnerId === nominee.player?._id;
              const isLead = idx === 0 && count > 0 && !winnerId;
              const profileImg = formatImagePath(nominee.player?.profile);
              const playerName = nominee.player
                ? `${nominee.player.firstName || ""} ${nominee.player.lastName || ""}`.trim() || "Player"
                : "Player";

              return (
                <div
                  key={nominee.player?._id || idx}
                  className={`border rounded-md p-3 transition-colors ${
                    isWinner
                      ? "border-amber-300 bg-amber-50/20"
                      : isLead
                      ? "border-slate-300 bg-slate-50/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-4 text-center font-mono text-xs text-slate-400 font-medium">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      <div className="w-8 h-8 rounded border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center font-semibold text-xs text-slate-600">
                        {profileImg ? (
                          <img
                            src={profileImg}
                            alt={playerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          playerName.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-900">
                            {playerName}
                          </span>
                          {isWinner && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1 py-0.2 rounded">
                              WINNER
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {nominee.team?.teamName || "Club"}
                          {nominee.player?.position && (
                            <span className="ml-1 text-slate-400">
                              • {nominee.player.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-semibold text-slate-900 tabular-nums">
                        {count.toLocaleString()}{" "}
                        <span className="text-[10px] font-normal text-slate-500">
                          votes
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-600">
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  {/* High-fidelity Thin Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isWinner
                          ? "bg-amber-600"
                          : isLead
                          ? "bg-slate-900"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Highlights */}
                  {nominee.statsHighlight && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      <span className="text-slate-400 mr-1 font-medium">Stats:</span>
                      {nominee.statsHighlight}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/70 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
