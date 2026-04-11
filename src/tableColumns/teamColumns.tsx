import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { TTeam } from "@/types/columnTypes";
import Image from "next/image";
import Link from "next/link";

const statusStyle = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-500";
    case "Suspended":
      return "bg-red-100 text-red-500";
    default:
      return "bg-gray-500";
  }
};

export const teamColumns: ColumnDef<TTeam>[] = [
  {
    accessorKey: "teams_matchup",
    header: () => <div className="">Teams & Matchup</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Image src={row.original.logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
        <p className="flex flex-col flex-start items-start ">
          <span className="font-semibold">{row.original.team}</span>
          <span className=" text-gray-500">{row.original.since}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "total_player",
    header: () => <div className="">Total Players</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex items-center">
          <Image src={row.original.player_imgs[0]} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
          <Image src={row.original.player_imgs[1]} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full relative -left-3 border-2 border-white" />
          <span className="font-semibold bg-gray-100 relative -left-6 rounded-full size-10 border-2 border-white flex items-center justify-center ">+{row.getValue("total_player")}</span>
        </div>
      </div>
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
        <Link href="/team-management/single-team" className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3]  transition-colors duration-300 cursor-pointer">
          <FiEye className="size-5 font-bold text-gray-800 transition-colors duration-300" />
        </Link>
      </div>
    ),
  }
]