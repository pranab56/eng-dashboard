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
import { X, Building2, MapPin, Calendar, Users, Shield } from 'lucide-react';

interface TeamViewModalProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
}

const TeamViewModal = ({ team, isOpen, onClose }: TeamViewModalProps) => {
  if (!team) return null;
  const logoUrl = formatImagePath(team.teamLogo);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <DialogHeader className="bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950 p-8 text-white relative overflow-hidden">
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

          <div className="flex flex-col items-center justify-center space-y-4 relative z-10 pt-2">
            <div className="relative w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl p-3 border-2 border-white/20 shadow-2xl flex items-center justify-center group">
              {logoUrl ? (
                <Image src={logoUrl} alt="logo" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300 drop-shadow-lg" />
              ) : (
                <Shield className="w-12 h-12 text-white/40" />
              )}
            </div>
            <div className="text-center space-y-1">
              <DialogTitle className="text-2xl font-black text-white tracking-tight">{team.teamName}</DialogTitle>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold . tracking-widest bg-blue-500/20 border border-blue-400/30 text-blue-200">
                  {team.shortName || "CLUB"}
                </span>
                <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold . tracking-widest bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                  {team.teamType || "PRO SQUAD"}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
          {/* Main Info Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md duration-300">
              <Building2 className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Stadium</span>
              <span className="text-gray-900 font-medium text-xs leading-tight truncate max-w-full" title={team.stadiumName || "N/A"}>
                {team.stadiumName || "N/A"}
              </span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md duration-300">
              <MapPin className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Location</span>
              <span className="text-gray-900 font-medium text-xs leading-tight truncate max-w-full" title={team.city || "Unknown"}>
                {team.city || "N/A"}
              </span>
              <span className="text-[9px] text-gray-400 font-medium .">{team.country || "Worldwide"}</span>
            </div>

            <div className="bg-gray-50/80 border border-gray-100 p-4 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-md duration-300">
              <Calendar className="w-4 h-4 text-blue-600 mb-0.5" />
              <span className="text-[10px] font-extrabold text-blue-600 . tracking-widest">Registered</span>
              <span className="text-gray-900 font-medium text-xs leading-tight">
                {team.createdAt ? dayjs(team.createdAt).format("DD MMM YYYY") : "N/A"}
              </span>
            </div>
          </div>

          {/* Squad Strength Banner */}
          <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-blue-600 font-extrabold text-[10px] . tracking-widest flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Total Squad Strength
              </span>
              <h4 className="text-2xl font-black text-indigo-950">
                {team.totalMembers || 0} <span className="text-xs font-medium text-indigo-500 ml-1">Registered Players</span>
              </h4>
            </div>
            <div className="w-12 h-12 bg-white rounded-2xl border border-blue-100 shadow-sm flex items-center justify-center text-blue-600 font-black text-xl">
              {team.teamType?.[0] || 'T'}
            </div>
          </div>

          {/* Type & Identity Footer */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-extrabold text-xs">
                #
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-extrabold . tracking-widest">Team Category</p>
                <p className="font-medium text-xs">{team.teamType || "Club"}</p>
              </div>
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[9px] text-slate-400 font-extrabold . tracking-widest">Team ID</p>
              <p className="font-mono text-[10px] text-blue-300">{team._id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamViewModal;
