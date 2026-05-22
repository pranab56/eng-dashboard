"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { TPlayer } from '@/types/columnTypes';

interface PlayerViewModalProps {
  player: TPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerViewModal = ({ player, isOpen, onClose }: PlayerViewModalProps) => {
  if (!player) return null;

  const fullName = `${player.firstName} ${player.lastName}`;
  const initials = `${player.firstName?.[0] || ''}${player.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-br from-emerald-900 via-green-900 to-black p-10 text-white relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col items-center justify-center space-y-4 relative z-10">
            {/* Avatar */}
            <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full border-4 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
              {player.profile ? (
                <Image
                  src={player.profile}
                  alt={fullName}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-3xl font-black text-white/80">{initials || 'P'}</span>
              )}
            </div>

            {/* Name & Position */}
            <div className="text-center">
              <DialogTitle className="text-2xl font-black tracking-tight">{fullName}</DialogTitle>
              <span className="inline-block mt-2 px-3 py-1 bg-emerald-500/30 border border-emerald-400/30 rounded-full text-emerald-200 text-xs font-bold uppercase tracking-widest">
                {player.position || 'No Position'}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Team Info Card */}
          <div className="flex items-center gap-4 p-5 bg-gray-50 border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0">
              {player.teamLogo ? (
                <Image
                  src={player.teamLogo}
                  alt={player.teamName || 'team'}
                  width={56}
                  height={56}
                  className="object-contain w-full h-full p-1"
                />
              ) : (
                <span className="text-gray-400 text-xl font-black">?</span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Current Club</p>
              <p className="text-gray-900 font-bold text-base leading-tight">{player.teamName || 'No Team'}</p>
              {player.shortName && (
                <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">{player.shortName}</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 duration-300">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Position</span>
              <span className="text-gray-900 font-bold text-sm">{player.position || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-emerald-200 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/5 duration-300">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Goals</span>
              <span className="text-gray-900 font-bold text-2xl">{player.goals ?? '—'}</span>
            </div>
          </div>

          {/* Footer Dark Bar */}
          <div className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl text-white shadow-xl shadow-gray-900/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-black text-sm">
                {initials?.[0] || 'P'}
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Full Name</p>
                <p className="font-bold text-sm">{fullName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Club</p>
              <p className="font-semibold text-emerald-300 text-sm">{player.teamName || 'Free Agent'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerViewModal;
