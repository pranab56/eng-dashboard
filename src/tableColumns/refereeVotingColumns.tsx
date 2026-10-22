/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { Trophy, Shield } from "lucide-react";
import { TRefereeVoting } from "@/types/columnTypes";
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

export const getRefereeVotingColumns = (
  onViewResults: (item: TRefereeVoting) => void,
  onEdit: (item: TRefereeVoting) => void,
  onDelete: (id: string) => void
): ColumnDef<TRefereeVoting>[] => [
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
        <div className="flex flex-col min-w-[200px] py-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span
              className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                isWeek
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              }`}
            >
              {isWeek ? "Referee of the Week" : "Referee of the Month"}
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
          <span className="font-semibold text-xs text-slate-900 truncate">
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
        League
      </span>
    ),
    cell: ({ row }) => {
      const league = row.original.league;
      if (!league) {
        return <span className="text-xs text-slate-400">All Leagues</span>;
      }
      return (
        <div className="text-xs text-slate-700 truncate max-w-[140px]">
          {league.leagueName || "All Leagues"}
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
      const visible = nominees.slice(0, 3);
      const remaining = nominees.length - 3;

      return (
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-2 overflow-hidden">
            {visible.map((nom, i) => {
              const ref = nom.referee || {};
              return (
                <div
                  key={i}
                  title={`${ref.firstName || ""} ${ref.lastName || ""}`.trim() || "Referee"}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center"
                >
                  {ref.profile ? (
                    <img
                      src={formatImagePath(ref.profile)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Shield className="w-3 h-3 text-amber-700" />
                  )}
                </div>
              );
            })}
          </div>
          {remaining > 0 && (
            <span className="text-[10px] text-slate-500 font-medium">
              +{remaining} more
            </span>
          )}
          <span className="text-[11px] text-slate-400">
            ({nominees.length})
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalVotes",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Votes
      </span>
    ),
    cell: ({ row }) => {
      return (
        <span className="font-bold text-xs font-mono text-slate-800">
          {row.original.totalVotes || 0}
        </span>
      );
    },
  },
  {
    accessorKey: "winner",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Winner / Leader
      </span>
    ),
    cell: ({ row }) => {
      const { winner, status, nominees } = row.original;
      if (status === "completed" && winner) {
        const name = `${winner.firstName || ""} ${winner.lastName || ""}`.trim() || winner.userName || "Winner";
        return (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[120px]">{name}</span>
          </div>
        );
      }

      // If active, show current leading nominee
      if (nominees && nominees.length > 0) {
        const sorted = [...nominees].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
        const leader = sorted[0];
        if (leader && leader.votesCount > 0) {
          const lRef = leader.referee || {};
          const lName = `${lRef.firstName || ""} ${lRef.lastName || ""}`.trim() || lRef.userName || "Official";
          return (
            <div className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="font-medium truncate max-w-[110px]">{lName}</span>
              <span className="text-slate-400">({leader.votesCount})</span>
            </div>
          );
        }
      }

      return <span className="text-xs text-slate-400">-</span>;
    },
  },
  {
    accessorKey: "dates",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Active Period
      </span>
    ),
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      return (
        <div className="text-[11px] text-slate-500 font-mono">
          {dayjs(startDate).format("MMM D")} - {dayjs(endDate).format("MMM D, YYYY")}
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
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-right block">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const itemId = item._id || item.id || "";

      return (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onViewResults(item)}
            title="View Live Results"
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-[#800020] transition-colors"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(item)}
            title="Edit Poll"
            className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(itemId)}
            title="Delete Poll"
            className="p-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition-colors"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
