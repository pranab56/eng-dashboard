import { TEngtv } from "@/types/columnTypes";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { Star } from "lucide-react";
import { formatImagePath } from "../utils/formatImagePath";

const getStatusBadge = (status: string) => {
  const lower = status?.toLowerCase();
  switch (lower) {
    case "publish":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800";
    case "draft":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800";
    case "schedule":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  }
};

export const getEngtvColumns = (
  onView: (video: TEngtv) => void,
  onDelete: (id: string) => void
): ColumnDef<TEngtv>[] => [
  {
    accessorKey: "title",
    header: () => <div>Video Content</div>,
    cell: ({ row }) => {
      const catVal = row.original.category as any;
      const catName =
        typeof catVal === "object" && catVal
          ? catVal.name
          : typeof catVal === "string"
          ? catVal
          : "";

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-9 rounded overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0">
            {row.original.thumbnail ? (
              <Image
                src={formatImagePath(row.original.thumbnail)}
                alt="thumbnail"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                No Img
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 max-w-[320px]">
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">
                {row.original.title}
              </span>
              {row.original.isHighlight && (
                <span title="Highlight">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 shrink-0" />
                </span>
              )}
            </div>
            {catName && (
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {catName}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "publishDateTime",
    header: () => <div>Publish Date</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-800 dark:text-slate-200">
          {row.original.publishDateTime
            ? dayjs(row.original.publishDateTime).format("DD MMM YYYY")
            : "N/A"}
        </span>
        {row.original.publishDateTime && (
          <span className="text-[11px] text-slate-400">
            {dayjs(row.original.publishDateTime).format("h:mm A")}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium uppercase border inline-block ${getStatusBadge(
            status
          )}`}
        >
          {status || "Draft"}
        </span>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="text-right pr-2">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 pr-2">
        <button
          onClick={() => onView(row.original)}
          className="h-8 w-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title="View Details"
        >
          <FiEye className="w-3.5 h-3.5" />
        </button>
        <Link href={`/engtv-management/create-video?id=${row.original._id}`}>
          <button
            className="h-8 w-8 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Video"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="h-8 w-8 rounded border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
          title="Delete Video"
        >
          <HiOutlineTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];
