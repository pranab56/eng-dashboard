/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X, Award, Clock, User, CheckCircle2, Trophy } from "lucide-react";
import { useGetQuizLeaderboardQuery } from "@/features/quiz/quizApi";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

interface QuizLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizItem: any;
}

export default function QuizLeaderboardModal({
  isOpen,
  onClose,
  quizItem,
}: QuizLeaderboardModalProps) {
  const quizId = quizItem?._id || "";
  const { data: leaderboardRes, isLoading } = useGetQuizLeaderboardQuery(
    { id: quizId, limit: 50 },
    { skip: !isOpen || !quizId }
  );

  if (!isOpen || !quizItem) return null;

  const participants = Array.isArray(leaderboardRes?.data) ? leaderboardRes.data : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-semibold text-slate-900">
                Quiz Leaderboard & Participants
              </span>
            </div>
            <span className="text-xs text-slate-500 block mt-0.5">
              {quizItem.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-center shrink-0">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Total Participants</span>
            <span className="text-xs font-semibold text-slate-900 font-mono">
              {quizItem.totalAttempts || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Total Winners</span>
            <span className="text-xs font-semibold text-emerald-700 font-mono">
              {quizItem.totalPassed || 0}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Reward per Win</span>
            <span className="text-xs font-semibold text-amber-700 font-mono">
              {quizItem.rewardPoints || 0} Points
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 animate-pulse">
              Loading participant records...
            </div>
          ) : participants.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No participants have completed this quiz yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
              {participants.map((att: any, idx: number) => {
                const user = att.user || {};
                const name =
                  `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                  user.userName ||
                  "Participant";
                const profileImg = formatImagePath(user.profile);
                const isTop3 = idx < 3;

                return (
                  <div
                    key={att._id || idx}
                    className="flex items-center justify-between p-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                          idx === 0
                            ? "bg-amber-100 text-amber-800"
                            : idx === 1
                            ? "bg-slate-200 text-slate-700"
                            : idx === 2
                            ? "bg-amber-50 text-amber-900 border border-amber-200"
                            : "text-slate-400"
                        }`}
                      >
                        #{idx + 1}
                      </span>

                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                        {profileImg ? (
                          <img
                            src={profileImg}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          name.slice(0, 2).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="font-medium text-xs text-slate-900 truncate block">
                          {name}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {att.timeTakenSeconds || 0}s
                          </span>
                          <span>?</span>
                          <span>
                            {dayjs(att.completedAt).format("DD MMM, HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right shrink-0">
                      <div>
                        <span className="text-xs font-semibold text-slate-900 block font-mono">
                          {att.percentage}%
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {att.score}/{att.totalPossiblePoints} pts
                        </span>
                      </div>

                      {att.rewardEarned > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono">
                          <Award className="w-3 h-3 text-amber-600" />
                          +{att.rewardEarned}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-slate-200 bg-slate-50/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
