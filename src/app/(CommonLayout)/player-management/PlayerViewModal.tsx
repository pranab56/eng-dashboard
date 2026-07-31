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
import { formatImagePath } from '@/utils/formatImagePath';
import { X, Shield, DollarSign, Coins, Building2 } from 'lucide-react';

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
      <DialogContent showCloseButton={false} className="max-w-lg bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-br from-emerald-950 via-slate-900 to-black p-8 text-white relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-green-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col items-center justify-center space-y-4 relative z-10 pt-2">
            {/* Avatar */}
            <div className="relative w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center group">
              {player.profile ? (
                <Image
                  src={formatImagePath(player.profile)}
                  alt={fullName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <span className="text-3xl font-black text-white/90">{initials || 'P'}</span>
              )}
            </div>

            {/* Name & Position */}
            <div className="text-center space-y-1.5">
              <DialogTitle className="text-2xl font-black text-white tracking-tight">{fullName}</DialogTitle>
              <div className="flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-emerald-300 text-[11px] font-extrabold uppercase tracking-widest">
                  <Shield className="w-3 h-3 text-emerald-400" />
                  {player.position || 'Player'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 space-y-5">

          {/* Team Info Card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50/80 border border-gray-100 rounded-2xl hover:border-emerald-200 hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              {player.teamLogo ? (
                <Image
                  src={player.teamLogo}
                  alt={player.teamName || 'team'}
                  width={48}
                  height={48}
                  className="object-contain p-1"
                />
              ) : (
                <Building2 className="w-6 h-6 text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">Current Club</p>
              <p className="text-gray-900 font-medium text-base leading-tight truncate">{player.teamName || 'Free Agent'}</p>
              {player.shortName && (
                <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">{player.shortName}</p>
              )}
            </div>
          </div>

          {/* Stats & Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md duration-300">
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-500" /> Market Value
              </span>
              <span className="text-gray-900 font-black text-lg">
                {player.marketValue ? `$${player.marketValue.toLocaleString()}` : 'N/A'}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center transition-all hover:border-emerald-200 hover:bg-white hover:shadow-md duration-300">
              <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-500" /> ENG Coins
              </span>
              <span className="text-gray-900 font-black text-lg flex items-center gap-1">
                🪙 {((player.engCoine ?? player.engCoin ?? player.coin) ?? 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Footer Card */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-black text-xs text-slate-950">
                {initials?.[0] || 'P'}
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Full Name</p>
                <p className="font-medium text-xs">{fullName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">Status</p>
              <p className="font-semibold text-emerald-400 text-xs">Active Member</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerViewModal;




