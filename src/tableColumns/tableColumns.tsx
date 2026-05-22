import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image";

export const tableColumns: ColumnDef<any>[] = [
  {
    id: "rank",
    header: () => <div className="">#</div>,
    cell: ({ row }) => (
      <div className="font-semibold">{row.index + 1}</div>
    ),
  },
  {
    accessorKey: "team",
    header: () => <div className="">Team</div>,
    cell: ({ row }) => {
      const team = row.original.team;
      return (
        <div className="flex items-center gap-2">
          {team?.teamLogo ? (
            <Image src={team.teamLogo} alt="logo" width={100} height={100} className="w-10 h-10 rounded-full border border-gray-100 object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 border border-gray-100 flex items-center justify-center text-[10px]">No Logo</div>
          )}
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 leading-none">{team?.teamName}</span>
            <span className="text-[10px] text-gray-400 font-semibold uppercase">{team?.shortName}</span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "played",
    header: () => <div className="">P</div>,
    cell: ({ row }) => <div className="font-medium">{row.getValue("played")}</div>,
  },
  {
    accessorKey: "win",
    header: () => <div className="">W</div>,
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("win")}</div>,
  },
  {
    accessorKey: "draw",
    header: () => <div className="">D</div>,
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("draw")}</div>,
  },
  {
    accessorKey: "loss",
    header: () => <div className="">L</div>,
    cell: ({ row }) => <div className="text-gray-600">{row.getValue("loss")}</div>,
  },
  {
    accessorKey: "goalDifference",
    header: () => <div className="">GD</div>,
    cell: ({ row }) => (
      <div className={`font-medium ${Number(row.getValue("goalDifference")) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {Number(row.getValue("goalDifference")) > 0 ? `+${row.getValue("goalDifference")}` : row.getValue("goalDifference")}
      </div>
    ),
  },
  {
    accessorKey: "points",
    header: () => <div className="">PTS</div>,
    cell: ({ row }) => (
        <div className="font-bold text-gray-900">{row.getValue("points")}</div>
    ),
  },
]