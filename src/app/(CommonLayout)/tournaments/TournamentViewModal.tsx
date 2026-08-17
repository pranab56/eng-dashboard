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
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Trophy,
  Calendar,
  Award,
  X,
  Sparkles,
  QrCode,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ShieldCheck,
  Loader2,
  UserCheck,
  Users,
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

  const { data: qrResponse, isLoading: isQrLoading } = useGetTournamentQrCodeQuery(
    tournament?._id || tournament?.id,
    { skip: !isOpen || (!tournament?._id && !tournament?.id) }
  );

  if (!tournament) return null;

  const qrData = qrResponse?.data;
  const qrString = qrData?.qrPayloadString || JSON.stringify({
    type: "TOURNAMENT_REWARD",
    tournamentId: tournament._id || tournament.id,
    title: tournament.title,
  });

  const startDateFormatted = tournament.startDate
    ? dayjs(tournament.startDate).format("DD MMMM, YYYY")
    : "N/A";
  const endDateFormatted = tournament.endDate
    ? dayjs(tournament.endDate).format("DD MMMM, YYYY")
    : "N/A";

  const now = dayjs();
  const isExpired = tournament.endDate ? now.isAfter(dayjs(tournament.endDate)) : false;
  const isUpcoming = tournament.startDate ? now.isBefore(dayjs(tournament.startDate)) : false;
  const isActiveDate = !isExpired && !isUpcoming;

  const status = (tournament.status || "upcoming").toLowerCase();
  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "ongoing" || status === "active") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (status === "completed" || status === "finished") {
    badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
  }

  const positionQrCodes = qrData?.positionQrCodes || [];
  const currentPosQr = positionQrCodes[selectedPosIndex] || positionQrCodes[0] || null;

  const qrImageUrl = currentPosQr?.qrPayloadString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentPosQr.qrPayloadString)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrString)}`;

  const handleDownloadQr = async () => {
    try {
      setIsDownloading(true);
      const posName = currentPosQr?.positionName || "Reward";
      const cleanTitle = (tournament.title || "Tournament").replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanPos = posName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const fileName = `${cleanTitle}_${cleanPos}_QR.png`;

      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
      toast.success(`${posName} QR Code downloaded successfully!`);
    } catch {
      window.open(qrImageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-4xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* 🧼 CLEAN LIGHT HEADER BANNER (Matching UserVerificationModal) */}
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
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                {tournament.title}
              </DialogTitle>

              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 font-medium">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${badgeStyle}`}>
                  {status}
                </span>

                {isActiveDate ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Scan Window
                  </span>
                ) : isExpired ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <AlertCircle className="w-3 h-3 text-rose-600" /> Event Expired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" /> Upcoming Event
                  </span>
                )}

                {tournament.startDate && (
                  <>
                    <span>•</span>
                    <span>Starts {dayjs(tournament.startDate).format("MMM DD, YYYY")}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 📜 MODAL BODY CONTAINER */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh] hide-scrollbar text-slate-800">

          {/* Top Row: Description & Window Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overview Box */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Tournament Description
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                {tournament.description || "No specific description configured for this tournament event."}
              </p>
            </div>

            {/* Schedule Window Box */}
            <div className="bg-blue-50/40 border border-blue-100 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> Tournament Schedule
                </h4>
                {tournament.startDate && (
                  <span className="text-[11px] font-semibold text-blue-600">
                    {dayjs(tournament.startDate).fromNow()}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-600 font-medium">
                  <strong className="text-slate-900">Start Date:</strong> {startDateFormatted}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  <strong className="text-slate-900">End Date:</strong> {endDateFormatted}
                </div>
              </div>
            </div>
          </div>

          {/* 📱 POSITION PRIZE MONEY QR CODE CENTER (Light Theme Matching Modal) */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Position Prize QR Codes (Scan to Claim Coins)
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                Select position rank to view QR
              </span>
            </div>

            {/* Position Selector Tabs */}
            {positionQrCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {positionQrCodes.map((posQr: any, idx: number) => {
                    const isSelected = selectedPosIndex === idx;
                    let rankBadge = "🥇";
                    if (posQr.position === 2) rankBadge = "🥈";
                    else if (posQr.position === 3) rankBadge = "🥉";
                    else if (posQr.position > 3) rankBadge = "🏅";

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPosIndex(idx)}
                        className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shrink-0 border ${
                          isSelected
                            ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20 font-bold scale-105"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span className="text-sm">{rankBadge}</span>
                        <span>{posQr.positionName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            isSelected ? "bg-slate-950 text-amber-300" : "bg-slate-100 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {posQr.points} Coins
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected QR Details & Image (Clean Light Box) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Image Frame */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0 shadow-inner flex items-center justify-center">
                    {isQrLoading ? (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-400 text-xs font-medium">
                        Generating QR...
                      </div>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrImageUrl}
                        alt={`${currentPosQr?.positionName || "Reward"} QR Code`}
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                    )}
                  </div>

                  {/* QR Info & Actions */}
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <span className="text-lg font-bold text-slate-900">
                        {currentPosQr?.positionName || "Winner Reward"}
                      </span>
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-extrabold border border-amber-200 flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {currentPosQr?.points || 0} ENG Coins
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      The player winning <strong className="text-slate-900">{currentPosQr?.positionName}</strong> (Position #{currentPosQr?.position}) can scan this QR code using their mobile app to claim <strong className="text-amber-600">{currentPosQr?.points} ENG Coins</strong> directly!
                    </p>

                    <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Redeemable once per player profile</span>
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Active only during tournament start & end dates</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      disabled={isDownloading}
                      className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Download {currentPosQr?.positionName} QR Code Image</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No position rewards configured for this tournament.
              </div>
            )}
          </div>

          {/* Configured Position Rewards Grid */}
          {tournament.positionRewards && tournament.positionRewards.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Configured Position Rewards
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tournament.positionRewards.map((reward, idx) => {
                  let rewardBg = "bg-slate-50/80 border-slate-200/80 text-slate-800";
                  let badgeIcon = "#" + reward.position;
                  if (reward.position === 1) {
                    rewardBg = "bg-amber-50/80 border-amber-200 text-amber-950";
                    badgeIcon = "🥇";
                  } else if (reward.position === 2) {
                    rewardBg = "bg-slate-100/80 border-slate-200 text-slate-900";
                    badgeIcon = "🥈";
                  } else if (reward.position === 3) {
                    rewardBg = "bg-orange-50/80 border-orange-200 text-orange-950";
                    badgeIcon = "🥉";
                  }

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 transition-all shadow-sm ${rewardBg}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{badgeIcon}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Pos #{reward.position}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-bold text-xs leading-tight text-slate-900">
                          {reward.positionName}
                        </h5>
                        <div className="flex items-center gap-1 mt-1 text-xs font-black text-amber-600">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>{reward.points} ENG Coins</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer Timeline */}
          {tournament.createdAt && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Created {dayjs(tournament.createdAt).fromNow()}</span>
              <span>{dayjs(tournament.createdAt).format("DD MMM YYYY, hh:mm A")}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
