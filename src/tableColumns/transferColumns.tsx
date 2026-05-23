import { ColumnDef } from "@tanstack/react-table"
import { TTransfer } from "@/types/columnTypes";
import Image from "next/image";
import { IoIosCheckboxOutline } from "react-icons/io";
import { MdCancelPresentation } from "react-icons/md";
import { baseURL } from "@/utils/BaseURL";
import { cn } from "@/lib/utils";

interface TransferColumnsProps {
  onApprove: (transfer: TTransfer) => void;
  onReject: (transfer: TTransfer) => void;
}

export const getTransferColumns = ({ onApprove, onReject }: TransferColumnsProps): ColumnDef<TTransfer>[] => [
  {
    accessorKey: "playerFirstName",
    header: () => <div className="">Player</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Image 
          src={row.original.playerProfile.startsWith('http') ? row.original.playerProfile : `${baseURL}${row.original.playerProfile}`} 
          alt="player" 
          width={40} 
          height={40} 
          className="w-10 h-10 rounded-full border-2 border-white object-cover" 
        />
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.playerFirstName} {row.original.playerLastName}</span>
          <span className="text-gray-500 text-xs">{row.original.playerEmail}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "fromTeamName",
    header: () => <div className="">From</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.fromTeamName}</div>
    ),
  },
  {
    accessorKey: "toTeamName",
    header: () => <div className="">To</div>,
    cell: ({ row }) => (
      <div className="font-medium">{row.original.toTeamName}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-bold",
          status === 'PENDING' ? "bg-yellow-100 text-yellow-700" :
          status === 'APPROVED' ? "bg-green-100 text-green-700" :
          "bg-red-100 text-red-700"
        )}>
          {status}
        </span>
      );
    }
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.status === 'PENDING' && (
          <>
            <button 
              onClick={() => onApprove(row.original)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-green-100 hover:bg-green-200 text-green-800 transition-all cursor-pointer"
              title="Approve"
            >
              <IoIosCheckboxOutline className="size-5 font-bold" />
            </button>
            <button 
              onClick={() => onReject(row.original)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-red-100 hover:bg-red-200 text-red-700 transition-all cursor-pointer"
              title="Reject"
            >
              <MdCancelPresentation className="size-5 font-bold" />
            </button>
          </>
        )}
      </div>
    ),
  }
];
