import { formatImagePath } from "@/utils/formatImagePath";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { Coins, Shield } from "lucide-react";

export const getTeamColumns = (
  onView: (team: any) => void,
  onDelete: (id: string) => void,
  onEditCoin?: (team: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "teamName",
    header: () => <div>Team Identity</div>,
    cell: ({ row }) => {
      const logoUrl = formatImagePath(row.original.teamLogo);
      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="logo"
                fill
                className="object-contain p-1"
              />
            ) : (
              <Shield className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="flex flex-col min-w-0 max-w-[280px]">
            <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
              {row.original.teamName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {row.original.stadiumName || "Stadium Not Set"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "shortName",
    header: () => <div>Code</div>,
    cell: ({ row }) => (
      <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block font-mono">
        {row.getValue("shortName") || "N/A"}
      </span>
    ),
  },
  {
    accessorKey: "totalMembers",
    header: () => <div>Squad</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {row.getValue("totalMembers") || 0}
        </span>
        <span className="text-slate-400">Players</span>
      </div>
    ),
  },
  {
    accessorKey: "managers",
    header: () => <div>Manager</div>,
    cell: ({ row }) => {
      const manager = row.original.managers;
      if (!manager) {
        return (
          <span className="text-xs text-slate-400 italic">Unassigned</span>
        );
      }
      const profileUrl = formatImagePath(manager.profile);
      const name = `${manager.firstName || ""} ${manager.lastName || ""}`.trim() || manager.userName || "Manager";

      return (
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-[10px] text-slate-600 font-semibold">
            {profileUrl ? (
              <Image src={profileUrl} alt="manager" fill className="object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
            {name}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: () => <div>Location</div>,
    cell: ({ row }) => (
      <div className="flex flex-col text-xs">
        <span className="font-medium text-slate-800 dark:text-slate-200">
          {row.original.city || "N/A"}
        </span>
        <span className="text-[11px] text-slate-400 uppercase tracking-wider">
          {row.original.country || ""}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "coin",
    header: () => <div>Coin Budget</div>,
    cell: ({ row }) => (
      <button
        type="button"
        onClick={() => onEditCoin?.(row.original)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60 transition-colors cursor-pointer text-xs group"
        title="Click to update coin budget"
      >
        <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="font-medium text-amber-900 dark:text-amber-200">
          {(row.original.coin ?? 0).toLocaleString()}
        </span>
        <FiEdit2 className="w-3 h-3 text-amber-600 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
      </button>
    ),
  },
  {
    id: "action",
    header: () => <div className="text-right pr-2">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 pr-2">
        <button
          onClick={() => onView(row.original)}
          className="h-8 w-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="View Details"
        >
          <FiEye className="w-3.5 h-3.5" />
        </button>
        <Link href={`/team-management/add-team?id=${row.original._id}`}>
          <button
            className="h-8 w-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Team"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="h-8 w-8 rounded border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
          title="Delete Team"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];
