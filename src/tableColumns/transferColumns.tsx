import { ColumnDef } from "@tanstack/react-table"
import { TTransfer } from "@/types/columnTypes";
import Image from "next/image";
import { IoIosCheckboxOutline } from "react-icons/io";
import { MdCancelPresentation } from "react-icons/md";
import { formatImagePath } from "@/utils/formatImagePath";
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
          src={formatImagePath(row.original.playerProfile)}
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
          "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider",
          status === 'PENDING' ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
            status === 'MANAGER_APPROVED' ? "bg-blue-100 text-blue-800 border border-blue-200" :
              status === 'APPROVED' ? "bg-green-100 text-green-800 border border-green-200" :
                "bg-red-100 text-red-800 border border-red-200"
        )}>
          {status ? status.replace(/_/g, ' ') : 'N/A'}
        </span>
      );
    }
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => {
      const status = row.original.status;
      const showActions = status === 'PENDING' || status === 'MANAGER_APPROVED';
      return (
        <div className="flex items-center gap-2">
          {showActions && (
            <>
              <button
                onClick={() => onApprove(row.original)}
                className="flex items-center justify-center h-9 w-9 rounded-md bg-green-50 hover:bg-green-100 text-green-700 transition-all cursor-pointer"
                title="Approve Transfer"
              >
                <IoIosCheckboxOutline className="size-5 font-medium" />
              </button>
              <button
                onClick={() => onReject(row.original)}
                className="flex items-center justify-center h-9 w-9 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                title="Reject Transfer"
              >
                <MdCancelPresentation className="size-5 font-medium" />
              </button>
            </>
          )}
        </div>
      );
    },
  }
];

