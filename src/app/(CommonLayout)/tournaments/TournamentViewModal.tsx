"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TTournament } from "@/types/columnTypes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Trophy, Calendar, Award, X, Sparkles } from "lucide-react";

dayjs.extend(relativeTime);

interface TournamentViewModalProps {
  tournament: TTournament | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TournamentViewModal({
  tournament,
  isOpen,
  onClose,
}: TournamentViewModalProps) {
  if (!tournament) return null;

  const startDateFormatted = tournament.startDate
    ? dayjs(tournament.startDate).format("DD MMMM, YYYY")
    : "N/A";
  const endDateFormatted = tournament.endDate
    ? dayjs(tournament.endDate).format("DD MMMM, YYYY")
    : "N/A";

  const status = (tournament.status || "upcoming").toLowerCase();
  let badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-400/30";
  if (status === "ongoing" || status === "active") {
    badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
  } else if (status === "completed" || status === "finished") {
    badgeStyle = "bg-purple-500/20 text-purple-300 border-purple-400/30";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="relative bg-gradient-to-br from-slate-950 via-gray-900 to-black p-8 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 relative z-10 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg backdrop-blur-md">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold . tracking-wider border ${badgeStyle}`}
                >
                  {status}
                </span>
              </div>
              <DialogTitle className="text-2xl font-black text-white leading-tight tracking-tight">
                {tournament.title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Content Details */}
        <div className="p-6 space-y-5">
          {/* Description */}
          {tournament.description && (
            <div className="space-y-1">
              <h4 className="text-[10px] font-extrabold text-blue-600 . tracking-widest">
                Overview & Description
              </h4>
              <p className="text-xs font-medium text-gray-700 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Schedule Card */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-medium shrink-0 border border-blue-100">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[10px] font-extrabold text-blue-600 . tracking-widest">
                  Tournament Duration
                </h4>
                <p className="text-xs font-medium text-gray-900 mt-0.5">
                  {startDateFormatted} &mdash; {endDateFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Position Rewards Section */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <h4 className="text-[10px] font-extrabold text-gray-400 . tracking-widest">
                Position Rewards
              </h4>
            </div>

            {tournament.positionRewards && tournament.positionRewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tournament.positionRewards.map((reward, idx) => {
                  let rewardBg = "bg-gray-50/80 border-gray-100 text-gray-800";
                  let badgeIcon = "#" + reward.position;
                  if (reward.position === 1) {
                    rewardBg = "bg-amber-50/80 border-amber-200 text-amber-950";
                    badgeIcon = "🥇";
                  } else if (reward.position === 2) {
                    rewardBg = "bg-slate-50 border-slate-200 text-slate-900";
                    badgeIcon = "🥈";
                  } else if (reward.position === 3) {
                    rewardBg = "bg-orange-50/80 border-orange-200 text-orange-950";
                    badgeIcon = "🥉";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 transition-all hover:shadow-sm ${rewardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{badgeIcon}</span>
                        <span className="text-[9px] font-black . tracking-wider text-gray-400">
                          Pos {reward.position}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-medium text-xs leading-tight">
                          {reward.positionName}
                        </h5>
                        <div className="flex items-center gap-1 mt-1 text-xs font-black text-blue-600">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          <span>{reward.points} Points</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No rewards configured.</p>
            )}
          </div>

          {/* Footer Timeline */}
          {tournament.createdAt && (
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-semibold">
              <span>Created {dayjs(tournament.createdAt).fromNow()}</span>
              <span>{dayjs(tournament.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
