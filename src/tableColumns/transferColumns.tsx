import { ColumnDef } from "@tanstack/react-table"
import { TTransfer } from "@/types/columnTypes";
import Image from "next/image";
import { IoIosCheckboxOutline } from "react-icons/io";
import { MdCancelPresentation } from "react-icons/md";
import { CustomModal } from "@/components/modals/CustomModal";
import PlayerTransferDetail from "@/app/(CommonLayout)/transfer-management/PlayerTransfer";

export const transferColumns: ColumnDef<TTransfer>[] = [
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
    accessorKey: "f_team",
    header: () => <div className="">From</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2">
          <Image src={row.original.f_logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
          <span>{row.getValue("f_team")}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "t_team",
    header: () => <div className="">To</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2">
          <Image src={row.original.t_logo} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-full border-2 border-white" />
          <span>{row.getValue("t_team")}</span>
        </div>
      </div>
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
          trigger={<button className="flex items-center justify-center h-9 w-9 rounded-sm bg-green-100  transition-colors duration-300 cursor-pointer">
            <IoIosCheckboxOutline className="size-5 font-bold text-green-800 transition-colors duration-300" />
          </button>}
        >
          <PlayerTransferDetail />
        </CustomModal>
        <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-red-100  transition-colors duration-300 cursor-pointer">
          <MdCancelPresentation className="size-5 font-bold text-red-700 transition-colors duration-300" />
        </button>
      </div>
    ),
  }
]