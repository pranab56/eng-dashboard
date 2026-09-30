/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { Newspaper } from "lucide-react";
import { formatImagePath } from "../utils/formatImagePath";

export const getNewsColumns = (
  onView: (news: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "title",
    header: () => <span className="font-semibold text-slate-900">Article Title & Category</span>,
    cell: ({ row }) => {
      const catVal = row.original.category as any;
      const rawCatName =
        typeof catVal === "object" && catVal
          ? catVal.name
          : typeof catVal === "string"
          ? catVal
          : "";
      const isHexId = Boolean(rawCatName && /^[0-9a-fA-F]{24}$/.test(rawCatName));
      const catName = isHexId ? null : rawCatName;

      return (
        <div className="flex items-center gap-3 py-1">
          {row.original.image ? (
            <div className="relative w-11 h-11 rounded-md border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
              <Image
                src={formatImagePath(row.original.image)}
                alt="article cover"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
              <Newspaper className="w-5 h-5" />
            </div>
          )}

          <div className="flex flex-col min-w-0 max-w-[320px]">
            <button
              type="button"
              onClick={() => onView(row.original)}
              className="text-left font-semibold text-slate-900 text-xs sm:text-sm line-clamp-1 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {row.getValue("title")}
            </button>
            <div className="flex items-center gap-2 mt-0.5">
              {catName && (
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/80">
                  {catName}
                </span>
              )}
              {row.original.order !== undefined && (
                <span className="text-[10px] font-mono text-slate-400">
                  #{row.original.order}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "publishDateTime",
    header: () => <span className="font-semibold text-slate-900">Publish Schedule</span>,
    cell: ({ row }) => {
      const dateVal = row.getValue("publishDateTime");
      if (!dateVal) {
        return (
          <span className="text-xs text-slate-400 font-medium">Unscheduled</span>
        );
      }
      return (
        <div className="flex flex-col text-xs">
          <span className="font-semibold text-slate-800">
            {dayjs(dateVal as string).format("DD MMM, YYYY")}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {dayjs(dateVal as string).format("hh:mm A")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-slate-900">Status</span>,
    cell: ({ row }) => {
      const rawStatus = (row.getValue("status") as string || "").toLowerCase();
      const isPublished = rawStatus === "publish" || rawStatus === "published";
      const isScheduled = rawStatus === "schedule" || rawStatus === "scheduled";

      let badgeClasses = "bg-slate-100 text-slate-700 border-slate-200";
      let dotColor = "bg-slate-400";
      let label = "Draft";

      if (isPublished) {
        badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        dotColor = "bg-emerald-500";
        label = "Published";
      } else if (isScheduled) {
        badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
        dotColor = "bg-blue-500";
        label = "Scheduled";
      }

      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClasses}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <span>{label}</span>
        </span>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="text-right pr-2 font-semibold text-slate-900">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onClick={() => onView(row.original)}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="View Article Details"
        >
          <FiEye className="w-3.5 h-3.5" />
        </button>

        <Link
          href={`/news-management/create-news?id=${row.original._id}`}
          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
          title="Edit Article"
        >
          <FiEdit className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => onDelete(row.original._id)}
          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
          title="Delete Article"
        >
          <FiTrash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];
