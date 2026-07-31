/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { CalendarDays, Trophy, X, Clock } from "lucide-react";

interface LeagueViewModalProps {
  league: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "running": return "bg-emerald-500/20 text-emerald-300 border-emerald-400/30";
    case "upcoming": return "bg-blue-500/20 text-blue-300 border-blue-400/30";
    case "finished": return "bg-gray-500/20 text-gray-300 border-gray-400/30";
    default: return "bg-amber-500/20 text-amber-300 border-amber-400/30";
  }
};

const LeagueViewModal = ({ league, isOpen, onClose }: LeagueViewModalProps) => {
  if (!league) return null;

  const duration = dayjs(league.endDate).diff(dayjs(league.startDate), "day");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-lg bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <DialogHeader className="bg-gradient-to-br from-violet-950 via-purple-900 to-black p-8 text-white relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center space-y-4 text-center pt-2">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black text-white tracking-tight leading-tight">
                {league.leagueName}
              </DialogTitle>
              <p className="text-purple-300/80 font-extrabold tracking-widest . text-xs">
                Season {league.season || '1'}
              </p>
            </div>
            <span className={`inline-flex items-center px-3.5 py-0.5 rounded-full text-[10px] font-extrabold . tracking-widest border ${statusStyle(league.status)}`}>
              {league.status}
            </span>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center transition-all hover:border-purple-200 hover:bg-white hover:shadow-md duration-300">
              <CalendarDays className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-[10px] font-extrabold text-purple-600 . tracking-widest mb-0.5">Start Date</span>
              <span className="text-gray-900 font-medium text-xs">
                {league.startDate ? dayjs(league.startDate).format("DD MMM, YYYY") : "N/A"}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center transition-all hover:border-purple-200 hover:bg-white hover:shadow-md duration-300">
              <CalendarDays className="w-4 h-4 text-purple-600 mb-1" />
              <span className="text-[10px] font-extrabold text-purple-600 . tracking-widest mb-0.5">End Date</span>
              <span className="text-gray-900 font-medium text-xs">
                {league.endDate ? dayjs(league.endDate).format("DD MMM, YYYY") : "N/A"}
              </span>
            </div>
          </div>

          {/* Duration Banner */}
          <div className="flex items-center justify-between bg-gradient-to-r from-violet-50/80 to-purple-50/80 border border-purple-100 rounded-2xl p-5">
            <div className="space-y-0.5">
              <span className="text-purple-600 font-extrabold text-[10px] . tracking-widest flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Total Duration
              </span>
              <h4 className="text-2xl font-black text-purple-950">
                {isNaN(duration) ? '0' : duration} <span className="text-xs font-medium text-purple-500 ml-0.5">Days</span>
              </h4>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl border border-purple-100 shadow-sm flex items-center justify-center text-purple-600">
              <Trophy className="w-6 h-6 text-purple-600" />
            </div>
          </div>

          {/* Footer Dark Bar */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-md">
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold . tracking-widest">Created Date</p>
              <p className="font-medium text-xs">{league.createdAt ? dayjs(league.createdAt).format("DD MMM, YYYY") : "N/A"}</p>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-extrabold . tracking-widest">League ID</p>
              <p className="font-mono text-[10px] text-purple-300">{league._id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueViewModal;
