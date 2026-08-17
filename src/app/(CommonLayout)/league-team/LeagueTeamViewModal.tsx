/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { Calendar, Globe, MapPin, Shield, Trash2, Trophy, X } from "lucide-react";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";

interface LeagueTeamViewModalProps {
  data: { league: any; teams: any[] } | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteTeam?: (leagueId: string, teamId: string) => void;
}

const TeamLogoImage = ({ team }: { team: any }) => {
  const [imageError, setImageError] = useState(false);
  const logoUrl = team.teamLogo ? formatImagePath(team.teamLogo) : null;

  if (!logoUrl || imageError) {
    return (
      <div className="w-full h-full bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center text-xs">
        {team.shortName?.slice(0, 2) || team.teamName?.slice(0, 2) || "?"}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={team.teamName || "team"}
      width={44}
      height={44}
      className="object-contain w-full h-full p-1"
      onError={() => setImageError(true)}
    />
  );
};

const LeagueTeamViewModal = ({
  data,
  isOpen,
  onClose,
  onDeleteTeam,
}: LeagueTeamViewModalProps) => {
  if (!data) return null;

  const { league, teams = [] } = data;

  const startDate = league?.startDate
    ? dayjs(league.startDate).format("DD MMM YYYY")
    : "N/A";
  const endDate = league?.endDate
    ? dayjs(league.endDate).format("DD MMM YYYY")
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col">
        {/* Clean Light Header Banner (Matches User Management Style) */}
        <DialogHeader className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Header Trophy Box */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-xs text-amber-600">
              <Trophy className="w-7 h-7" />
            </div>

            <div className="flex-1 pr-6 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  League Ecosystem
                </span>

                {league?.season && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                    Season: {league.season}
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {teams.length} {teams.length === 1 ? "Team" : "Teams"} Registered
                </span>
              </div>

              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 mt-1 truncate">
                {league?.leagueName || "League Roster"}
              </DialogTitle>

              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{startDate} → {endDate}</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container */}
        <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1 text-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              Registered Teams ({teams.length})
            </h3>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-2 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Shield className="w-10 h-10 stroke-1 text-slate-300" />
              <p className="text-xs font-semibold text-slate-500">No teams registered yet for this league</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:shadow-md hover:border-indigo-200 transition-all duration-200"
                >
                  {/* Index Pill */}
                  <span className="text-xs font-bold text-slate-400 w-5 text-center shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Logo Container */}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center shrink-0 overflow-hidden">
                    <TeamLogoImage team={team} />
                  </div>

                  {/* Team Name & Short Name */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm leading-tight truncate">
                      {team.teamName || "N/A"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200/60 px-2 py-0.5 rounded-md">
                        {team.shortName || "TEAM"}
                      </span>
                      {team.teamType && (
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {team.teamType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Stadium */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {team.stadiumName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {[team.city, team.country].filter(Boolean).join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Delete Button Action */}
                  {onDeleteTeam && (
                    <button
                      type="button"
                      onClick={() => onDeleteTeam(league._id, team._id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 hover:text-rose-600 transition-all duration-200 shrink-0 cursor-pointer border border-rose-200/60"
                      title="Remove team from league"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer (Matches User Management Style) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-500" /> Season: {league?.season || "Current"}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueTeamViewModal;
