/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

import Image from "next/image";
import { formatImagePath } from "../../../utils/formatImagePath";
import { useUpdateMatchMutation } from "@/features/match/matchApi";
import { toast } from "sonner";
import {
  X,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Clock,
  FileText,
  UserX,
  Loader2,
  Award,
  Users,
  Grid,
  TrendingUp,
} from "lucide-react";

interface MatchViewModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

const MatchViewModal = ({ match, isOpen, onClose }: MatchViewModalProps) => {
  const [updateMatch, { isLoading: isUnassigning }] = useUpdateMatchMutation();

  if (!match) return null;

  const matchStatus = (match.status || "SCHEDULED").toUpperCase();
  const matchType = (match.matchType || "league").toLowerCase();

  // Status Badge Styles matching UserVerificationModal pattern
  let statusBadgeStyle = "bg-amber-55 text-amber-700 border-amber-200";
  if (matchStatus === "COMPLETED" || matchStatus === "FINISHED") {
    statusBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (matchStatus === "ON GOING" || matchStatus === "LIVE") {
    statusBadgeStyle = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
  } else if (matchStatus === "CANCELLED") {
    statusBadgeStyle = "bg-slate-50 text-slate-700 border-slate-200";
  }

  // Formatted Referee full display name
  const refereeName = match.referee
    ? match.referee.displayName ||
      match.referee.name ||
      match.referee.userName ||
      (match.referee.firstName
        ? `${match.referee.firstName} ${match.referee.lastName || ""}`.trim()
        : "") ||
      match.referee.email ||
      "Assigned Referee"
    : null;

  const handleUnassignReferee = async () => {
    try {
      const res = await updateMatch({
        id: match._id || match.id,
        data: { referee: null },
      }).unwrap();
      if (res.success) {
        toast.success("Referee unassigned successfully");
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to unassign referee");
    }
  };

  // Icon representing the match type
  const typeIcon = matchType === "league" ? "🏆" : matchType === "cup" ? "🏅" : "⚽";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Clean Light Header Banner matching UserVerificationModal */}
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
            <div className="relative w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm text-3xl font-bold">
              {typeIcon}
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-slate-905 flex items-center gap-2">
                Match Details & Overview
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${statusBadgeStyle}`}>
                  {match.status}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                  {matchType} match
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container with custom scrollbar */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[68vh] hide-scrollbar text-slate-800">
          {/* Main Scoreboard */}
          <div className="flex items-center justify-between gap-4 bg-slate-50/60 p-6 rounded-3xl border border-slate-100 shadow-xs">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center min-w-0">
              <div className="relative w-20 h-20 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center justify-center mb-3 group transition-transform hover:scale-105 duration-300">
                {match.homeTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.homeTeam.teamLogo)}
                    alt="home"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-gray-300 text-[10px] font-medium text-center">No Logo</div>
                )}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-2 w-full">
                {match.homeTeam?.teamName || "Home Team"}
              </h3>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest mt-1">Home</span>
            </div>

            {/* Score & VS */}
            <div className="flex flex-col items-center justify-center space-y-2 flex-shrink-0">
              <div className="text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-slate-200/80 shadow-inner">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-slate-350 text-3xl font-light">:</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full tracking-widest border border-blue-100">
                VERSUS
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center min-w-0">
              <div className="relative w-20 h-20 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 flex items-center justify-center mb-3 group transition-transform hover:scale-105 duration-300">
                {match.awayTeam?.teamLogo ? (
                  <Image
                    src={formatImagePath(match.awayTeam.teamLogo)}
                    alt="away"
                    fill
                    className="object-contain p-2"
                  />
                ) : (
                  <div className="text-gray-300 text-[10px] font-medium text-center">No Logo</div>
                )}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-2 w-full">
                {match.awayTeam?.teamName || "Away Team"}
              </h3>
              <span className="text-[10px] text-slate-400 font-extrabold tracking-widest mt-1">Away</span>
            </div>
          </div>

          {/* Referee Section */}
          <div className="bg-slate-50 border border-slate-200/85 p-5 rounded-2xl space-y-4">
            <h4 className="text-[11px] font-extrabold text-slate-800 tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2 uppercase">
              <User className="w-4 h-4 text-blue-600" /> Assigned Match Referee
            </h4>

            {refereeName ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 bg-white rounded-full border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                    {match.referee?.profile ? (
                      <Image
                        src={formatImagePath(match.referee.profile)}
                        alt="referee"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-350" />
                    )}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-slate-900 text-sm block leading-tight truncate">{refereeName}</span>
                    <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 inline-block capitalize">
                      {match.referee?.status || "Active"} Referee
                    </span>
                  </div>
                </div>

                {/* Contact info list */}
                <div className="flex flex-col gap-1 text-xs text-slate-600 min-w-0">
                  {match.referee?.email && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {match.referee.email}
                    </span>
                  )}
                  {match.referee?.phone && (
                    <span className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {match.referee.phone}
                    </span>
                  )}
                </div>

                {/* Unassign Action Button */}
                <button
                  type="button"
                  onClick={handleUnassignReferee}
                  disabled={isUnassigning}
                  className="px-4 py-2 border border-rose-200 text-rose-650 hover:bg-rose-50 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 flex-shrink-0"
                  title="Unassign Referee from this Match"
                >
                  {isUnassigning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserX className="w-3.5 h-3.5" />
                  )}
                  Unassign Referee
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <span className="text-lg">⚠️</span>
                <div className="text-xs text-amber-800">
                  <span className="font-bold block">No Referee Assigned</span>
                  <span className="text-[11px] text-amber-750">Assign a referee using the Match Edit page.</span>
                </div>
              </div>
            )}
          </div>

          {/* Info Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Competition or Age Group Info */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <Award className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Competition</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full" title={match.league?.leagueName || "Cup / Friendly"}>
                {matchType === "league" ? match.league?.leagueName || "League Match" : "Cup / Friendly Match"}
              </span>
              {matchType !== "league" && match.ageGroup && (
                <span className="text-[9px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded-full mt-0.5">
                  Age: {match.ageGroup}
                </span>
              )}
            </div>

            {/* Venue */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <MapPin className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Venue</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full" title={match.venueName || "N/A"}>
                {match.venueName || "N/A"}
              </span>
            </div>

            {/* Date & Time */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Date & Time</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full">
                {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("DD MMM, YYYY") : "N/A"}
              </span>
              <span className="text-[9px] text-slate-400 font-medium mt-0.5">
                {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("hh:mm A") : ""}
              </span>
            </div>

            {/* Duration */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <Clock className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Duration</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full">
                {match.durationMinutes ? `${match.durationMinutes}` : "90 Mins"}
              </span>
            </div>

            {/* Formation */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <Grid className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Formation</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full">
                {match.formation || "N/A"}
              </span>
            </div>

            {/* Max Players */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 min-w-0 shadow-3xs">
              <Users className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 tracking-widest uppercase">Max Players</span>
              <span className="text-slate-900 font-bold text-xs leading-tight truncate w-full">
                {match.maxPlayersPerTeam ? `${match.maxPlayersPerTeam} per team` : "11 per team"}
              </span>
            </div>
          </div>

          {/* Match Timestamps Timeline */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Match Timeline & Timestamps (UK Time)
              </span>
              {match.period && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                  {match.period.replace("_", " ")}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">Scheduled At:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.scheduledAt || match.matchDate
                    ? dayjs(match.scheduledAt || match.matchDate)
                        .tz("Europe/London")
                        .format("DD MMM YYYY, HH:mm:ss")
                    : "N/A"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">Started At:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.startedAt
                    ? dayjs(match.startedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss")
                    : "Not Started"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">1st Half Started:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.firstHalfStartedAt
                    ? dayjs(match.firstHalfStartedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss")
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">Half Time At:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.halfTimeAt
                    ? dayjs(match.halfTimeAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss")
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">2nd Half Started:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.secondHalfStartedAt
                    ? dayjs(match.secondHalfStartedAt)
                        .tz("Europe/London")
                        .format("DD MMM YYYY, HH:mm:ss")
                    : "-"}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-semibold text-gray-500">Finished At:</span>
                <span className="font-bold text-slate-800 text-[11px] truncate">
                  {match.finishedAt
                    ? dayjs(match.finishedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss")
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {match.notes && (
            <div className="bg-amber-50/80 border border-amber-100 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold text-amber-700 tracking-widest flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-500" /> Match Notes
              </span>
              <p className="text-gray-700 text-xs leading-relaxed italic">"{match.notes}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchViewModal;
