/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { Calendar, Globe, MapPin, Search, Shield, Trash2, Trophy, X } from "lucide-react";
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
  if (!team) return null;
  const logoUrl = team.teamLogo ? formatImagePath(team.teamLogo) : null;

  if (!logoUrl || imageError) {
    return (
      <div className="w-full h-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
        {team.shortName?.slice(0, 2) || team.teamName?.slice(0, 2) || "T"}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={team.teamName || "team"}
      width={36}
      height={36}
      className="object-contain w-full h-full p-0.5"
      onError={() => setImageError(true)}
    />
  );
};

export default function LeagueTeamViewModal({
  data,
  isOpen,
  onClose,
  onDeleteTeam,
}: LeagueTeamViewModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const league = data?.league;
  const teams = useMemo(
    () => (data?.teams || []).filter(Boolean),
    [data?.teams]
  );

  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase().trim();
    return teams.filter(
      (t) =>
        (t.teamName || "").toLowerCase().includes(q) ||
        (t.shortName || "").toLowerCase().includes(q) ||
        (t.city || "").toLowerCase().includes(q) ||
        (t.stadiumName || "").toLowerCase().includes(q)
    );
  }, [teams, searchQuery]);

  if (!data) return null;

  const startDate = league?.startDate
    ? dayjs(league.startDate).format("DD MMM YYYY")
    : "N/A";
  const endDate = league?.endDate
    ? dayjs(league.endDate).format("DD MMM YYYY")
    : "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl bg-white rounded-xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[85vh] flex flex-col text-left"
      >
        {/* Header */}
        <DialogHeader className="p-5 border-b border-slate-200 bg-slate-50/60 relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5 pr-8">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-600 shadow-2xs">
              <Trophy className="w-5 h-5 text-slate-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-bold text-slate-900 leading-snug truncate">
                  {league?.leagueName || "League Roster"}
                </DialogTitle>
                {league?.season && (
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 border border-slate-300">
                    Season {league.season}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {startDate} &ndash; {endDate}
                </span>
                <span>&bull;</span>
                <span className="font-mono text-slate-700 font-semibold">
                  {teams.length} {teams.length === 1 ? "team" : "teams"}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Search bar inside modal if teams > 4 */}
        {teams.length > 4 && (
          <div className="p-3 border-b border-slate-100 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter roster by club or city..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body / Team List */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {filteredTeams.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Shield className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-xs font-medium text-slate-600">
                {searchQuery
                  ? "No teams match your filter query."
                  : "No teams currently associated with this league."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
              {filteredTeams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="flex items-center gap-3 p-3 hover:bg-slate-50/70 transition-colors"
                >
                  {/* Index */}
                  <span className="text-[11px] font-mono text-slate-400 w-5 text-center shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Logo */}
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    <TeamLogoImage team={team} />
                  </div>

                  {/* Team Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                        {team.teamName || "N/A"}
                      </p>
                      {team.shortName && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 uppercase">
                          {team.shortName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      {team.stadiumName && (
                        <span className="flex items-center gap-1 truncate max-w-[150px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{team.stadiumName}</span>
                        </span>
                      )}
                      {team.city && (
                        <span className="flex items-center gap-1 text-slate-400">
                          <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{team.city}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Remove Team Action Button */}
                  {onDeleteTeam && (
                    <button
                      type="button"
                      onClick={() => onDeleteTeam(league._id, team._id)}
                      className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                      title="Remove team from this league"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-700">{filteredTeams.length}</strong> of{" "}
            <strong className="text-slate-700">{teams.length}</strong> clubs
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
