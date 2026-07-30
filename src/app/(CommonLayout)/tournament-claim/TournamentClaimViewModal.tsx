"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TTournamentClaim } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { Trophy, Calendar, FileText, User as UserIcon, X, Check } from "lucide-react";

dayjs.extend(relativeTime);

interface TournamentClaimViewModalProps {
  claim: TTournamentClaim | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (id: string, status: "approved" | "rejected") => void;
  isLoading: boolean;
}

export default function TournamentClaimViewModal({
  claim,
  isOpen,
  onClose,
  onStatusUpdate,
  isLoading,
}: TournamentClaimViewModalProps) {
  if (!claim) return null;

  const user = claim.user;
  const tournament = claim.tournament;
  const profilePic = user?.profile ? formatImagePath(user.profile) : null;

  const status = (claim.status || "pending").toLowerCase();
  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "rejected") {
    badgeStyle = "bg-red-50 text-red-700 border-red-200";
  }

  let rankIcon = "#" + claim.claimedPosition;
  if (claim.claimedPosition === 1) rankIcon = "🥇";
  else if (claim.claimedPosition === 2) rankIcon = "🥈";
  else if (claim.claimedPosition === 3) rankIcon = "🥉";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-slate-900 via-gray-900 to-black p-6 text-white">
          <div className="flex items-center gap-4">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={user?.userName || "User"}
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white shrink-0">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                >
                  {status}
                </span>
                {user?.role && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/10 text-white border border-white/20">
                    {user.role}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-bold text-white leading-tight">
                {user?.userName || "User Claim"}
              </DialogTitle>
              <p className="text-xs text-gray-400 font-medium">
                {user?.email || "No email provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Tournament Info Box */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Target Tournament</span>
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-900 leading-snug">
                {tournament?.title || "N/A"}
              </h4>
              {tournament?.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {tournament.description}
                </p>
              )}
            </div>

            {tournament?.startDate && tournament?.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {dayjs(tournament.startDate).format("DD MMM YYYY")} &mdash;{" "}
                  {dayjs(tournament.endDate).format("DD MMM YYYY")}
                </span>
              </div>
            )}
          </div>

          {/* Claimed Rank Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rankIcon}</span>
              <div>
                <h5 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Claimed Position Rank
                </h5>
                <p className="text-base font-black text-amber-950 mt-0.5">
                  {claim.claimedPositionName || `Rank ${claim.claimedPosition}`}
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-amber-900 bg-amber-200/60 px-3 py-1 rounded-lg">
              Position #{claim.claimedPosition}
            </span>
          </div>

          {/* Proof Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <FileText className="w-4 h-4 text-blue-500" />
              <span>Proof / Notes Submitted</span>
            </div>
            <p className="text-sm font-medium text-gray-800 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
              {claim.proofNotes ? `"${claim.proofNotes}"` : "No proof notes provided."}
            </p>
          </div>

          {/* Submitted Time */}
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Submitted {dayjs(claim.createdAt).fromNow()}</span>
            <span>{dayjs(claim.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            {status !== "rejected" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  onStatusUpdate(claim._id || claim.id || "", "rejected");
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-sm font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Reject Claim</span>
              </button>
            )}

            {status !== "approved" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  onStatusUpdate(claim._id || claim.id || "", "approved");
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Approve Claim</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
