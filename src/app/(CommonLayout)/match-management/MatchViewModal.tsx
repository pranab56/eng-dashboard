"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import dayjs from 'dayjs';

interface MatchViewModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

const MatchViewModal = ({ match, isOpen, onClose }: MatchViewModalProps) => {
  if (!match) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-gray-900 to-black p-8 text-white relative">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-4">
            Match Details
          </DialogTitle>
          <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 bg-[#EABB00] text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
            {match.status}
          </div>
        </DialogHeader>

        <div className="p-8 pt-12 space-y-8">
          {/* Main Scoreboard */}
          <div className="flex items-center justify-between gap-8 bg-gray-50 p-8 rounded-3xl border border-gray-100">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm p-4 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
                {match.homeTeam?.teamLogo ? (
                  <Image src={match.homeTeam.teamLogo} alt="home" width={100} height={100} className="object-contain" />
                ) : (
                   <div className="text-gray-300 text-xs text-center">No Logo</div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{match.homeTeam?.teamName}</h3>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Home</span>
            </div>

            {/* Score & VS */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="text-6xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-gray-200">-</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">VS</div>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm p-4 flex items-center justify-center mb-4 transition-transform hover:scale-105 duration-300">
                 {match.awayTeam?.teamLogo ? (
                  <Image src={match.awayTeam.teamLogo} alt="away" width={100} height={100} className="object-contain" />
                ) : (
                   <div className="text-gray-300 text-xs text-center">No Logo</div>
                )}
              </div>
              <h3 className="font-bold text-gray-900 text-lg leading-tight">{match.awayTeam?.teamName}</h3>
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest mt-1">Away</span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Venue</span>
              <span className="text-gray-800 font-bold">{match.venueName}</span>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date & Time</span>
              <span className="text-gray-800 font-bold">{dayjs(match.matchDate).format("DD MMM, YYYY")}</span>
              <span className="text-xs text-gray-500 font-semibold">{dayjs(match.matchDate).format("HH:mm a")}</span>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Referee</span>
              <span className="text-gray-800 font-bold">{match.referee?.userName || "N/A"}</span>
            </div>
            <div className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Duration</span>
              <span className="text-gray-800 font-bold">{match.durationMinutes} Minutes</span>
            </div>
          </div>
          
          {match.notes && (
             <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
               <span className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2 block">Match Notes</span>
               <p className="text-gray-700 text-sm leading-relaxed italic">"{match.notes}"</p>
             </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchViewModal;
