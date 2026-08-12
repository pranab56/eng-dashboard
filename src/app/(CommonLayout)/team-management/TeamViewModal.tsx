/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatImagePath } from '@/utils/formatImagePath';
import Image from 'next/image';
import dayjs from 'dayjs';
import { X, Building2, MapPin, Calendar, Users, Shield, Trophy, Coins, UserCheck, TrendingUp } from 'lucide-react';

interface TeamViewModalProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
}

const TeamViewModal = ({ team, isOpen, onClose }: TeamViewModalProps) => {
  if (!team) return null;
  const logoUrl = formatImagePath(team.teamLogo);
  const league = team.league;

  // Extract all managers reliably
  const managersList: any[] = [];
  if (Array.isArray(team.managers)) {
    team.managers.forEach((m: any) => {
      const mgr = m.manager || m;
      if (mgr && typeof mgr === 'object') {
        managersList.push(mgr);
      }
    });
  } else if (team.managers && typeof team.managers === 'object') {
    managersList.push(team.managers);
  } else if (team.manager && typeof team.manager === 'object') {
    managersList.push(team.manager);
  }

  const marketValue = team.marketValue || (team.coin ? team.coin * 100 : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950 p-7 text-white relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Background Decorative Blur */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="flex flex-col items-center justify-center space-y-3 relative z-10 pt-1">
            <div className="relative w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border-2 border-white/20 shadow-2xl flex items-center justify-center group">
              {logoUrl ? (
                <Image src={logoUrl} alt="logo" fill className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
              ) : (
                <Shield className="w-10 h-10 text-white/40" />
              )}
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-2xl font-black text-white tracking-tight">{team.teamName}</DialogTitle>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest bg-blue-500/20 border border-blue-400/30 text-blue-200">
                  {team.shortName || "CLUB"}
                </span>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                  {team.teamType || "PRO SQUAD"}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-4 text-slate-800">

          {/* Associated League & Manager Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Associated League */}
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Associated League</p>
                <p className="text-xs font-bold text-slate-900 truncate">
                  {league?.leagueName || league?.name || team.leagueName || 'Independent / Unassigned'}
                </p>
              </div>
            </div>

            {/* Assigned Manager(s) */}
            <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">
                  {managersList.length > 1 ? `Team Managers (${managersList.length})` : 'Team Manager'}
                </p>
                {managersList.length === 0 ? (
                  <p className="text-xs font-semibold text-slate-400">No Manager Assigned</p>
                ) : (
                  <div className="space-y-0.5">
                    {managersList.map((m: any, idx: number) => {
                      const name = m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : (m.userName || `Manager ${idx + 1}`);
                      return (
                        <p key={m._id || idx} className="text-xs font-bold text-slate-900 truncate">
                          {name}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <Building2 className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Stadium</span>
              <span className="text-gray-900 font-semibold text-xs leading-tight truncate max-w-full" title={team.stadiumName || team.stadium || "N/A"}>
                {team.stadiumName || team.stadium || "N/A"}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <MapPin className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location</span>
              <span className="text-gray-900 font-semibold text-xs leading-tight truncate max-w-full" title={team.city || team.location || "N/A"}>
                {team.city || team.location || "N/A"}
              </span>
              <span className="text-[9px] text-gray-400 font-medium">{team.country || "Worldwide"}</span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-3.5 rounded-2xl flex flex-col items-center text-center space-y-1">
              <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Registered</span>
              <span className="text-gray-900 font-semibold text-xs leading-tight">
                {team.createdAt ? dayjs(team.createdAt).format("DD MMM YYYY") : "N/A"}
              </span>
            </div>
          </div>

          {/* Squad Strength, Coin Balance & Market Value Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-blue-600 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Squad Members
              </span>
              <h4 className="text-lg font-black text-indigo-950 mt-1">
                {team.totalMembers || (team.players ? team.players.length : 0)} <span className="text-xs font-medium text-indigo-500">Players</span>
              </h4>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-amber-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" /> Coin Budget
              </span>
              <h4 className="text-lg font-black text-amber-950 mt-1">
                {(team.coin || 0).toLocaleString()} <span className="text-xs font-medium text-amber-600">Coins</span>
              </h4>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 flex flex-col justify-between">
              <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Market Value
              </span>
              <h4 className="text-lg font-black text-emerald-950 mt-1">
                £{marketValue.toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Type & Identity Footer */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900 rounded-2xl text-white shadow-md">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Team Category</p>
              <p className="font-medium text-xs">{team.teamType || "Club Squad"}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Team ID</p>
              <p className="font-mono text-[10px] text-blue-300">{team._id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamViewModal;
