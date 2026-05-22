import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { TPlayer } from "@/types/columnTypes";
import Image from "next/image";

export const getPlayerColumns = (onView: (player: TPlayer) => void): ColumnDef<TPlayer>[] => [
  {
    accessorKey: "name",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-gray-100 flex items-center justify-center">
          {row.original.profile ? (
            <Image src={row.original.profile} alt="profilePic" width={40} height={40} className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 font-bold uppercase">
              {row.original.firstName?.[0] || 'P'}
              {row.original.lastName?.[0] || ''}
            </span>
          )}
        </div>
        <p className="flex flex-col items-start ">
          <span className="font-semibold">{row.original.firstName} {row.original.lastName}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "team",
    header: () => <div className="">Team</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex items-center gap-2">
          {row.original.teamLogo && (
            <Image src={row.original.teamLogo} alt="teamLogo" width={32} height={32} className="w-8 h-8 rounded-full border border-gray-100" />
          )}
          <span className="font-medium text-gray-700">{row.original.teamName || "N/A"}</span>
          {row.original.shortName && <span className="text-xs text-gray-400">({row.original.shortName})</span>}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: () => <div className="">Position</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md text-gray-600 font-medium`}>{row.original.position || "Undesignated"}</div>
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
          <FiEye className="size-5 text-gray-800" />
        </button>
      </div>
    ),
  }
]