import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit2, FiEye } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { TPlayer } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";

// ============================================================================
// Helpers & Utilities
// ============================================================================

const getPlayerCoinBalance = (player: TPlayer): number => {
  return player.engCoine ?? player.engCoin ?? player.coin ?? 0;
};

const getPlayerFullName = (player: TPlayer): string => {
  const fullName = `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim();
  return fullName || "Unnamed Player";
};

// ============================================================================
// Modular UI Sub-Components (Player Domain)
// ============================================================================

export const PlayerNameCell: React.FC<{ player: TPlayer }> = ({ player }) => {
  const fullName = getPlayerFullName(player);
  const initials = `${player.firstName?.[0] ?? "P"}${player.lastName?.[0] ?? ""}`;

  return (
    <div className="flex items-center gap-2 sm:gap-3.5 py-0.5 max-w-[160px] sm:max-w-none">
      <div className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-slate-100 flex items-center justify-center shadow-xs">
        {player.profile ? (
          <Image
            src={formatImagePath(player.profile)}
            alt={`${fullName}'s profile picture`}
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider select-none">
            {initials}
          </span>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-slate-900 text-xs sm:text-sm tracking-tight truncate group-hover:text-blue-600 transition-colors">
          {fullName}
        </span>
        <span className="text-[11px] text-slate-400 truncate">
          {player.email || (player.role ? player.role.replace(/_/g, ' ') : "Player")}
        </span>
      </div>
    </div>
  );
};

export const PlayerTeamCell: React.FC<{ player: TPlayer }> = ({ player }) => {
  const teamName = player.teamName || "Unassigned";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5 py-0.5 max-w-[120px] sm:max-w-none">
      {player.teamLogo ? (
        <Image
          src={formatImagePath(player.teamLogo)}
          alt={`${teamName} logo`}
          width={28}
          height={28}
          className="h-6 w-6 sm:h-7 sm:w-7 rounded-full border border-slate-200/80 object-cover shrink-0"
        />
      ) : (
        <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-slate-100 border border-slate-200/60 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
          ⚽
        </div>
      )}
      <div className="flex items-baseline gap-1 min-w-0">
        <span className="font-medium text-slate-800 text-xs sm:text-sm truncate">{teamName}</span>
        {player.shortName && (
          <span className="hidden md:inline text-xs font-normal text-slate-400 shrink-0">({player.shortName})</span>
        )}
      </div>
    </div>
  );
};

export const PlayerCoinButton: React.FC<{
  player: TPlayer;
  onEditCoin?: (player: TPlayer) => void;
}> = ({ player, onEditCoin }) => {
  const coins = getPlayerCoinBalance(player);
  const isEditable = Boolean(onEditCoin);

  return (
    <button
      type="button"
      disabled={!isEditable}
      onClick={() => onEditCoin?.(player)}
      aria-label={`Update coin balance for ${getPlayerFullName(player)}. Current balance: ${coins.toLocaleString()}`}
      className={`group inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg border transition-all duration-150 text-[11px] sm:text-xs font-semibold ${
        isEditable
          ? "bg-amber-50/80 hover:bg-amber-100/90 border-amber-200/80 hover:border-amber-300 text-amber-950 shadow-2xs cursor-pointer active:scale-95"
          : "bg-slate-50 border-slate-200/60 text-slate-600 cursor-default"
      }`}
      title={isEditable ? "Click to update coin balance" : undefined}
    >
      <span className="text-xs sm:text-sm transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
        🪙
      </span>
      <span className="tabular-nums font-semibold tracking-tight">{coins.toLocaleString()}</span>
      {isEditable && (
        <FiEdit2
          className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-600/70 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export const PlayerActionCell: React.FC<{
  player: TPlayer;
  onView: (player: TPlayer) => void;
  onEdit?: (player: TPlayer) => void;
  onDelete?: (player: TPlayer) => void;
}> = ({ player, onView, onEdit, onDelete }) => {
  const fullName = getPlayerFullName(player);

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <button
        type="button"
        onClick={() => onView(player)}
        aria-label={`View details for ${fullName}`}
        title="View Player"
        className="flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-lg bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-95"
      >
        <FiEye className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" aria-hidden="true" />
      </button>

      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(player)}
          aria-label={`Edit ${fullName}`}
          title="Edit Player"
          className="flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-95"
        >
          <FiEdit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(player)}
          aria-label={`Delete ${fullName}`}
          title="Delete Player"
          className="flex h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 active:scale-95"
        >
          <HiOutlineTrash className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// Column Definitions
// ============================================================================

export const getPlayerColumns = (
  onView: (player: TPlayer) => void,
  onEditCoin?: (player: TPlayer) => void,
  onEdit?: (player: TPlayer) => void,
  onDelete?: (player: TPlayer) => void
): ColumnDef<TPlayer>[] => [
  {
    id: "name",
    header: "Player Name",
    accessorFn: (row) => `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim(),
    cell: ({ row }) => <PlayerNameCell player={row.original} />,
  },
  {
    id: "role",
    header: "Player Type",
    accessorKey: "role",
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
        {row.original.role ? row.original.role.replace(/_/g, " ") : "PLAYER"}
      </span>
    ),
  },
  {
    id: "team",
    header: "Team",
    accessorKey: "teamName",
    cell: ({ row }) => <PlayerTeamCell player={row.original} />,
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100/90 text-slate-700 border border-slate-200/50">
        {row.original.position || "Undesignated"}
      </span>
    ),
  },
  {
    id: "subscription",
    header: "Subscription",
    cell: ({ row }) => {
      const rawSub = (row.original as any).subscription || (row.original as any).activeSubscription;
      if (!rawSub) {
        return (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Free Plan
          </span>
        );
      }
      const pkgName = rawSub.packageName || rawSub.package?.title || rawSub.package?.packageName || rawSub.package?.name || 'Active Plan';
      const pkgPrice = rawSub.price ?? rawSub.package?.price ?? 0;
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          {pkgName} • £{pkgPrice}
        </span>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = (row.original.status || "APPROVED").toUpperCase();
      const isApproved = status === "APPROVED";
      return (
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${
              isApproved
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : status === "REJECTED"
                ? "text-rose-700 bg-rose-50 border-rose-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            }`}
          >
            {status}
          </span>
          {status === "REJECTED" && (row.original as any).rejectionReason && (
            <span className="text-[10px] text-rose-600 font-medium truncate max-w-[120px]" title={(row.original as any).rejectionReason}>
              Reason: {(row.original as any).rejectionReason}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "coins",
    header: "Coin Balance",
    accessorFn: (row) => getPlayerCoinBalance(row),
    cell: ({ row }) => <PlayerCoinButton player={row.original} onEditCoin={onEditCoin} />,
  },
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <PlayerActionCell
        player={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ),
  },
];
