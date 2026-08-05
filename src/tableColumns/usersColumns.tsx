import { ColumnDef } from "@tanstack/react-table"
import { HiOutlineTrash } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import { TUserManagement } from "@/types/columnTypes";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import { Shield } from "lucide-react";

export const getUsersColumns = (
  onToggleStatus: (id: string) => void,
  onUpdateUserStatus: (id: string, status: "APPROVED" | "REJECTED") => void,
  onDelete: (id: string) => void,
  onView?: (user: TUserManagement) => void,
  onAssignTeams?: (user: TUserManagement) => void
): ColumnDef<TUserManagement>[] => [
    {
      accessorKey: "userName",
      header: () => <div className="">Name</div>,
      cell: ({ row }) => {
        const profileUrl = formatImagePath(row.original.profile);
        const displayName = row.original.userName || `${row.original.firstName || ''} ${row.original.lastName || ''}`.trim() || "User";
        return (
          <div className="flex items-center gap-3">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt="profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium border border-gray-200">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">{displayName}</span>
              <span className="text-xs text-gray-400 capitalize">{row.original.role ? row.original.role.toLowerCase().replace(/_/g, ' ') : ''}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "email",
      header: () => <div className="">Email</div>,
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.email || 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: () => <div className="">Role</div>,
      cell: ({ row }) => (
        <div className="text-sm font-medium text-gray-600 capitalize">
          {row.original.role ? row.original.role.toLowerCase().replace(/_/g, ' ') : 'N/A'}
        </div>
      ),
    },
    {
      accessorKey: "verified",
      header: () => <div className="">Status</div>,
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
      accessorKey: "status",
      header: () => <div className="">Verification</div>,
      cell: ({ row }) => {
        const currentStatus = (row.original.status || "REJECTED").toUpperCase();
        const isApproved = currentStatus === "APPROVED";
        return (
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isApproved}
                onChange={() => onUpdateUserStatus(row.original._id, isApproved ? "REJECTED" : "APPROVED")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <span className={`text-xs font-medium . ${isApproved ? 'text-green-600' : currentStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>
              {currentStatus}
            </span>
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div className="">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {onView && (
            <button
              type="button"
              onClick={() => onView(row.original)}
              className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 cursor-pointer"
              title="Inspect Details & Verification Documents"
            >
              <FiEye className="size-4" />
            </button>
          )}
          {onAssignTeams && row.original.role === "MANAGER" && (
            <button
              type="button"
              onClick={() => onAssignTeams(row.original)}
              className="flex items-center justify-center h-8 w-8 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors duration-200 cursor-pointer"
              title="Assign Teams to Coach"
            >
              <Shield className="size-4" />
            </button>
          )}
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