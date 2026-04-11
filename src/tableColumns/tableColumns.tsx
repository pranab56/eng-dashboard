import { ColumnDef } from "@tanstack/react-table"
import { TTable } from "@/types/columnTypes";
import Image from "next/image";

export const tableColumns: ColumnDef<TTable>[] = [
  {
    accessorKey: "rating",
    header: () => <div className="">#</div>,
    cell: ({ row }) => (
      <div className="font-semibold">{row.getValue("rating")}</div>
    ),
  },
  {
    accessorKey: "team",
    header: () => <div className="">Team</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image src={row.original.logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
        <span className="font-semibold">{row.getValue("team")}</span>
      </div>
    ),
  },
  {
    accessorKey: "played",
    header: () => <div className="">P</div>,
    cell: ({ row }) => (
        <div className="text-gray-500">{row.getValue("played")}</div>
    ),
  },
  {
    accessorKey: "won",
    header: () => <div className="">W</div>,
    cell: ({ row }) => (
        <div className="text-gray-500">{row.getValue("played")}</div>
    ),
  },
  {
    accessorKey: "drawn",
    header: () => <div className="">D</div>,
    cell: ({ row }) => (
        <div className="text-gray-500">{row.getValue("drawn")}</div>
    ),
  },
  {
    accessorKey: "lost",
    header: () => <div className="">L</div>,
    cell: ({ row }) => (
        <div className="text-gray-500">{row.getValue("lost")}</div>
    ),
  },
  {
    accessorKey: "points",
    header: () => <div className="">PTS</div>,
    cell: ({ row }) => (
        <div className="text-gray-500">{row.getValue("points")}</div>
    ),
  },
]