import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { TPlayer } from "@/types/columnTypes";
import Image from "next/image";
import { CustomModal } from "@/components/modals/CustomModal";
import PlayerDetails from "@/app/(CommonLayout)/team-management/single-team/PlayerDetails";

const statusStyle = (status: string): string => {
  switch (status) {
    case "Amateur":
      return "bg-yellow-100 text-yellow-500";
    case "Semi Pro":
      return "bg-blue-100 text-blue-500";
    case "Professional":
      return "bg-green-100 text-green-500";
    default:
      return "bg-gray-500";
  }
};

export const singleTeamColumns: ColumnDef<TPlayer>[] = [
  {
    accessorKey: "name",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Image src={row.original.image} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
        <p className="flex flex-col flex-start items-start ">
          <span className="font-semibold">{row.getValue("name")}</span>
          <span className=" text-gray-500">ID: {row.original.id}</span>
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
    accessorKey: "status",
    header: () => <div className="">Contact Status</div>,
    cell: ({ row }) => (
      <div className={`inline-block px-2 py-1 rounded-md ${statusStyle(row.getValue("status"))}`}>{row.getValue("status")}</div>
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