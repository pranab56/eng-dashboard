import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Trophy, Calendar, Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatImagePath } from "../utils/formatImagePath";

// Row shape: { league: {...}, teams: [...] }
export const getLeagueTeamColumns = (
  onView: (data: { league: any; teams: any[] }) => void,
  onDelete: (leagueId: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "leagueName",
    header: () => (
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        League
      </span>
    ),
    cell: ({ row }) => {
      const league = row.original.league;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-600">
            <Trophy className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight truncate">
              {league?.leagueName || "Unnamed League"}
            </span>
            {league?.season && (
              <span className="text-[10px] font-mono text-slate-500 mt-0.5 truncate">
                Season {league.season}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teams",
    header: () => (
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Allocated Teams
      </span>
    ),
    cell: ({ row }) => {
      const teams: any[] = (row.original.teams || []).filter(Boolean);
      const visibleTeams = teams.slice(0, 5);
      const remaining = teams.length - visibleTeams.length;

      return (
        <div className="flex items-center gap-2.5 py-1">
          {/* Avatar stack */}
          {teams.length > 0 ? (
            <div className="flex items-center shrink-0">
              {visibleTeams.map((team, idx) => (
                <div
                  key={team._id || idx}
                  className="relative w-7 h-7 rounded-full border border-white bg-slate-100 overflow-hidden shrink-0 shadow-2xs"
                  style={{
                    marginLeft: idx === 0 ? 0 : -8,
                    zIndex: visibleTeams.length - idx,
                  }}
                  title={team?.teamName || "Team"}
                >
                  {team?.teamLogo ? (
                    <Image
                      src={formatImagePath(team.teamLogo)}
                      alt={team?.teamName || "team"}
                      width={28}
                      height={28}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                      {team?.shortName?.slice(0, 2) ||
                        team?.teamName?.slice(0, 2) ||
                        "T"}
                    </div>
                  )}
                </div>
              ))}
              {remaining > 0 && (
                <div
                  className="relative w-7 h-7 rounded-full border border-white bg-slate-800 text-white flex items-center justify-center shrink-0 text-[10px] font-mono font-medium"
                  style={{ marginLeft: -8, zIndex: 0 }}
                  title={`+${remaining} more teams`}
                >
                  +{remaining}
                </div>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">No teams assigned</span>
          )}

          {/* Count badge */}
          <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {teams.length} {teams.length === 1 ? "team" : "teams"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "season",
    header: () => (
      <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Season Period
      </span>
    ),
    cell: ({ row }) => {
      const league = row.original.league;
      const start = league?.startDate
        ? dayjs(league.startDate).format("DD MMM YYYY")
        : "—";
      const end = league?.endDate
        ? dayjs(league.endDate).format("DD MMM YYYY")
        : "—";

      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium whitespace-nowrap">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>
            {start} &ndash; {end}
          </span>
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => (
      <div className="text-right pr-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Actions
      </div>
    ),
    cell: ({ row }) => {
      const league = row.original.league;
      const teams = row.original.teams || [];

      return (
        <div className="flex items-center justify-end gap-1.5 pr-1">
          <button
            type="button"
            onClick={() => onView({ league, teams })}
            className="h-7 px-2.5 rounded-md text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="View participating teams"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Roster</span>
          </button>

          <button
            type="button"
            onClick={() => onDelete(league?._id)}
            className="h-7 w-7 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors inline-flex items-center justify-center cursor-pointer"
            title="Delete league entry"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
