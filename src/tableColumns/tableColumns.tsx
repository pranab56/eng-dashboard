import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { formatImagePath } from "../utils/formatImagePath";
import { Edit3 } from "lucide-react";

export const getTableColumns = (
  onEdit?: (standing: any) => void
): ColumnDef<any>[] => [
  {
    id: "rank",
    header: () => <div className="text-center font-semibold">#</div>,
    cell: ({ row }) => (
      <div className="text-center font-semibold text-gray-700">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "team",
    header: () => <div className="font-semibold">Team</div>,
    cell: ({ row }) => {
      const team = row.original.team;
      const isManual = row.original.isManual;
      return (
        <div className="flex items-center gap-2.5">
          {team?.teamLogo ? (
            <Image
              src={formatImagePath(team.teamLogo)}
              alt="logo"
              width={36}
              height={36}
              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-500">
              {team?.shortName || "FC"}
            </div>
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-gray-900 leading-tight">
                {team?.teamName || "Team"}
              </span>
              {isManual && (
                <span className="text-[10px] text-gray-400 font-normal">
                  (Manual)
                </span>
              )}
            </div>
            {team?.shortName && (
              <span className="text-[11px] text-gray-400">
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
    header: () => <div className="text-center font-semibold">P</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-800">
        {row.getValue("played")}
      </div>
    ),
  },
  {
    accessorKey: "win",
    header: () => <div className="text-center font-semibold">W</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600">
        {row.getValue("win")}
      </div>
    ),
  },
  {
    accessorKey: "draw",
    header: () => <div className="text-center font-semibold">D</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600">
        {row.getValue("draw")}
      </div>
    ),
  },
  {
    accessorKey: "loss",
    header: () => <div className="text-center font-semibold">L</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600">
        {row.getValue("loss")}
      </div>
    ),
  },
  {
    accessorKey: "goalsFor",
    header: () => <div className="text-center font-semibold">GF</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600">
        {row.original.goalsFor ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalsAgainst",
    header: () => <div className="text-center font-semibold">GA</div>,
    cell: ({ row }) => (
      <div className="text-center text-gray-600">
        {row.original.goalsAgainst ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "goalDifference",
    header: () => <div className="text-center font-semibold">GD</div>,
    cell: ({ row }) => {
      const gd = Number(row.getValue("goalDifference") ?? 0);
      return (
        <div
          className={`text-center font-medium ${
            gd > 0 ? "text-emerald-600" : gd < 0 ? "text-red-600" : "text-gray-500"
          }`}
        >
          {gd > 0 ? `+${gd}` : gd}
        </div>
      );
    },
  },
  {
    accessorKey: "points",
    header: () => <div className="text-center font-semibold">PTS</div>,
    cell: ({ row }) => (
      <div className="text-center font-bold text-gray-900">
        {row.getValue("points")}
      </div>
    ),
  },
  ...(onEdit
    ? [
        {
          id: "action",
          header: () => <div className="text-right font-semibold pr-3">Action</div>,
          cell: ({ row }: any) => (
            <div className="flex items-center justify-end pr-1">
              <button
                type="button"
                onClick={() => onEdit(row.original)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 hover:text-blue-600 bg-white border border-gray-200 hover:border-blue-300 rounded-md transition-colors cursor-pointer"
                title="Edit standing"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          ),
        },
      ]
    : []),
];

export const tableColumns = getTableColumns();
