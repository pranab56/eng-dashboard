import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { TeamRecord } from "@/types/dashboard";
import { baseURL } from '../utils/BaseURL';

export const getTeamColumns = (
  onView: (team: TeamRecord) => void,
  onDelete: (id: string) => void
): ColumnDef<TeamRecord>[] => [
  {
    accessorKey: "teamName",
    header: () => <div className="">Team Identity</div>,
    cell: ({ row }) => (
      <div className="flex gap-3">
        {row.original.teamLogo ? (
          <Image src={baseURL + row.original.teamLogo} alt="logo" width={100} height={100} className="w-12 h-12 rounded-xl border border-gray-100 object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">TEAM</div>
        )}
        <p className="flex flex-col flex-start items-start ">
          <span className="font-bold text-gray-900">{row.original.teamName}</span>
          <span className="text-xs text-gray-400 font-semibold">{row.original.stadiumName || "Stadium Not Set"}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "shortName",
    header: () => <div className="">Short Name</div>,
    cell: ({ row }) => <div className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs inline-block">{row.getValue("shortName")}</div>,
  },
  {
    accessorKey: "totalMembers",
    header: () => <div className="">Squad Strength</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900">{row.getValue("totalMembers")}</span>
        <span className="text-xs text-gray-400 font-medium">Players</span>
      </div>
    ),
  },
  {
    accessorKey: "city",
    header: () => <div className="">Location</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-semibold text-gray-700">{row.original.city || "N/A"}</span>
        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">{row.original.country}</span>
      </div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800"
        >
          <FiEye className="size-5 font-bold" />
        </button>
        <Link href={`/team-management/add-team?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800">
            <FiEdit className="size-5 font-bold" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
        >
          <FiTrash2 className="size-5 font-bold" />
        </button>
      </div>
    ),
  }
]
