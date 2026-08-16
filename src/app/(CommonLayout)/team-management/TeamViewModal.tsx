/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatImagePath } from '@/utils/formatImagePath';
import Image from 'next/image';
import dayjs from 'dayjs';
import {
  X,
  Users,
  Shield,
  Trophy,
  Coins,
  UserCheck,
  TrendingUp,
  Search,
} from 'lucide-react';

interface TeamViewModalProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
}

const TeamViewModal = ({ team, isOpen, onClose }: TeamViewModalProps) => {
  const [memberSearch, setMemberSearch] = useState('');

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
  const rawMembers: any[] = Array.isArray(team.members) ? team.members : [];

  const filteredMembers = rawMembers.filter((member: any) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase().trim();
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.toLowerCase();
    const email = (member.email || '').toLowerCase();
    const pos = (member.position || '').toLowerCase();
    const uname = (member.userName || '').toLowerCase();
    return fullName.includes(q) || email.includes(q) || pos.includes(q) || uname.includes(q);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl md:max-w-4xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col"
      >
        {/* Clean Light Header Banner - Matching UserVerificationModal & ParentViewModal */}
        <DialogHeader className="bg-slate-50/90 p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-200 p-2 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
              {logoUrl ? (
                <Image
                  src={logoUrl}
                  alt={team.teamName || 'Team Logo'}
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <Shield className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2 truncate">
                {team.teamName}
              </DialogTitle>

              <p className="text-xs text-slate-500 font-medium mt-0.5 flex flex-wrap items-center gap-2">
                <span>{team.stadiumName || team.stadium || 'Home Stadium N/A'}</span>
                {(team.city || team.location) && (
                  <>
                    <span>•</span>
                    <span>{team.city || team.location}, {team.country || 'Worldwide'}</span>
                  </>
                )}
                {team.createdAt && (
                  <>
                    <span>•</span>
                    <span>Registered {dayjs(team.createdAt).format('MMM DD, YYYY')}</span>
                  </>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  {team.shortName || 'CLUB'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  {team.teamType || 'PRO SQUAD'}
                </span>
                {league?.leagueName || team.leagueName ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    {league?.leagueName || team.leagueName}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container - Clean Light Style */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar text-slate-800">
          {/* Key Metrics Cards (3 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Squad Members</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {rawMembers.length || team.totalMembers || 0} <span className="text-xs font-normal text-slate-500">Players</span>
              </p>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Coin Budget</span>
                <Coins className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                {(team.coin || 0).toLocaleString()} <span className="text-xs font-normal text-slate-500">Coins</span>
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500">Market Value</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-slate-900">
                £{marketValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Associated League & Manager Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Associated League Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-600" /> Associated League
              </h3>
              <div className="pt-1">
                <p className="text-sm font-bold text-slate-900">
                  {league?.leagueName || league?.name || team.leagueName || 'Independent / Unassigned'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Ground: {team.stadiumName || team.stadium || 'N/A'}
                </p>
              </div>
            </div>

            {/* Team Manager Card */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" /> Team Manager
              </h3>
              <div className="pt-1">
                {managersList.length === 0 ? (
                  <p className="text-xs text-slate-400 font-medium">No Manager Assigned</p>
                ) : (
                  <div className="space-y-0.5">
                    {managersList.map((m: any, idx: number) => {
                      const name = m.firstName
                        ? `${m.firstName} ${m.lastName || ''}`.trim()
                        : m.userName || `Manager ${idx + 1}`;
                      return (
                        <div key={m._id || idx}>
                          <p className="text-sm font-bold text-slate-900">{name}</p>
                          {m.email && <p className="text-xs text-slate-500 font-medium">{m.email}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Squad Members / Players List Section */}
          <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Squad Members ({filteredMembers.length})
              </h3>

              {rawMembers.length > 0 && (
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search player name..."
                    className="w-full pl-9 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      onClick={() => setMemberSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {filteredMembers.map((member: any, index: number) => {
                  const name = member.firstName
                    ? `${member.firstName} ${member.lastName || ''}`.trim()
                    : member.userName || `Player ${index + 1}`;
                  const profileImg = formatImagePath(member.profile);

                  return (
                    <div
                      key={member._id || index}
                      className="flex items-center gap-3 p-2.5 bg-white border border-slate-200/80 rounded-xl hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="relative w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {profileImg ? (
                          <Image
                            src={profileImg}
                            alt={name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-slate-600">
                            {name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {member.email || member.phone || 'Player'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {member.position && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 rounded-md">
                            {member.position}
                          </span>
                        )}
                        {member.engCoine !== undefined && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 rounded-md">
                            {member.engCoine} C
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                {memberSearch ? 'No players match your search.' : 'No squad members registered in this team.'}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamViewModal;
