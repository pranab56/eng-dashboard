/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TTournament } from "@/types/columnTypes";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  Calendar,
  Award,
  X,
  Download,
  Clock,
  ShieldCheck,
  Loader2,
  Coins,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { useGetTournamentQrCodeQuery } from "@/features/tournaments/tournamentsApi";

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
  const [selectedPosIndex, setSelectedPosIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: qrResponse, isLoading: isQrLoading } =
    useGetTournamentQrCodeQuery(tournament?._id || tournament?.id, {
      skip: !isOpen || (!tournament?._id && !tournament?.id),
    });

  if (!tournament) return null;

  const qrData = qrResponse?.data;
  const qrString =
    qrData?.qrPayloadString ||
    JSON.stringify({
      type: "TOURNAMENT_REWARD",
      tournamentId: tournament._id || tournament.id,
      title: tournament.title,
    });

  const startDateFormatted = tournament.startDate
    ? dayjs(tournament.startDate).format("DD MMM, YYYY")
    : "N/A";
  const endDateFormatted = tournament.endDate
    ? dayjs(tournament.endDate).format("DD MMM, YYYY")
    : "N/A";

  const rawStatus = (tournament.status || "upcoming").toLowerCase();
  const isLive = rawStatus === "active" || rawStatus === "ongoing";
  const isDone = rawStatus === "completed" || rawStatus === "finished";

  let statusBadge = {
    label: "Upcoming",
    dot: "bg-blue-500",
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  };
  if (isLive) {
    statusBadge = {
      label: "Ongoing",
      dot: "bg-emerald-500",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  } else if (isDone) {
    statusBadge = {
      label: "Completed",
      dot: "bg-slate-400",
      classes: "bg-slate-100 text-slate-700 border-slate-200",
    };
  }

  const positionQrCodes = qrData?.positionQrCodes || [];
  const currentPosQr =
    positionQrCodes[selectedPosIndex] || positionQrCodes[0] || null;

  const qrImageUrl = currentPosQr?.qrPayloadString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        currentPosQr.qrPayloadString
      )}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrString
      )}`;

  const handleDownloadQr = async () => {
    try {
      setIsDownloading(true);
      const posName = currentPosQr?.positionName || "Reward";
      const cleanTitle = (tournament.title || "Tournament")
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toLowerCase();
      const filename = `${cleanTitle}_${posName.replace(/[^a-zA-Z0-9]/g, "_")}_qr.png`;

      const res = await fetch(qrImageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(`QR Code downloaded for ${posName}`);
    } catch {
      toast.error("Failed to download QR code image");
    } finally {
      setIsDownloading(false);
    }
  };

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

          <div className="flex items-center gap-2 flex-wrap pr-8">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.classes}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} ${
                  isLive ? "animate-pulse" : ""
                }`}
              />
              {statusBadge.label}
            </span>

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {startDateFormatted} &mdash; {endDateFormatted}
              </span>
            </span>

            {tournament.prizeCoins !== undefined && (
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" />
                {tournament.prizeCoins.toLocaleString()} Total Coins
              </span>
            )}
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 mt-2 line-clamp-1">
            {tournament.title}
          </DialogTitle>

          {tournament.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {tournament.description}
            </p>
          )}
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-slate-800">
          {/* Position QR Code Redemption Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Position QR Code Redemption
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                Select position rank to view QR
              </span>
            </div>

            {positionQrCodes.length > 0 ? (
              <div className="space-y-3">
                {/* Horizontal Rank Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {positionQrCodes.map((posQr: any, idx: number) => {
                    const isSelected =
                      idx === selectedPosIndex ||
                      (!positionQrCodes[selectedPosIndex] && idx === 0);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPosIndex(idx)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 border ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isSelected
                              ? "bg-slate-800 text-slate-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          #{posQr.position}
                        </span>
                        <span>{posQr.positionName}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            isSelected ? "text-amber-300" : "text-amber-700"
                          }`}
                        >
                          {posQr.points}c
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected QR Card */}
                <div className="bg-slate-50/60 p-4 sm:p-5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center gap-5">
                  {/* QR Image Box */}
                  <div className="bg-white p-3 rounded-md border border-slate-200 shrink-0 shadow-2xs flex items-center justify-center">
                    {isQrLoading ? (
                      <div className="w-36 h-36 flex flex-col items-center justify-center text-slate-400 text-xs font-medium gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        <span>Generating...</span>
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrImageUrl}
                        alt={`${currentPosQr?.positionName || "Reward"} QR Code`}
                        className="w-36 h-36 object-contain"
                      />
                    )}
                  </div>

                  {/* QR Metadata & Action */}
                  <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {currentPosQr?.positionName || "Winner Reward"}
                      </span>
                      <span className="px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-md text-xs font-bold border border-amber-200 inline-flex items-center gap-1">
                        <Coins className="w-3 h-3 text-amber-500" />
                        {currentPosQr?.points || 0} ENG Coins
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      The player placing in{" "}
                      <strong className="text-slate-900 font-semibold">
                        {currentPosQr?.positionName} (Rank #{currentPosQr?.position})
                      </strong>{" "}
                      can scan this code using their ENG mobile application to
                      claim their coins.
                    </p>

                    <div className="space-y-1 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>One-time redemption per authenticated player</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>
                          Active schedule: {startDateFormatted} &mdash; {endDateFormatted}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      disabled={isDownloading}
                      className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5 text-slate-300" />
                          <span>Download QR Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-md border border-slate-200 text-center text-xs text-slate-500">
                No position rewards configured for this tournament event.
              </div>
            )}
          </div>

          {/* Configured Position Rewards Breakdown */}
          {tournament.positionRewards &&
            tournament.positionRewards.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-slate-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Configured Position Rewards ({tournament.positionRewards.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {tournament.positionRewards.map((reward, idx) => {
                    const is1st = reward.position === 1;
                    const is2nd = reward.position === 2;
                    const is3rd = reward.position === 3;

                    let rankLabel = `Rank #${reward.position}`;
                    let badgeStyle =
                      "bg-slate-50 border-slate-200 text-slate-700";

                    if (is1st) {
                      rankLabel = "1st Place";
                      badgeStyle = "bg-amber-50 border-amber-200 text-amber-900";
                    } else if (is2nd) {
                      rankLabel = "2nd Place";
                      badgeStyle = "bg-slate-100 border-slate-200 text-slate-900";
                    } else if (is3rd) {
                      rankLabel = "3rd Place";
                      badgeStyle =
                        "bg-amber-50/50 border-amber-200/80 text-amber-950";
                    }

                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-md border border-slate-200 bg-white space-y-1.5 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeStyle}`}
                          >
                            {rankLabel}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            #{reward.position}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-semibold text-xs text-slate-900 truncate">
                            {reward.positionName}
                          </h5>
                          <div className="flex items-center gap-1 mt-1 text-xs font-bold text-slate-900">
                            <Coins className="w-3 h-3 text-amber-500" />
                            <span>{reward.points.toLocaleString()} Coins</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Timeline Info Footer */}
          {tournament.createdAt && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Created {dayjs(tournament.createdAt).fromNow()}</span>
              <span>
                {dayjs(tournament.createdAt).format("DD MMM YYYY, hh:mm A")}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
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
