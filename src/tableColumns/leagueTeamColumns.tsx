import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { FiEye, FiTrash2 } from "react-icons/fi";
import { baseURL } from '../utils/BaseURL';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

// Row shape: { league: {...}, teams: [...] }
export const getLeagueTeamColumns = (
  onView: (data: { league: any; teams: any[] }) => void,
  onDelete: (leagueId: string) => void
): ColumnDef<any>[] => [
    {
      accessorKey: "leagueName",
      header: () => <div>League</div>,
      cell: ({ row }) => {
        const league = row.original.league;
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 leading-tight">
                {league?.leagueName || "N/A"}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {league?.season || ""}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "teams",
      header: () => <div>Teams</div>,
      cell: ({ row }) => {
        const teams: any[] = row.original.teams || [];
        const visibleTeams = teams.slice(0, 5);
        const remaining = teams.length - visibleTeams.length;

        return (
          <div className="flex items-center gap-2">
            {/* Avatar stack */}
            <div className="flex items-center">
              {visibleTeams.map((team, idx) => (
                <div
                  key={team._id}
                  className="relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex-shrink-0"
                  style={{ marginLeft: idx === 0 ? 0 : -10, zIndex: visibleTeams.length - idx }}
                  title={team.teamName}
                >
                  {team.teamLogo ? (
                    <Image
                      src={baseURL + team.teamLogo}
                      alt={team.teamName || "team"}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-[9px] font-black text-slate-500">
                      {team.shortName?.slice(0, 2) || "?"}
                    </div>
                  )}
                </div>
              ))}
              {remaining > 0 && (
                <div
                  className="relative w-8 h-8 rounded-full border-2 border-white bg-slate-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                  style={{ marginLeft: -10 }}
                >
                  +{remaining}
                </div>
              )}
            </div>

            {/* Count badge */}
            <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
              {teams.length} {teams.length === 1 ? "Team" : "Teams"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "season",
      header: () => <div>Season Dates</div>,
      cell: ({ row }) => {
        const league = row.original.league;
        const start = league?.startDate
          ? dayjs(league.startDate).format("DD MMM YYYY")
          : "N/A";
        const end = league?.endDate
          ? dayjs(league.endDate).format("DD MMM YYYY")
          : "N/A";
        return (
          <div className="text-sm">
            <div className="font-semibold text-gray-800">{start}</div>
            <div className="text-xs text-gray-400">to {end}</div>
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div>Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView({ league: row.original.league, teams: row.original.teams })}
            className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
            title="View Teams in League"
          >
            <FiEye className="size-5 text-gray-800" />
          </button>
          <button
            onClick={() => onDelete(row.original.league._id)}
            className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
            title="Delete League Entry"
          >
            <FiTrash2 className="size-5 text-gray-800 hover:text-red-600" />
          </button>
        </div>
      ),
    },
  ];
