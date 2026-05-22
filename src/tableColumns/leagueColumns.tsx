import { ColumnDef } from "@tanstack/react-table"
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import dayjs from "dayjs";

const statusStyle = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "running":
      return "bg-green-100 text-green-600";
    case "upcoming":
      return "bg-blue-100 text-blue-600";
    case "finished":
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-yellow-100 text-yellow-600";
  }
};

export const getLeagueColumns = (
  onView: (league: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "leagueName",
    header: () => <div>League Name</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-900">{row.original.leagueName}</span>
        <span className="text-xs text-gray-400 mt-0.5">Season {row.original.season}</span>
      </div>
    ),
  },
  {
    accessorKey: "startDate",
    header: () => <div>Start Date</div>,
    cell: ({ row }) => (
      <div className="font-medium text-gray-700">
        {dayjs(row.original.startDate).format("DD MMM, YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "endDate",
    header: () => <div>End Date</div>,
    cell: ({ row }) => (
      <div className="font-medium text-gray-700">
        {dayjs(row.original.endDate).format("DD MMM, YYYY")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => (
      <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold capitalize ${statusStyle(row.original.status)}`}>
        {row.original.status}
      </span>
    ),
  },
  {
    id: "action",
    header: () => <div>Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
        >
          <FiEye className="size-5 text-gray-800" />
        </button>
        <Link href={`/league-management/create-league?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
            <FiEdit className="size-5 text-gray-800" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
        >
          <FiTrash2 className="size-5" />
        </button>
      </div>
    ),
  },
];
