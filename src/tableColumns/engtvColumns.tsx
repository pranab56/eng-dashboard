import { TEngtv } from "@/types/columnTypes";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { baseURL } from '../utils/BaseURL';

const statusStyle = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "publish":
      return "bg-green-100 text-green-500";
    case "draft":
      return "bg-yellow-100 text-yellow-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

export const getEngtvColumns = (onView: (video: TEngtv) => void, onDelete: (id: string) => void): ColumnDef<TEngtv>[] => [
  {
    accessorKey: "title",
    header: () => <div className="">Video Details</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        {row.original.thumbnail ? (
          <Image src={baseURL + row.original.thumbnail} alt="thumbnail" width={40} height={40} className="w-10 h-10 rounded-md border border-gray-200 object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-[10px]">No Image</div>
        )}
        <div className="flex flex-col">
          <span className="font-semibold">{row.original.title}</span>
          <span className="text-gray-500 text-xs capitalize">{row.original.category}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "publishDateTime",
    header: () => <div className="">Publish Date</div>,
    cell: ({ row }) => (
      <div className="text-sm">
        {row.original.publishDateTime ? dayjs(row.original.publishDateTime).format("DD MMM YYYY") : "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md inline-block text-xs font-medium capitalize ${statusStyle(row.getValue("status"))}`}>
        {row.getValue("status")}
      </div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          title="View">
          <FiEye className="size-4 text-gray-700" />
        </button>
        <Link href={`/engtv-management/create-video?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-8 w-8 rounded bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer" title="Edit">
            <FiEdit className="size-4 text-gray-700" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-8 w-8 rounded bg-red-50 hover:bg-red-100 transition-colors cursor-pointer" title="Delete">
          <HiOutlineTrash className="size-4 text-red-600" />
        </button>
      </div>
    ),
  }
]
