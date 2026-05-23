import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { baseURL } from '../utils/BaseURL';

const statusStyle = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "finished":
      return "bg-green-100 text-green-500";
    case "upcoming":
      return "bg-blue-100 text-blue-500";
    case "live":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export const getMatchColumns = (onView: (match: any) => void, onDelete: (id: string) => void): ColumnDef<any>[] => [
  {
    accessorKey: "homeTeam",
    header: () => <div className="">Teams & Matchup</div>,
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div>
          <div className="flex gap-2">
            <div className="flex items-center">
              {match.homeTeam?.teamLogo ? (
                <Image src={baseURL + match.homeTeam.teamLogo} alt="home" width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px]">Home</div>
              )}
              {match.awayTeam?.teamLogo ? (
                <Image src={baseURL + match.awayTeam.teamLogo} alt="away" width={100} height={100} className="w-10 h-10 rounded-full relative -left-3 border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full relative -left-3 border-2 border-white bg-gray-200 flex items-center justify-center text-[10px]">Away</div>
              )}
            </div>
            <p className="flex flex-col flex-start items-start ">
              <span className="font-semibold">{match.homeTeam?.teamName} Vs {match.awayTeam?.teamName}</span>
              <span className=" text-gray-500">{match.venueName}</span>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "matchDate",
    header: () => <div className="">Date & Time</div>,
    cell: ({ row }) => {
      const date = dayjs(row.original.matchDate);
      return (
        <div>
          <div className="font-semibold">{date.format("DD/MM/YYYY")}</div>
          <div className="text-gray-500">Kick-off: {date.format("HH:mm a")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    header: () => <div className="">Score</div>,
    cell: ({ row }) => (
      <div className="bg-[#080808] text-white rounded-md px-4 py-2 inline-block font-semibold">
        {row.original.homeScore ?? 0} - {row.original.awayScore ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => (
      <div className={`${statusStyle(row.getValue("status"))} inline-block px-2 py-1 rounded-md capitalize font-semibold`}>
        {row.getValue("status")}
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
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
        >
          <FiEye className="size-5 font-bold text-gray-800" />
        </button>
        <Link href={`/match-management/create-match?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer">
            <FiEdit className="size-5 font-bold text-gray-800" />
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
