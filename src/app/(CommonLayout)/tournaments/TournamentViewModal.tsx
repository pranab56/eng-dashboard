"use client";

import {
  Dialog,
  DialogContent,
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
  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "ongoing" || status === "active") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "completed" || status === "finished") {
    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-black p-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                >
                  {status}
                </span>
              </div>
              <DialogTitle className="text-2xl font-black text-white leading-tight tracking-tight">
                {tournament.title}
              </DialogTitle>
            </div>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-8 space-y-6">
          {/* Description */}
          {tournament.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Description
              </h4>
              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {tournament.description}
              </p>
            </div>
          )}

          {/* Schedule Card */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tournament Schedule
                </h4>
                <p className="text-sm font-bold text-gray-900 mt-0.5">
                  {startDateFormatted} &mdash; {endDateFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Position Rewards Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Position Rewards
              </h4>
            </div>

            {tournament.positionRewards && tournament.positionRewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tournament.positionRewards.map((reward, idx) => {
                  let rewardBg = "bg-gray-50 border-gray-100 text-gray-800";
                  let badgeIcon = "#" + reward.position;
                  if (reward.position === 1) {
                    rewardBg = "bg-amber-50/70 border-amber-200 text-amber-900";
                    badgeIcon = "🥇";
                  } else if (reward.position === 2) {
                    rewardBg = "bg-slate-50 border-slate-200 text-slate-900";
                    badgeIcon = "🥈";
                  } else if (reward.position === 3) {
                    rewardBg = "bg-orange-50/70 border-orange-200 text-orange-900";
                    badgeIcon = "🥉";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${rewardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{badgeIcon}</span>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                          Pos {reward.position}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-bold text-sm leading-tight">
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
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
              <span>Created {dayjs(tournament.createdAt).fromNow()}</span>
              <span>{dayjs(tournament.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
