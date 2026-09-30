/* eslint-disable @typescript-eslint/no-explicit-any */
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
  UserCheck,
  Award,
  Coins,
  Calendar,
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
        className="sm:max-w-2xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Enterprise Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 text-left relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900">
                  Redeemed Prize Winners
                </DialogTitle>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                  {redeemedPlayers.length} Claimed
                </span>
              </div>

              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                Tournament:{" "}
                <span className="font-semibold text-slate-700">
                  {tournament.title}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Winners List */}
        <div className="p-4 sm:p-6 space-y-3 overflow-y-auto flex-1 custom-scrollbar text-slate-800">
          {isLoading ? (
            <div className="p-10 text-center text-xs font-medium text-slate-400">
              Loading redeemed winners data...
            </div>
          ) : redeemedPlayers.length > 0 ? (
            <div className="space-y-2.5">
              {redeemedPlayers.map((rp: any, idx: number) => {
                const playerObj = rp.player;
                const isPopulated =
                  typeof playerObj === "object" && playerObj !== null;
                const playerName = isPopulated
                  ? playerObj.fullName ||
                    [playerObj.firstName, playerObj.lastName]
                      .filter(Boolean)
                      .join(" ")
                      .trim() ||
                    playerObj.userName ||
                    "Player"
                  : "Player";

                const getValidEmail = (val?: string | null) =>
                  val && typeof val === "string" && val.includes("@")
                    ? val
                    : "";

                const parentObj =
                  typeof playerObj?.parentId === "object"
                    ? playerObj.parentId
                    : null;

                const playerEmail = isPopulated
                  ? getValidEmail(playerObj.email) ||
                    getValidEmail(playerObj.emergencyEmail) ||
                    getValidEmail(parentObj?.email) ||
                    getValidEmail(parentObj?.emergencyEmail)
                  : "";

                const playerPic =
                  isPopulated && playerObj.profile
                    ? formatImagePath(playerObj.profile)
                    : null;
                const initials = playerName.substring(0, 2).toUpperCase();

                const is1st = rp.position === 1;
                const is2nd = rp.position === 2;
                const is3rd = rp.position === 3;

                let rankBadge = (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    Rank #{rp.position || 1}
                  </span>
                );

                if (is1st) {
                  rankBadge = (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-300">
                      1st Place
                    </span>
                  );
                } else if (is2nd) {
                  rankBadge = (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-900 border border-slate-300">
                      2nd Place
                    </span>
                  );
                } else if (is3rd) {
                  rankBadge = (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50/60 text-amber-950 border border-amber-200">
                      3rd Place
                    </span>
                  );
                }

                return (
                  <div
                    key={idx}
                    className="p-3 bg-white hover:bg-slate-50/60 border border-slate-200 rounded-md flex items-center justify-between transition-colors gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar */}
                      <div className="relative w-9 h-9 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">
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

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                            {playerName}
                          </h5>
                          {rankBadge}
                          {rp.positionName && (
                            <span className="text-[11px] font-medium text-slate-500 truncate hidden sm:inline">
                              · {rp.positionName}
                            </span>
                          )}
                        </div>

                        {playerEmail && (
                          <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                            {playerEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Redeemed Coins & Timestamp */}
                    <div className="text-right shrink-0 space-y-0.5">
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Coins className="w-3 h-3 text-emerald-600" />
                        <span>+{rp.coins} Coins</span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>
                          {rp.redeemedAt
                            ? dayjs(rp.redeemedAt).format("DD MMM, YYYY · hh:mm A")
                            : "Claimed"}
                        </span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 px-4 bg-slate-50/50 border border-slate-200 rounded-md text-center space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <h5 className="font-bold text-xs sm:text-sm text-slate-800">
                No Winners Have Claimed Rewards Yet
              </h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No players have scanned the position QR codes for this
                tournament yet. As soon as a player redeems their placement QR code,
                their record will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
