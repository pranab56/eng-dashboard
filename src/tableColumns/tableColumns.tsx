import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatImagePath } from "../utils/formatImagePath";
import { Pencil } from "lucide-react";

export const getTableColumns = (
  onEdit?: (standing: any) => void
): ColumnDef<any>[] => [
  {
    id: "rank",
    header: () => (
      <div className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1">
        Pos
      </div>
    ),
    cell: ({ row }) => {
      const pos = row.index + 1;
      let badgeStyle = "text-slate-500 font-medium";
      if (pos === 1) {
        badgeStyle = "bg-blue-50 text-blue-700 border border-blue-200 font-bold";
      } else if (pos <= 4) {
        badgeStyle = "bg-slate-100 text-slate-700 border border-slate-200 font-semibold";
      }

      return (
        <div className="flex items-center justify-center">
          <span
            className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono tabular-nums ${badgeStyle}`}
          >
            {pos}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "team",
    header: () => (
      <div className="text-left text-xs font-semibold text-slate-600 uppercase tracking-wider py-1">
        Club / Team
      </div>
    ),
    cell: ({ row }) => {
      const team = row.original.team;
      const isManual = row.original.isManual;
      return (
        <div className="flex items-center gap-3 py-0.5">
          {team?.teamLogo ? (
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden bg-white shrink-0 flex items-center justify-center">
              <Image
                src={formatImagePath(team.teamLogo)}
                alt={team?.teamName || "Club crest"}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-mono font-semibold text-slate-600 shrink-0">
              {team?.shortName?.slice(0, 3) || "FC"}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-900 text-sm truncate max-w-[200px] sm:max-w-xs">
                {team?.teamName || "Unnamed Team"}
              </span>
              {isManual && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
                  Manual Override
                </span>
              )}
            </div>
            {team?.shortName && (
              <span className="text-[11px] font-mono text-slate-400">
                {team.shortName}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "played",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Matches Played"
      >
        P
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs font-medium text-slate-800 tabular-nums">
        {row.getValue("played") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "win",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Matches Won"
      >
        W
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs text-slate-600 tabular-nums">
        {row.getValue("win") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "draw",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Matches Drawn"
      >
        D
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs text-slate-600 tabular-nums">
        {row.getValue("draw") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "loss",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Matches Lost"
      >
        L
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs text-slate-600 tabular-nums">
        {row.getValue("loss") ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalsFor",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Goals For (Scored)"
      >
        GF
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs text-slate-600 tabular-nums">
        {row.original.goalsFor ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalsAgainst",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Goals Against (Conceded)"
      >
        GA
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-xs text-slate-600 tabular-nums">
        {row.original.goalsAgainst ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalDifference",
    header: () => (
      <div
        className="text-center text-xs font-semibold text-slate-600 uppercase tracking-wider py-1"
        title="Goal Difference"
      >
        GD
      </div>
    ),
    cell: ({ row }) => {
      const gd = Number(row.getValue("goalDifference") ?? 0);
      const sign = gd > 0 ? `+${gd}` : gd;
      const colorClass =
        gd > 0
          ? "text-emerald-700 font-semibold"
          : gd < 0
          ? "text-rose-600 font-semibold"
          : "text-slate-400 font-normal";

      return (
        <div className={`text-center font-mono text-xs tabular-nums ${colorClass}`}>
          {sign}
        </div>
      );
    },
  },
  {
    accessorKey: "points",
    header: () => (
      <div
        className="text-center text-xs font-bold text-slate-900 uppercase tracking-wider py-1"
        title="Total Points"
      >
        PTS
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm font-bold text-slate-950 tabular-nums">
        {row.getValue("points") ?? 0}
      </div>
    ),
  },
  ...(onEdit
    ? [
        {
          id: "action",
          header: () => (
            <div className="text-right text-xs font-semibold text-slate-600 uppercase tracking-wider pr-3 py-1">
              Action
            </div>
          ),
          cell: ({ row }: any) => (
            <div className="flex items-center justify-end pr-1">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer shadow-2xs"
                title="Edit table standing"
              >
                <Pencil className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            </div>
          ),
        },
      ]
    : []),
];

export const tableColumns = getTableColumns();
