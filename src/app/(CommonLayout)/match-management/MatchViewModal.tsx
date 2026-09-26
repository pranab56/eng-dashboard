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
  UserX,
  Loader2,
  Award,
  Grid,
  TrendingUp,
  ShieldCheck,
  Shield,
  ArrowRight,
} from "lucide-react";

interface MatchViewModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
  onManageCleanSheet?: (match: any) => void;
}

const MatchViewModal = ({
  match,
  isOpen,
  onClose,
  onManageCleanSheet,
}: MatchViewModalProps) => {
  const [updateMatch, { isLoading: isUnassigning }] = useUpdateMatchMutation();

  if (!match) return null;

  const matchStatus = (match.status || "SCHEDULED").toUpperCase();
  const matchType = (match.matchType || "league").toLowerCase();

  // Status Badge Styles - Clean, accessible SaaS palette
  let statusBadgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
  if (matchStatus === "COMPLETED" || matchStatus === "FINISHED") {
    statusBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (matchStatus === "ON GOING" || matchStatus === "LIVE") {
    statusBadgeStyle = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (matchStatus === "CANCELLED") {
    statusBadgeStyle = "bg-slate-100 text-slate-600 border-slate-200";
  }

  // Referee full name
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

  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;
  const homeCleanSheet = homeScore >= 0 && awayScore === 0 && (matchStatus === "COMPLETED" || matchStatus === "FINISHED");
  const awayCleanSheet = awayScore >= 0 && homeScore === 0 && (matchStatus === "COMPLETED" || matchStatus === "FINISHED");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col text-slate-800"
      >
        {/* Clean Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Match Details
              </DialogTitle>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {matchType === "league" ? match.league?.leagueName || "ENG League" : `${matchType.toUpperCase()} Match`}
              </span>
              {match.ageGroup && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  {match.ageGroup}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Fixture ID: {match._id || match.id || "N/A"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wide border ${statusBadgeStyle}`}>
              {match.status}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[66vh] bg-slate-50/40 text-slate-800">
          {/* Production-Grade Matchup & Scoreboard Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="grid grid-cols-11 items-center gap-3 sm:gap-4">
              {/* Home Team */}
              <div className="col-span-4 flex items-center justify-end gap-3 text-right">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {match.homeTeam?.teamName || "Home Team"}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500">
                    Home Squad
                  </span>
                </div>
                <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                  {match.homeTeam?.teamLogo ? (
                    <Image
                      src={formatImagePath(match.homeTeam.teamLogo)}
                      alt="home"
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-500">H</span>
                  )}
                </div>
              </div>

              {/* Score Display */}
              <div className="col-span-3 flex flex-col items-center justify-center text-center">
                <div className="flex items-center justify-center gap-2 bg-slate-100 border border-slate-200/80 px-4 py-1.5 rounded-lg">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {homeScore}
                  </span>
                  <span className="text-slate-400 font-normal">:</span>
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">
                    {awayScore}
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1.5">
                  {match.period ? match.period.replace(/_/g, " ") : "Full Time"}
                </span>
              </div>

              {/* Away Team */}
              <div className="col-span-4 flex items-center justify-start gap-3 text-left">
                <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                  {match.awayTeam?.teamLogo ? (
                    <Image
                      src={formatImagePath(match.awayTeam.teamLogo)}
                      alt="away"
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <span className="text-sm font-bold text-slate-500">A</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {match.awayTeam?.teamName || "Away Team"}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-500">
                    Away Squad
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Clean Sheet Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                homeCleanSheet || awayCleanSheet
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                  : "bg-slate-100 text-slate-400 border border-slate-200"
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900">
                    Clean Sheet Automation
                  </h4>
                  {homeCleanSheet || awayCleanSheet ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Bonus Awarded
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Standard
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {homeCleanSheet && awayCleanSheet
                    ? "Both teams kept a clean sheet (0 goals conceded). Defensive bonus coins allocated."
                    : homeCleanSheet
                    ? `${match.homeTeam?.teamName || "Home Team"} kept a clean sheet (0 conceded).`
                    : awayCleanSheet
                    ? `${match.awayTeam?.teamName || "Away Team"} kept a clean sheet (0 conceded).`
                    : "No automatic clean sheet awarded (both teams conceded goals)."}
                </p>
              </div>
            </div>

            {onManageCleanSheet && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onManageCleanSheet(match);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center cursor-pointer"
              >
                <span>Manage Clean Sheets</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            )}
          </div>

          {/* Tactical & Match Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Venue Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Venue</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 line-clamp-1" title={match.venueName || "Unassigned"}>
                {match.venueName || "Unassigned"}
              </p>
            </div>

            {/* Pitch Formation */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Grid className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Formation</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {match.formation || "Standard Pitch"}
              </p>
            </div>

            {/* Kickoff Date & Time */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Kickoff</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("DD MMM, HH:mm") : "N/A"}
              </p>
            </div>

            {/* Duration */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">
                {match.durationMinutes ? `${match.durationMinutes} Mins` : "90 Mins"}
              </p>
            </div>
          </div>

          {/* Assigned Referee Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2.5 border-b border-slate-100">
              <User className="w-3.5 h-3.5 text-blue-600" /> Assigned Match Official
            </h4>

            {refereeName ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {match.referee?.profile ? (
                      <Image
                        src={formatImagePath(match.referee.profile)}
                        alt="referee"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs leading-tight">{refereeName}</h5>
                    <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60 inline-block mt-0.5 capitalize">
                      {match.referee?.status || "Active"} Referee
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600">
                  {match.referee?.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {match.referee.email}
                    </span>
                  )}
                  {match.referee?.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {match.referee.phone}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUnassignReferee}
                  disabled={isUnassigning}
                  className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shrink-0 self-start sm:self-center"
                >
                  {isUnassigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserX className="w-3.5 h-3.5" />}
                  Unassign
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                No referee currently assigned to this match fixture.
              </div>
            )}
          </div>

          {/* Timeline & Timestamps Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Match Timeline & Timestamps (UK Time)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Scheduled:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {match.scheduledAt || match.matchDate
                    ? dayjs(match.scheduledAt || match.matchDate).tz("Europe/London").format("DD MMM, HH:mm")
                    : "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Kickoff Started:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {match.startedAt ? dayjs(match.startedAt).tz("Europe/London").format("DD MMM, HH:mm:ss") : "Not Started"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Half Time:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {match.halfTimeAt ? dayjs(match.halfTimeAt).tz("Europe/London").format("HH:mm:ss") : "-"}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 block">Final Whistle:</span>
                <span className="font-semibold text-slate-800 text-xs">
                  {match.finishedAt ? dayjs(match.finishedAt).tz("Europe/London").format("HH:mm:ss") : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50/80 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Overview
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchViewModal;
