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
  let badgeStyle = "bg-amber-500/20 text-amber-300 border-amber-400/30";
  if (status === "approved") {
    badgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
  } else if (status === "rejected") {
    badgeStyle = "bg-red-500/20 text-red-300 border-red-400/30";
  }

  let rankIcon = "#" + claim.claimedPosition;
  if (claim.claimedPosition === 1) rankIcon = "🥇";
  else if (claim.claimedPosition === 2) rankIcon = "🥈";
  else if (claim.claimedPosition === 3) rankIcon = "🥉";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <div className="relative bg-gradient-to-br from-slate-950 via-gray-900 to-black p-6 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30 backdrop-blur-md border border-white/20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 relative z-10 pt-1">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={user?.userName || "User"}
                width={56}
                height={56}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-white shrink-0">
                <UserIcon className="w-7 h-7 text-white" />
              </div>
            )}

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold . tracking-wider border ${badgeStyle}`}
                >
                  {status}
                </span>
                {user?.role && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold . bg-white/10 text-white border border-white/20">
                    {user.role}
                  </span>
                )}
              </div>
              <DialogTitle className="text-xl font-black text-white leading-tight">
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
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-blue-600 . tracking-widest">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Target Tournament</span>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 leading-snug">
                {tournament?.title || "N/A"}
              </h4>
              {tournament?.description && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {tournament.description}
                </p>
              )}
            </div>

            {tournament?.startDate && tournament?.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {dayjs(tournament.startDate).format("DD MMM YYYY")} &mdash;{" "}
                  {dayjs(tournament.endDate).format("DD MMM YYYY")}
                </span>
              </div>
            )}
          </div>

          {/* Claimed Rank Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{rankIcon}</span>
              <div>
                <h5 className="text-[10px] font-extrabold text-amber-800 . tracking-widest">
                  Claimed Position Rank
                </h5>
                <p className="text-base font-black text-amber-950 mt-0.5">
                  {claim.claimedPositionName || `Rank ${claim.claimedPosition}`}
                </p>
              </div>
            </div>

            <span className="text-xs font-black text-amber-900 bg-amber-200/60 px-3 py-1 rounded-xl">
              Position #{claim.claimedPosition}
            </span>
          </div>

          {/* Proof Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-extrabold text-blue-600 . tracking-widest">
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Proof / Notes Submitted</span>
            </div>
            <p className="text-xs font-medium text-gray-800 leading-relaxed bg-gray-50/80 p-4 rounded-2xl border border-gray-100 italic">
              {claim.proofNotes ? `"${claim.proofNotes}"` : "No proof notes provided."}
            </p>
          </div>

          {/* Submitted Time */}
          <div className="text-xs text-gray-400 font-semibold pt-2 border-t border-gray-100 flex items-center justify-between">
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
                className="px-5 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-extrabold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" />
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
                className="px-5 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-extrabold transition-all shadow-md shadow-emerald-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Claim</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
