/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import Image from 'next/image';
import { formatImagePath } from '../../../utils/formatImagePath';
import { X, MapPin, Calendar, UserCheck, Clock, FileText } from 'lucide-react';

interface MatchViewModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

const MatchViewModal = ({ match, isOpen, onClose }: MatchViewModalProps) => {
  if (!match) return null;

  const matchStatus = (match.status || 'SCHEDULED').toUpperCase();
  let statusBadgeStyle = "bg-amber-500/20 text-amber-300 border-amber-400/30";
  if (matchStatus === 'COMPLETED' || matchStatus === 'FINISHED') {
    statusBadgeStyle = "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
  } else if (matchStatus === 'ON GOING' || matchStatus === 'LIVE') {
    statusBadgeStyle = "bg-rose-500/20 text-rose-300 border-rose-400/30 animate-pulse";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-br from-slate-950 via-zinc-900 to-black p-8 text-white relative overflow-hidden text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center space-y-3 relative z-10 pt-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold . tracking-widest border ${statusBadgeStyle}`}>
              {match.status}
            </span>
            <DialogTitle className="text-2xl font-black text-white tracking-tight">
              Match Overview
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Main Scoreboard */}
          <div className="flex items-center justify-between gap-4 bg-gray-50/80 p-6 rounded-3xl border border-gray-100/80 shadow-sm">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="relative w-20 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center justify-center mb-3 group transition-transform hover:scale-105 duration-300">
                {match.homeTeam?.teamLogo ? (
                  <Image src={formatImagePath(match.homeTeam.teamLogo)} alt="home" fill className="object-contain p-2" />
                ) : (
                  <div className="text-gray-300 text-[10px] font-medium text-center .">No Logo</div>
                )}
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-2">{match.homeTeam?.teamName || 'Home Team'}</h3>
              <span className="text-[10px] text-gray-400 font-extrabold . tracking-widest mt-1">Home</span>
            </div>

            {/* Score & VS */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-gray-200/80 shadow-inner">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-gray-300 text-3xl font-light">:</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
              <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full . tracking-widest border border-blue-100">
                VERSUS
              </span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="relative w-20 h-20 bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex items-center justify-center mb-3 group transition-transform hover:scale-105 duration-300">
                {match.awayTeam?.teamLogo ? (
                  <Image src={formatImagePath(match.awayTeam.teamLogo)} alt="away" fill className="object-contain p-2" />
                ) : (
                  <div className="text-gray-300 text-[10px] font-medium text-center .">No Logo</div>
                )}
              </div>
              <h3 className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-2">{match.awayTeam?.teamName || 'Away Team'}</h3>
              <span className="text-[10px] text-gray-400 font-extrabold . tracking-widest mt-1">Away</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1">
              <MapPin className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Venue</span>
              <span className="text-gray-900 font-medium text-xs leading-tight truncate max-w-full" title={match.venueName || "N/A"}>
                {match.venueName || "N/A"}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1">
              <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Date & Time</span>
              <span className="text-gray-900 font-medium text-xs leading-tight">
                {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("DD MMM, YYYY") : "N/A"}
              </span>
              <span className="text-[9px] text-gray-400 font-medium .">
                {match.matchDate ? dayjs(match.matchDate).tz("Europe/London").format("hh:mm A") : ""}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1">
              <UserCheck className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Referee</span>
              <span className="text-gray-900 font-medium text-xs leading-tight">
                {match.referee?.userName || match.referee?.name || "Unassigned"}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1">
              <Clock className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Duration</span>
              <span className="text-gray-900 font-medium text-xs leading-tight">
                {match.durationMinutes ? `${match.durationMinutes} Mins` : "90 Mins"}
              </span>
            </div>
          </div>

          {/* Match Timestamps Timeline */}
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="text-[11px] font-extrabold text-slate-800 tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Match Timeline & Timestamps (UK Time)
              </span>
              {match.period && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 capitalize">
                  {match.period.replace('_', ' ')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">Scheduled At:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.scheduledAt || match.matchDate ? dayjs(match.scheduledAt || match.matchDate).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "N/A"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">Started At:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.startedAt ? dayjs(match.startedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "Not Started"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">1st Half Started:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.firstHalfStartedAt ? dayjs(match.firstHalfStartedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">Half Time At:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.halfTimeAt ? dayjs(match.halfTimeAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">2nd Half Started:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.secondHalfStartedAt ? dayjs(match.secondHalfStartedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "-"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-gray-500">Finished At:</span>
                <span className="font-bold text-gray-800 text-[11px]">
                  {match.finishedAt ? dayjs(match.finishedAt).tz("Europe/London").format("DD MMM YYYY, HH:mm:ss") : "-"}
                </span>
              </div>
            </div>
          </div>

          {match.notes && (
            <div className="bg-amber-50/80 border border-amber-100 p-4 rounded-2xl space-y-1">
              <span className="text-[10px] font-extrabold text-amber-700 . tracking-widest flex items-center gap-1">
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
