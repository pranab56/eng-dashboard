import { ColumnDef } from "@tanstack/react-table"
import { HiOutlineTrash } from "react-icons/hi";
import { TUserManagement } from "@/types/columnTypes";
import Image from "next/image";

export const getUsersColumns = (
  onToggleStatus: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<TUserManagement>[] => [
  {
    accessorKey: "userName",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.profile ? (
          <Image 
            src={row.original.profile} 
            alt="profile" 
            width={40} 
            height={40} 
            className="w-10 h-10 rounded-full object-cover border border-gray-200" 
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold border border-gray-200">
            {row.original.userName?.charAt(0) || "U"}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">{row.original.userName}</span>
          <span className="text-xs text-gray-400 capitalize">{row.original.role.toLowerCase().replace(/_/g, ' ')}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="">Role</div>,
    cell: ({ row }) => (
      <div className="text-sm font-medium text-gray-600 capitalize">
        {row.original.role.toLowerCase().replace(/_/g, ' ')}
      </div>
    ),
  },
  {
    accessorKey: "verified",
    header: () => <div className="">Verification</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={row.original.verified}
            onChange={() => onToggleStatus(row.original._id)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
        <span className={`text-xs font-semibold ${row.original.verified ? 'text-green-600' : 'text-gray-400'}`}>
          {row.original.verified ? 'Verified' : 'Pending'}
        </span>
      </div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onDelete(row.original._id)} 
          className="flex items-center justify-center h-8 w-8 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200 cursor-pointer"
          title="Delete User"
        >
          <HiOutlineTrash className="size-5" />
        </button>
      </div>
    ),
  }
]