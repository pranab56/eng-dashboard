/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { Coins, CheckCircle, Clock, ShieldCheck, AlertCircle } from "lucide-react";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getStatusBadge = (status: string, isSettled: boolean) => {
  if (isSettled || status === "settled") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
        Settled
      </span>
    );
  }

  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          Active
        </span>
      );
    case "locked":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600 shrink-0" />
          Locked
        </span>
      );
    case "upcoming":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-700 border border-sky-200">
          Upcoming
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

export const getScorePredictionColumns = (
  onViewLeaderboard: (item: any) => void,
  onSettle: (item: any) => void,
  onEdit: (item: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Prediction Round
      </span>
    ),
    cell: ({ row }) => {
      const { title, league, matches = [] } = row.original;
      const count = Array.isArray(matches) ? matches.length : 0;

      return (
        <div className="flex flex-col min-w-[220px] py-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              {league?.leagueName || "League Fixtures"}
            </span>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
              {count} {count === 1 ? "Match" : "Matches"}
            </span>
          </div>
          <span className="font-medium text-slate-900 text-xs mt-1.5 leading-snug">
            {title}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "fixtures",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Selected Fixtures
      </span>
    ),
    cell: ({ row }) => {
      const { matches = [] } = row.original;
      if (!Array.isArray(matches) || matches.length === 0) {
        return <span className="text-xs text-slate-400">No matches selected</span>;
      }

      return (
        <div className="flex items-center gap-1.5 py-1">
          {matches.slice(0, 5).map((m: any, idx: number) => {
            const hTeam = m?.homeTeam;
            const aTeam = m?.awayTeam;
            const hLogo = formatImagePath(hTeam?.teamLogo);
            const aLogo = formatImagePath(aTeam?.teamLogo);

            return (
              <div
                key={m?._id || idx}
                className="flex items-center gap-0.5 p-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-semibold text-slate-700"
                title={`${hTeam?.shortName || hTeam?.teamName || "Home"} vs ${aTeam?.shortName || aTeam?.teamName || "Away"}`}
              >
                <div className="w-4 h-4 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {hLogo ? (
                    <img src={hLogo} alt="Home" className="w-full h-full object-cover" />
                  ) : (
                    (hTeam?.shortName || "H").slice(0, 1)
                  )}
                </div>
                <span className="text-slate-400 text-[8px]">v</span>
                <div className="w-4 h-4 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {aLogo ? (
                    <img src={aLogo} alt="Away" className="w-full h-full object-cover" />
                  ) : (
                    (aTeam?.shortName || "A").slice(0, 1)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "rewards",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Coin Rewards
      </span>
    ),
    cell: ({ row }) => {
      const { coinsPerExactScore = 50, coinsPerCorrectOutcome = 10, jackpotBonusCoins = 500 } =
        row.original;

      return (
        <div className="flex flex-col gap-0.5">
          <div className="inline-flex items-center gap-1 font-semibold text-xs text-amber-700 font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-600" />
            <span>+{coinsPerExactScore} / exact</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            +{coinsPerCorrectOutcome} outcome ? +{jackpotBonusCoins} jackpot
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "lockTime",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Lock Deadline
      </span>
    ),
    cell: ({ row }) => {
      const { lockTime } = row.original;
      const isPast = lockTime ? new Date(lockTime) <= new Date() : false;
      const formatted = lockTime ? dayjs(lockTime).format("DD MMM, HH:mm") : "N/A";

      return (
        <div className="flex flex-col text-xs">
          <span className={`font-mono text-[11px] ${isPast ? "text-slate-400" : "text-slate-900 font-medium"}`}>
            {formatted}
          </span>
          <span className="text-[10px] text-slate-400">
            {isPast ? "Deadline passed" : "Kick-off lock"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "participants",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-center block">
        Predictions
      </span>
    ),
    cell: ({ row }) => {
      const { totalParticipants = 0, totalCoinsDistributed = 0 } = row.original;
      return (
        <div className="text-center py-1">
          <span className="font-semibold text-xs text-slate-900 block font-mono">
            {totalParticipants}
          </span>
          <span className="text-[10px] text-amber-700 block font-mono font-medium">
            {totalCoinsDistributed > 0 ? `+${totalCoinsDistributed} coins paid` : "0 paid"}
          </span>
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
    cell: ({ row }) => {
      return getStatusBadge(row.original.status, row.original.isSettled);
    },
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
      const isSettled = Boolean(item.isSettled);

      return (
        <div className="flex items-center justify-end gap-1 pr-1">
          {/* Settle Round Button */}
          {!isSettled && (
            <button
              type="button"
              onClick={() => onSettle(item)}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer shadow-2xs"
              title="Calculate Results & Distribute Coins"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Settle</span>
            </button>
          )}

          {/* View Leaderboard */}
          <button
            type="button"
            onClick={() => onViewLeaderboard(item)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="View User Predictions & Leaderboard"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>

          {/* Edit Round */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Edit Round"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>

          {/* Delete Round */}
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Delete Round"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
