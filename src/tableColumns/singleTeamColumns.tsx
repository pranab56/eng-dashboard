import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { TPlayer } from "@/types/columnTypes";
import Image from "next/image";
import { CustomModal } from "@/components/modals/CustomModal";
import PlayerDetails from "@/app/(CommonLayout)/team-management/single-team/PlayerDetails";



export const singleTeamColumns: ColumnDef<TPlayer>[] = [
  {
    id: "player",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Image src={row.original.profile ?? ""} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
        <p className="flex flex-col flex-start items-start ">
          <span className="font-semibold">{row.original.firstName} {row.original.lastName}</span>
          <span className=" text-gray-500">ID: {row.original.shortName}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: () => <div className="">Position</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md`}>{row.getValue("position")}</div>
    ),
  },
  {
    accessorKey: "teamName",
    header: () => <div className="">Team</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.teamLogo && (
          <Image src={row.original.teamLogo} alt="team logo" width={24} height={24} className="w-6 h-6 rounded-full" />
        )}
        <span>{row.getValue("teamName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "goals",
    header: () => <div className="">Goals</div>,
    cell: ({ row }) => (
      <div className={`inline-block px-2 py-1 rounded-md bg-green-100 text-green-600 font-semibold`}>{row.getValue("goals") ?? 0}</div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: () => (
      <div className="flex items-center gap-2">

        <CustomModal
          title="Transfer Approval Request"
          className="sm:max-w-[720px]"
          trigger={<button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3]  transition-colors duration-300 cursor-pointer">
            <FiEye className="size-5 font-bold text-gray-800 transition-colors duration-300" />
          </button>}
        >
          <PlayerDetails />
        </CustomModal>
      </div>
    ),
  }
]