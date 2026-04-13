import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { TMatch } from "@/types/columnTypes";
import Image from "next/image";
import Link from "next/link";

const statusStyle = (status: string): string => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-500";
    case "Scheduled":
      return "bg-blue-100 text-blue-500";
    case "On Going":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-500";
  }
};

export const matchColumns: ColumnDef<TMatch>[] = [
  {
    accessorKey: "teams_matchup",
    header: () => <div className="">Teams & Matchup</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex gap-2">
          <div className="flex items-center">
            <Image src={row.original.team_a_logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
            <Image src={row.original.team_b_logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full relative -left-3 border-2 border-white" />
          </div>
          <p className="flex flex-col flex-start items-start ">
            <span className="font-semibold">{row.getValue("teams_matchup")}</span>
            <span className=" text-gray-500">{row.original.venue}</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="">Date & Time</div>,
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.getValue("date")}</div>
        <div className="text-gray-500">{row.original.time}</div>
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: () => <div className="">Score</div>,
    cell: ({ row }) => (
      <div className="bg-[#080808] text-white rounded-md px-4 py-2 inline-block font-semibold">{row.getValue("score")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => (
      <div className={`${statusStyle(row.getValue("status"))} inline-block px-2 py-1 rounded-md`}>{row.getValue("status")}</div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: () => (
      <div className="flex items-center gap-2">
        <Link href="/match-management/create-match">
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3]  transition-colors duration-300 cursor-pointer">
            <FiEye className="size-5 font-bold text-gray-800 transition-colors duration-300" />
          </button>
        </Link>
      </div>
    ),
  }
]