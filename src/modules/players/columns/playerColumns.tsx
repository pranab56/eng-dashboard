import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { TPlayer } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Activity,
  Coins,
  Shield,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPlayerCoinBalance = (player: TPlayer): number => {
  return (player as any).engCoine ?? (player as any).engCoin ?? (player as any).coin ?? 0;
};

const getPlayerFullName = (player: TPlayer): string => {
  const fullName = `${player.firstName ?? ""} ${player.lastName ?? ""}`.trim();
  return fullName || (player as any).userName || "Unnamed Player";
};

export const PlayerNameCell: React.FC<{ player: TPlayer }> = ({ player }) => {
  const fullName = getPlayerFullName(player);
  const initials = `${player.firstName?.[0] ?? "P"}${player.lastName?.[0] ?? ""}`;

  return (
    <div className="flex items-center gap-3 py-1">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
        {player.profile ? (
          <Image
            src={formatImagePath(player.profile)}
            alt={fullName}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-slate-500 uppercase select-none">
            {initials}
          </span>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
          {fullName}
        </span>
        <span className="text-[11px] text-slate-400 truncate">
          {player.email || ((player as any).role ? (player as any).role.replace(/_/g, ' ') : "Player")}
        </span>
      </div>
    </div>
  );
};

export const PlayerTeamCell: React.FC<{ player: TPlayer }> = ({ player }) => {
  const teamName = player.teamName || "Unassigned";

  return (
    <div className="flex items-center gap-2 py-1">
      {player.teamLogo ? (
        <Image
          src={formatImagePath(player.teamLogo)}
          alt={teamName}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full border border-slate-200 object-cover shrink-0"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-400">
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
      className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
      title="Click to adjust coins"
    >
      <span className="text-sm">🪙</span>
      <span className="tabular-nums">{coins.toLocaleString()}</span>
    </button>
  );
};

export const PlayerActionCell: React.FC<{
  player: TPlayer;
  onView: (player: TPlayer) => void;
  onEdit?: (player: TPlayer) => void;
  onDelete?: (player: TPlayer) => void;
  onEditStats?: (player: TPlayer) => void;
  onAdjustCoins?: (player: TPlayer) => void;
}> = ({ player, onView, onEdit, onDelete, onEditStats, onAdjustCoins }) => {
  return (
    <div className="flex items-center justify-end gap-1.5 pr-2">
      {/* Quick View Button */}
      <button
        type="button"
        onClick={() => onView(player)}
        className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
        title="View Full Profile"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Unified Professional Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs focus:outline-none"
            title="Player Actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 p-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 text-xs">
          <DropdownMenuItem
            onClick={() => onView(player)}
            className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 font-semibold cursor-pointer"
          >
            <User className="w-4 h-4 text-indigo-600" />
            <span>View 360° Profile</span>
          </DropdownMenuItem>

          {onEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(player)}
              className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Edit Player Details</span>
            </DropdownMenuItem>
          )}

          {onEditStats && (
            <DropdownMenuItem
              onClick={() => onEditStats(player)}
              className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer"
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Modify Career Stats</span>
            </DropdownMenuItem>
          )}

          {onAdjustCoins && (
            <DropdownMenuItem
              onClick={() => onAdjustCoins(player)}
              className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-amber-700 hover:bg-amber-50 font-semibold cursor-pointer"
            >
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Adjust ENG Coins (+/-)</span>
            </DropdownMenuItem>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(player)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Player</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const getPlayerColumns = (
  onView: (player: TPlayer) => void,
  onEditCoin?: (player: TPlayer) => void,
  onEdit?: (player: TPlayer) => void,
  onDelete?: (player: TPlayer) => void,
  onEditStats?: (player: TPlayer) => void
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
        {(row.original as any).role ? (row.original as any).role.replace(/_/g, " ") : "PLAYER"}
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
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
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
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
      const status = ((row.original as any).status || "APPROVED").toUpperCase();
      const isApproved = status === "APPROVED";
      return (
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full border w-fit ${
            isApproved
              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
              : status === "REJECTED"
              ? "text-rose-700 bg-rose-50 border-rose-200"
              : "text-amber-700 bg-amber-50 border-amber-200"
          }`}
        >
          {status}
        </span>
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
    header: () => <div className="text-right pr-4 font-bold text-xs text-slate-700">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => (
      <PlayerActionCell
        player={row.original}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
        onEditStats={onEditStats}
        onAdjustCoins={onEditCoin}
      />
    ),
  },
];
