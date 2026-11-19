/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { Edit2, Trash2, ImageIcon } from "lucide-react";
import { TBanner } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

export const getBannerColumns = (
  onEdit: (item: TBanner) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: string) => void
): ColumnDef<TBanner>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Banner
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const imgSrc = item.image ? formatImagePath(item.image) : null;

      return (
        <div className="flex items-center gap-3 max-w-[340px]">
          <div className="w-16 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative flex items-center justify-center shadow-xs">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={item.title || item.name || "Banner"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-semibold text-slate-900 truncate"
              title={item.title || item.name}
            >
              {item.title || item.name || "Untitled Banner"}
            </p>
            {item.subtitle ? (
              <p className="text-[11px] text-slate-500 truncate" title={item.subtitle}>
                {item.subtitle}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">No subtitle</p>
            )}
            {item.priority && item.priority > 0 ? (
              <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                Priority: {item.priority}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "section",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Target Section
      </span>
    ),
    cell: ({ row }) => {
      const sec = row.original.section || "GENERAL";
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          {sec}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Status
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const isActive = item.status === "active";
      const bannerId = item._id || item.id || "";

      return (
        <button
          onClick={() => onToggleStatus(bannerId, item.status)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
          }`}
          title="Click to toggle status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`}
          />
          {isActive ? "Active" : "Inactive"}
        </button>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Created Date
      </span>
    ),
    cell: ({ row }) => {
      const d = row.original.createdAt;
      return (
        <span className="text-xs text-slate-600">{d ? dayjs(d).format("MMM DD, YYYY") : "—"}</span>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right block">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const bannerId = item._id || item.id || "";

      return (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
            title="Edit Banner"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(bannerId)}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition"
            title="Delete Banner"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
