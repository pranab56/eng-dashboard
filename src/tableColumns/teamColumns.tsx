import { formatImagePath } from "@/utils/formatImagePath";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";

export const getTeamColumns = (
  onView: (team: any) => void,
  onDelete: (id: string) => void,
  onEditCoin?: (team: any) => void
): ColumnDef<any>[] => [
    {
      accessorKey: "teamName",
      header: () => <div className="">Team Identity</div>,
      cell: ({ row }) => {
        const logoUrl = formatImagePath(row.original.teamLogo);
        return (
          <div className="flex gap-3">
            {logoUrl ? (
              <Image src={logoUrl} alt="logo" width={100} height={100} className="w-12 h-12 rounded-xl border border-gray-100 object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-400">TEAM</div>
            )}
            <p className="flex flex-col flex-start items-start ">
              <span className="font-medium text-gray-900">{row.original.teamName}</span>
              <span className="text-xs text-gray-400 font-semibold">{row.original.stadiumName || "Stadium Not Set"}</span>
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "shortName",
      header: () => <div className="">Short Name</div>,
      cell: ({ row }) => <div className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-xs inline-block">{row.getValue("shortName")}</div>,
    },
    {
      accessorKey: "totalMembers",
      header: () => <div className="">Squad Strength</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.getValue("totalMembers")}</span>
          <span className="text-xs text-gray-400 font-medium">Players</span>
        </div>
      ),
    },
    {
      accessorKey: "managers",
      header: () => <div className="">Manager</div>,
      cell: ({ row }) => {
        const manager = row.original.managers;
        if (!manager) return <span className="text-xs text-gray-400">Unassigned</span>;
        const profileUrl = formatImagePath(manager.profile);
        return (
          <div className="flex items-center gap-2">
            {profileUrl ? (
              <Image src={profileUrl} alt="manager" width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-gray-100" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-400">MGR</div>
            )}
            <span className="font-semibold text-gray-700 text-sm">{manager.firstName} {manager.lastName}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "city",
      header: () => <div className="">Location</div>,
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-700">{row.original.city || "N/A"}</span>
          <span className="text-[10px] text-gray-400 . font-black tracking-widest">{row.original.country}</span>
        </div>
      ),
    },
    {
      accessorKey: "coin",
      header: () => <div className="">Coin</div>,
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onEditCoin?.(row.original)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition-all cursor-pointer group"
          title="Click to update coin"
        >
          <span className="font-medium text-yellow-500 text-sm group-hover:scale-110 transition-transform">🪙</span>
          <span className="font-medium text-amber-900 text-sm">{(row.original.coin ?? 0).toLocaleString()}</span>
          <FiEdit2 className="w-3.5 h-3.5 text-amber-600 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
        </button>
      ),
    },
    {
      id: "action",
      header: () => <div className="">Action</div>,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(row.original)}
            className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800"
          >
            <FiEye className="size-5 font-medium" />
          </button>
          <Link href={`/team-management/add-team?id=${row.original._id}`}>
            <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800">
              <FiEdit className="size-5 font-medium" />
            </button>
          </Link>
          <button
            onClick={() => onDelete(row.original._id)}
            className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
          >
            <FiTrash2 className="size-5 font-medium" />
          </button>
        </div>
      ),
    }
  ]