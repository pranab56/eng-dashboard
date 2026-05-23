"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { Calendar, Globe, MapPin, Shield, Trash2, Trophy } from "lucide-react";
import Image from "next/image";
import { baseURL } from '../../../utils/BaseURL';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

interface LeagueTeamViewModalProps {
  data: { league: any; teams: any[] } | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteTeam?: (leagueId: string, teamId: string) => void;
}

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
      <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col">
        {/* ── Header ── */}
        <DialogHeader className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 p-7 text-white relative overflow-hidden flex-shrink-0">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            <DialogTitle className="sr-only">League Details</DialogTitle>
            {/* League Icon + Name */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-gray-900" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-black text-white leading-tight">
                  {league?.leagueName || "N/A"}
                </h2>
                <p className="text-gray-400 text-sm font-medium mt-0.5">
                  Season: {league?.season || "N/A"}
                </p>
              </div>
            </div>

            {/* League meta chips */}
            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-300">
                <Calendar className="w-3 h-3 text-yellow-400" />
                {startDate} → {endDate}
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                <Shield className="w-3 h-3 text-blue-400" />
                {teams.length} {teams.length === 1 ? "Team" : "Teams"}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Team List ── */}
        <div className="overflow-y-auto flex-1 p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
            Registered Teams
          </h3>

          {teams.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <Shield className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No teams registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md hover:border-gray-200 transition-all duration-200"
                >
                  {/* Index */}
                  <span className="text-xs font-black text-gray-300 w-5 text-center flex-shrink-0">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {team.teamLogo ? (
                      <Image
                        src={baseURL + team.teamLogo}
                        alt={team.teamName || "team"}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full p-1"
                      />
                    ) : (
                      <span className="text-sm font-black text-gray-300">
                        {team.shortName?.slice(0, 2) || "?"}
                      </span>
                    )}
                  </div>

                  {/* Name & Short */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight truncate">
                      {team.teamName || "N/A"}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {team.shortName || ""}
                      </span>
                      {team.teamType && (
                        <span className="text-xs text-blue-600 font-semibold">
                          • {team.teamType}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Stadium */}
                  <div className="hidden sm:flex flex-col items-end gap-0.5 min-w-0">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-[120px]">
                        {team.stadiumName || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Globe className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {[team.city, team.country].filter(Boolean).join(", ") || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Delete btn (only shown if handler provided) */}
                  {onDeleteTeam && (
                    <button
                      onClick={() => onDeleteTeam(league._id, team._id)}
                      className="opacity-0 cursor-pointer group-hover:opacity-100 flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 transition-all duration-200 flex-shrink-0"
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
