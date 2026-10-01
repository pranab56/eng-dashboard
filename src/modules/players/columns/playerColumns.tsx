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
    <div className="flex items-center gap-2.5 py-1">
      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center">
        {player.profile ? (
          <Image
            src={formatImagePath(player.profile)}
            alt={fullName}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[11px] font-semibold text-slate-500 uppercase select-none">
            {initials}
          </span>
        )}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-slate-900 text-xs sm:text-sm tracking-tight truncate">
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
          width={24}
          height={24}
          className="h-6 w-6 rounded-full border border-slate-200 object-cover shrink-0"
        />
      ) : (
        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-slate-400">
          <Shield className="w-3 h-3" />
        </div>
      )}
      <div className="flex items-baseline gap-1 min-w-0">
        <span className="font-medium text-slate-800 text-xs truncate">{teamName}</span>
        {player.shortName && (
          <span className="hidden md:inline text-[11px] text-slate-400 shrink-0">({player.shortName})</span>
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
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer disabled:cursor-default"
      title="Click to adjust coins"
    >
      <Coins className="w-3 h-3 text-slate-500" />
      <span className="tabular-nums font-semibold">{coins.toLocaleString()}</span>
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
    <div className="flex items-center justify-end gap-1 pr-2">
      {/* Quick View Button */}
      <button
        type="button"
        onClick={() => onView(player)}
        className="flex items-center justify-center h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        title="View Full Profile"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      {/* Unified Professional Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center justify-center h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer focus:outline-none"
            title="Player Actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1 bg-white rounded-md shadow-md border border-slate-200 text-xs">
          <DropdownMenuItem
            onClick={() => onView(player)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>View Profile</span>
          </DropdownMenuItem>

          {onEdit && (
            <DropdownMenuItem
              onClick={() => onEdit(player)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </DropdownMenuItem>
          )}

          {onEditStats && (
            <DropdownMenuItem
              onClick={() => onEditStats(player)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span>Modify Stats</span>
            </DropdownMenuItem>
          )}

          {onAdjustCoins && (
            <DropdownMenuItem
              onClick={() => onAdjustCoins(player)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded text-slate-700 hover:bg-slate-100 font-medium cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5 text-slate-500" />
              <span>Adjust Coins</span>
            </DropdownMenuItem>
          )}

          {onDelete && (
            <>
              <DropdownMenuSeparator className="my-1 bg-slate-100" />
              <DropdownMenuItem
                onClick={() => onDelete(player)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
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
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-700 border border-slate-200">
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
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            Free Plan
          </span>
        );
      }
      const pkgName = rawSub.packageName || rawSub.package?.title || rawSub.package?.packageName || rawSub.package?.name || 'Active Plan';
      const pkgPrice = rawSub.price ?? rawSub.package?.price ?? 0;
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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
          className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
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
    header: () => <div className="text-right pr-4 font-semibold text-xs text-slate-600">Actions</div>,
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
