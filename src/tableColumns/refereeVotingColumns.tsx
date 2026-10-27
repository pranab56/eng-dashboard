/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit2, Trash2, Trophy, User } from "lucide-react";
import { TRefereeVoting } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getStatusBadge = (status: string) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "active":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        Campaign
      </span>
    ),
    cell: ({ row }) => {
      const { title, votingType, weekNumber, month } = row.original;
      const isWeek = votingType === "WEEK";

      return (
        <div className="flex flex-col min-w-[200px] py-0.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
              {isWeek ? "Week Round" : "Month Round"}
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
          <span className="font-medium text-xs text-slate-900 truncate">
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
        <div className="text-xs text-slate-700 truncate max-w-[150px]">
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
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {visible.map((nom, i) => {
              const ref = nom.referee || {};
              const name = `${ref.firstName || ""} ${ref.lastName || ""}`.trim() || ref.userName || "Referee";
              return (
                <div
                  key={i}
                  title={name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center text-slate-400"
                >
                  {ref.profile ? (
                    <img
                      src={formatImagePath(ref.profile)}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {nominees.length} {nominees.length === 1 ? "official" : "officials"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalVotes",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Total Votes
      </span>
    ),
    cell: ({ row }) => {
      return (
        <span className="font-mono text-xs font-semibold text-slate-900">
          {Number(row.original.totalVotes || 0).toLocaleString()}
        </span>
      );
    },
  },
  {
    accessorKey: "winner",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Leader / Winner
      </span>
    ),
    cell: ({ row }) => {
      const { winner, status, nominees } = row.original;
      if (status === "completed" && winner) {
        const name = `${winner.firstName || ""} ${winner.lastName || ""}`.trim() || winner.userName || "Winner";
        return (
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-900">
            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate max-w-[130px]">{name}</span>
          </div>
        );
      }

      if (nominees && nominees.length > 0) {
        const sorted = [...nominees].sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
        const leader = sorted[0];
        if (leader && leader.votesCount > 0) {
          const lRef = leader.referee || {};
          const lName = `${lRef.firstName || ""} ${lRef.lastName || ""}`.trim() || lRef.userName || "Official";
          return (
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <span className="truncate max-w-[120px]">{lName}</span>
              <span className="text-slate-400 font-mono text-[11px]">({leader.votesCount})</span>
            </div>
          );
        }
      }

      return <span className="text-xs text-slate-400">—</span>;
    },
  },
  {
    accessorKey: "dates",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Schedule
      </span>
    ),
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      return (
        <div className="text-xs text-slate-600 font-mono">
          {dayjs(startDate).format("DD MMM")} – {dayjs(endDate).format("DD MMM YYYY")}
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
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onViewResults(item)}
            title="View Live Standings"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Edit Poll"
            className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(itemId)}
            title="Delete Poll"
            className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
