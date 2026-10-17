/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { Award } from "lucide-react";
import { TPlayerVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getStatusBadge = (status: string) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          Active
        </span>
      );
    case "upcoming":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          Scheduled
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Closed
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
          {status}
        </span>
      );
  }
};

export const getPlayerVotingColumns = (
  onViewResults: (item: TPlayerVoting) => void,
  onEdit: (item: TPlayerVoting) => void,
  onDelete: (id: string) => void
): ColumnDef<TPlayerVoting>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Campaign Details
      </span>
    ),
    cell: ({ row }) => {
      const { title, votingType, weekNumber, month } = row.original;
      const isWeek = votingType === "WEEK";

      return (
        <div className="flex flex-col min-w-[220px] py-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                isWeek
                  ? "bg-slate-100 text-slate-700 border border-slate-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              {isWeek ? "Player of the Week" : "Player of the Month"}
            </span>
            {weekNumber ? (
              <span className="text-[10px] font-mono text-slate-500">
                Wk {weekNumber}
              </span>
            ) : null}
            {month ? (
              <span className="text-[10px] font-mono text-slate-500">
                {month}
              </span>
            ) : null}
          </div>
          <span className="font-medium text-slate-900 text-xs mt-1 leading-snug">
            {title}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "league",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Competition & Division
      </span>
    ),
    cell: ({ row }) => {
      const { league, ageGroup } = row.original;
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800 leading-tight">
            {league?.leagueName || "League"}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-block px-1.5 py-0.2 text-[10px] font-mono font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
              {ageGroup}
            </span>
            {league?.season && (
              <span className="text-[10px] text-slate-400 font-mono">
                {league.season}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "nominees",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Nominees
      </span>
    ),
    cell: ({ row }) => {
      const nominees = row.original.nominees || [];
      return (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {nominees.slice(0, 3).map((n, i) => {
              const profileImg = formatImagePath(n.player?.profile);
              const name = n.player
                ? `${n.player.firstName || ""} ${n.player.lastName || ""}`.trim() || "Player"
                : "Player";
              return (
                <div
                  key={i}
                  title={name}
                  className="w-6 h-6 rounded-full border border-white bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-[9px] font-semibold text-slate-600"
                >
                  {profileImg ? (
                    <img
                      src={profileImg}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    name.slice(0, 2).toUpperCase()
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-slate-600 font-medium">
            {nominees.length} {nominees.length === 1 ? "player" : "players"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "timeframe",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Schedule
      </span>
    ),
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      const startStr = startDate ? dayjs(startDate).format("MMM D") : "";
      const endStr = endDate ? dayjs(endDate).format("MMM D, YYYY") : "";
      return (
        <div className="text-xs text-slate-600 whitespace-nowrap font-mono text-[11px]">
          <span>{startStr}</span>
          <span className="text-slate-400 mx-1">→</span>
          <span>{endStr}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "votes",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Votes & Winner
      </span>
    ),
    cell: ({ row }) => {
      const { totalVotes, winner, nominees } = row.original;
      let leaderInfo = "";
      let isWinner = false;

      if (winner) {
        const wName = typeof winner === "object"
          ? `${winner.firstName || ""} ${winner.lastName || ""}`.trim()
          : "Winner";
        leaderInfo = `Winner: ${wName}`;
        isWinner = true;
      } else if (nominees && nominees.length > 0) {
        const sorted = [...nominees].sort(
          (a, b) => (b.votesCount || 0) - (a.votesCount || 0)
        );
        if (sorted[0]?.votesCount > 0) {
          const topP = sorted[0].player;
          const pName = `${topP?.firstName || ""} ${topP?.lastName || ""}`.trim();
          leaderInfo = `Leader: ${pName}`;
        }
      }

      return (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-900 tabular-nums">
            {(totalVotes || 0).toLocaleString()}{" "}
            <span className="font-normal text-slate-500 text-[11px]">votes</span>
          </span>
          {leaderInfo && (
            <span
              className={`text-[11px] truncate max-w-[150px] mt-0.5 inline-flex items-center gap-1 ${
                isWinner ? "text-amber-800 font-medium" : "text-slate-500"
              }`}
            >
              {isWinner && <Award className="w-3 h-3 text-amber-600 shrink-0" />}
              {leaderInfo}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Status
      </span>
    ),
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    id: "actions",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-right block pr-2">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1 pr-2">
          <button
            type="button"
            onClick={() => onViewResults(item)}
            className="w-7 h-7 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="View Standings & Live Results"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Campaign"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="w-7 h-7 rounded border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete Campaign"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
