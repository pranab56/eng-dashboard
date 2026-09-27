import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatImagePath } from "../utils/formatImagePath";
import { Pencil } from "lucide-react";

export const getTableColumns = (
  onEdit?: (standing: any) => void
): ColumnDef<any>[] => [
  {
    id: "rank",
    header: () => <div className="text-center font-bold">#</div>,
    cell: ({ row }) => {
      const position = row.original.position || row.index + 1;
      const movement = row.original.movement;
      return (
        <div className="flex items-center justify-center gap-1 font-bold text-slate-700">
          <span>{position}</span>
          {movement === "UP" && (
            <span className="text-[10px] text-emerald-500 font-bold" title="Moved up">▲</span>
          )}
          {movement === "DOWN" && (
            <span className="text-[10px] text-rose-500 font-bold" title="Moved down">▼</span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "team",
    header: () => <div className="font-bold">Team</div>,
    cell: ({ row }) => {
      const team = row.original.team;
      const isManual = row.original.isManual;
      return (
        <div className="flex items-center gap-3">
          {team?.teamLogo ? (
            <Image
              src={formatImagePath(team.teamLogo)}
              alt="logo"
              width={100}
              height={100}
              className="w-9 h-9 rounded-full border border-gray-200 object-cover shadow-2xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-semibold text-slate-500">
              No Logo
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-900 leading-tight">
                {team?.teamName || "Unknown Team"}
              </span>
              {isManual && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Edited
                </span>
              )}
            </div>
            {team?.shortName && (
              <span className="text-[11px] text-gray-400 font-medium tracking-wide">
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
    header: () => <div className="text-center font-bold">P</div>,
    cell: ({ row }) => (
      <div className="text-center font-semibold text-gray-800">
        {row.getValue("played")}
      </div>
    ),
  },
  {
    accessorKey: "win",
    header: () => <div className="text-center font-bold">W</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-emerald-700">
        {row.getValue("win")}
      </div>
    ),
  },
  {
    accessorKey: "draw",
    header: () => <div className="text-center font-bold">D</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-600">
        {row.getValue("draw")}
      </div>
    ),
  },
  {
    accessorKey: "loss",
    header: () => <div className="text-center font-bold">L</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-rose-600">
        {row.getValue("loss")}
      </div>
    ),
  },
  {
    accessorKey: "goalsFor",
    header: () => <div className="text-center font-bold">GF</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600 font-medium">
        {row.original.goalsFor ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalsAgainst",
    header: () => <div className="text-center font-bold">GA</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600 font-medium">
        {row.original.goalsAgainst ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalDifference",
    header: () => <div className="text-center font-bold">GD</div>,
    cell: ({ row }) => {
      const gd = Number(row.getValue("goalDifference") ?? 0);
      return (
        <div
          className={`text-center font-semibold ${
            gd > 0 ? "text-emerald-600" : gd < 0 ? "text-rose-600" : "text-gray-500"
          }`}
        >
          {gd > 0 ? `+${gd}` : gd}
        </div>
      );
    },
  },
  {
    accessorKey: "points",
    header: () => <div className="text-center font-bold">PTS</div>,
    cell: ({ row }) => (
      <div className="text-center font-bold text-gray-900 bg-slate-100/80 rounded-md py-1 px-2 mx-auto w-fit min-w-[32px]">
        {row.getValue("points")}
      </div>
    ),
  },
  ...(onEdit
    ? [
        {
          id: "actions",
          header: () => <div className="text-right font-bold pr-3">Action</div>,
          cell: ({ row }: any) => (
            <div className="flex items-center justify-end pr-1">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Edit team standing"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          ),
        },
      ]
    : []),
];

export const tableColumns = getTableColumns();
