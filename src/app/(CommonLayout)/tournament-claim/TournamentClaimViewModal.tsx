"use client";

import React from "react";
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
import {
  Trophy,
  Calendar,
  FileText,
  X,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

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
  const initials = (user?.userName || "U").substring(0, 2).toUpperCase();

  const status = (claim.status || "pending").toLowerCase();
  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  let statusIcon = <Clock className="w-3.5 h-3.5 text-amber-600" />;

  if (status === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
    statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  } else if (status === "rejected") {
    badgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
    statusIcon = <XCircle className="w-3.5 h-3.5 text-rose-600" />;
  }

  const pos = claim.claimedPosition;
  let posBadgeTheme = "bg-slate-100 text-slate-700 border-slate-200";
  if (pos === 1) {
    posBadgeTheme = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
  } else if (pos === 2) {
    posBadgeTheme = "bg-slate-100 text-slate-800 border-slate-300 font-semibold";
  } else if (pos === 3) {
    posBadgeTheme = "bg-orange-50 text-orange-800 border-orange-200 font-semibold";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg bg-white rounded-xl p-0 overflow-hidden border border-slate-200 shadow-xl"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-bold text-slate-900 leading-tight">
                Tournament Claim Review
              </DialogTitle>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badgeStyle}`}
              >
                {statusIcon}
                <span className="capitalize">{status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Verify participant ranking submission and tournament placement.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Participant Info */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={user?.userName || "User"}
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0">
                {initials}
              </div>
            )}

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm leading-tight truncate">
                  {user?.userName || "Anonymous Participant"}
                </span>
                {user?.role && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 border border-slate-300">
                    {user.role}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500 font-normal truncate mt-0.5">
                {user?.email || "No email available"}
              </span>
            </div>
          </div>

          {/* Tournament Overview */}
          <div className="border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Trophy className="w-3.5 h-3.5 text-slate-400" />
              <span>Target Tournament</span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                {tournament?.title || "Tournament Title Not Provided"}
              </h4>
              {tournament?.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {tournament.description}
                </p>
              )}
            </div>

            {tournament?.startDate && tournament?.endDate && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {dayjs(tournament.startDate).format("DD MMM YYYY")} &ndash;{" "}
                  {dayjs(tournament.endDate).format("DD MMM YYYY")}
                </span>
              </div>
            )}
          </div>

          {/* Claimed Placement Spec */}
          <div className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between bg-slate-50/50">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                Claimed Placement
              </span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                {claim.claimedPositionName || `Rank ${pos}`}
              </span>
            </div>

            <span
              className={`px-3 py-1 rounded-md text-xs font-mono border ${posBadgeTheme}`}
            >
              Position #{pos || "—"}
            </span>
          </div>

          {/* Submitted Verification Notes */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Participant Notes & Verification Proof</span>
            </div>
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed font-normal">
              {claim.proofNotes ? (
                claim.proofNotes
              ) : (
                <span className="text-slate-400 italic">
                  No additional verification notes or links were submitted with this claim.
                </span>
              )}
            </div>
          </div>

          {/* Submission Timestamp */}
          <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Submitted {dayjs(claim.createdAt).fromNow()}</span>
            <span>{dayjs(claim.createdAt).format("DD MMM YYYY, HH:mm")}</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {status !== "rejected" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  onStatusUpdate(claim._id || claim.id || "", "rejected");
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-medium text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
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
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
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
