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
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  X,
  Sparkles,
  UserCheck,
  Award,
} from "lucide-react";
import { useGetTournamentQrCodeQuery } from "@/features/tournaments/tournamentsApi";

dayjs.extend(relativeTime);

interface TournamentRedeemedWinnersModalProps {
  tournament: TTournament | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TournamentRedeemedWinnersModal({
  tournament,
  isOpen,
  onClose,
}: TournamentRedeemedWinnersModalProps) {
  const { data: qrResponse, isLoading } = useGetTournamentQrCodeQuery(
    tournament?._id || tournament?.id,
    { skip: !isOpen || (!tournament?._id && !tournament?.id) }
  );

  if (!tournament) return null;

  const qrData = qrResponse?.data;
  const redeemedPlayers = qrData?.redeemedPlayers || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* 🧼 CLEAN LIGHT HEADER BANNER */}
        <DialogHeader className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <UserCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                Redeemed Winners & Claim List
              </DialogTitle>

              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-slate-700">{tournament.title}</span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200">
                  Total Winners: {redeemedPlayers.length} Players
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 📜 WINNERS LIST BODY */}
        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[72vh] hide-scrollbar text-slate-800">
          {isLoading ? (
            <div className="p-12 text-center text-xs font-semibold text-slate-400">
              Loading redeemed winners list...
            </div>
          ) : redeemedPlayers.length > 0 ? (
            <div className="space-y-3">
              {redeemedPlayers.map((rp: any, idx: number) => {
                const playerObj = rp.player;
                const isPopulated = typeof playerObj === "object" && playerObj !== null;
                const playerName = isPopulated
                  ? (
                      playerObj.fullName ||
                      [playerObj.firstName, playerObj.lastName].filter(Boolean).join(" ").trim() ||
                      playerObj.userName ||
                      "Player"
                    )
                  : "Player";
                const getValidEmail = (val?: string | null) =>
                  val && typeof val === "string" && val.includes("@") ? val : "";

                const parentObj = typeof playerObj?.parentId === "object" ? playerObj.parentId : null;
                const playerEmail = isPopulated
                  ? (
                      getValidEmail(playerObj.email) ||
                      getValidEmail(playerObj.emergencyEmail) ||
                      getValidEmail(parentObj?.email) ||
                      getValidEmail(parentObj?.emergencyEmail)
                    )
                  : "";
                const playerPic = isPopulated && playerObj.profile ? formatImagePath(playerObj.profile) : null;
                const initials = playerName.substring(0, 2).toUpperCase();

                let rankEmoji = "🏅";
                if (rp.position === 1) rankEmoji = "🥇";
                else if (rp.position === 2) rankEmoji = "🥈";
                else if (rp.position === 3) rankEmoji = "🥉";

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-all gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm text-xs font-bold text-slate-700">
                        {playerPic ? (
                          <Image
                            src={playerPic}
                            alt={playerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate flex items-center gap-1.5">
                          <span>{playerName}</span>
                          <span className="text-sm">{rankEmoji}</span>
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({rp.positionName || `Pos #${rp.position || 1}`})
                          </span>
                        </h5>
                        {playerEmail && (
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {playerEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="flex items-center justify-end gap-1 text-xs sm:text-sm font-black text-amber-600">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>+{rp.coins} ENG Coins</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {rp.redeemedAt ? dayjs(rp.redeemedAt).format("MMM DD, YYYY • hh:mm A") : "Redeemed"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 bg-slate-50/60 border border-slate-200/80 rounded-3xl text-center space-y-2">
              <Award className="w-10 h-10 text-slate-400 mx-auto opacity-60" />
              <h5 className="font-bold text-sm text-slate-700">No Winners Redeemed Yet</h5>
              <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                No players have scanned or redeemed QR rewards for this tournament yet. When players scan their position QR code, their names will appear here.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
