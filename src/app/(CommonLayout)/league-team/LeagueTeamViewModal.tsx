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
      <div className="w-full h-full bg-blue-50 text-blue-600 font-extrabold flex items-center justify-center text-xs">
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

  const { league, teams } = data;

  const startDate = league?.startDate
    ? dayjs(league.startDate).format("DD MMM YYYY")
    : "N/A";
  const endDate = league?.endDate
    ? dayjs(league.endDate).format("DD MMM YYYY")
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <DialogHeader className="bg-gradient-to-br from-slate-950 via-gray-900 to-black p-7 text-white relative overflow-hidden flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30 backdrop-blur-md border border-white/20"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Decorative blur elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <DialogTitle className="sr-only">League Details</DialogTitle>

            {/* League Icon + Name */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-slate-950" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white leading-tight">
                  {league?.leagueName || "N/A"}
                </h2>
                <p className="text-gray-400 text-xs font-semibold mt-0.5">
                  Season: {league?.season || "N/A"}
                </p>
              </div>
            </div>

            {/* League meta chips */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-200 border border-white/10">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {startDate} → {endDate}
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                {teams.length} {teams.length === 1 ? "Team" : "Teams"}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Team List */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-extrabold text-blue-600 . tracking-widest">
              Registered Teams ({teams.length})
            </h3>
          </div>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 space-y-2">
              <Shield className="w-10 h-10 opacity-30 text-gray-400" />
              <p className="text-xs font-semibold">No teams registered yet for this league</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-white hover:shadow-md hover:border-blue-100 transition-all duration-200"
                >
                  {/* Index */}
                  <span className="text-xs font-black text-gray-400 w-5 text-center flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Logo Container with Error Fallback */}
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200/80 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <TeamLogoImage team={team} />
                  </div>

                  {/* Name & Short */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm leading-tight truncate">
                      {team.teamName || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1">
                      <span className="text-[10px] font-extrabold text-gray-400 . tracking-widest">
                        {team.shortName || "TEAM"}
                      </span>
                      {team.teamType && (
                        <span className="text-[11px] text-blue-600 font-medium">
                          • {team.teamType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Stadium */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                      <MapPin className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {team.stadiumName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold">
                      <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span>
                        {[team.city, team.country].filter(Boolean).join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Delete btn */}
                  {onDeleteTeam && (
                    <button
                      type="button"
                      onClick={() => onDeleteTeam(league._id, team._id)}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 flex-shrink-0 cursor-pointer"
                      title="Remove from league"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueTeamViewModal;
