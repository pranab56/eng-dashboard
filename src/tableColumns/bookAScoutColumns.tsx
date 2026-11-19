/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import {
  Edit2,
  Trash2,
  Eye,
  MousePointerClick,
  ExternalLink,
  ImageIcon,
  Star,
  Calendar,
} from "lucide-react";
import { TBookAScout } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          Active
        </span>
      );
    case "inactive":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Inactive
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          {status || "Active"}
        </span>
      );
  }
};

export const getBookAScoutColumns = (
  onEdit: (item: TBookAScout) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: string) => void,
  onToggleFeatured: (id: string) => void
): ColumnDef<TBookAScout>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Scout Section Card
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const imgSrc = item.image ? formatImagePath(item.image) : null;

      return (
        <div className="flex items-center gap-3 max-w-[360px]">
          <div className="w-14 h-10 rounded-md bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative flex items-center justify-center">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <ImageIcon className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded truncate max-w-[140px]">
                {item.badgeText || "Professional scouting"}
              </span>
              {item.sectionTitle && (
                <span className="text-[10px] text-slate-400 truncate">{item.sectionTitle}</span>
              )}
            </div>
            <p className="text-xs font-semibold text-slate-900 truncate mt-0.5" title={item.title}>
              {item.title}
            </p>
            <p className="text-[11px] text-slate-500 truncate" title={item.description}>
              {item.description || "No description provided"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "redirectUrl",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        CTA & Redirect URL
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="max-w-[230px]">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {item.buttonText || "Book Now"}
          </span>
          {item.redirectUrl ? (
            <a
              href={item.redirectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 hover:underline truncate"
              title={item.redirectUrl}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{item.redirectUrl}</span>
            </a>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">No URL set</p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Schedule & Order
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
              P{item.priority ?? 0}
            </span>
            <button
              type="button"
              onClick={() => onToggleFeatured(item._id)}
              title={item.isFeatured ? "Unpin featured" : "Pin as featured"}
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer transition-colors ${
                item.isFeatured
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-white text-slate-400 border-slate-200 hover:text-slate-600"
              }`}
            >
              <Star
                className={`w-2.5 h-2.5 ${item.isFeatured ? "fill-amber-500 text-amber-500" : ""}`}
              />
              {item.isFeatured ? "Featured" : "Standard"}
            </button>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              {item.startDate ? dayjs(item.startDate).format("MMM D") : "Now"}
              {" → "}
              {item.endDate ? dayjs(item.endDate).format("MMM D, YY") : "Always"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "analytics",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Engagement
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-3 text-xs font-mono text-slate-700">
          <span className="inline-flex items-center gap-1" title="Impressions">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            {(item.viewsCount || 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1" title="CTA Clicks">
            <MousePointerClick className="w-3.5 h-3.5 text-slate-400" />
            {(item.clicksCount || 0).toLocaleString()}
          </span>
        </div>
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
      return (
        <button
          type="button"
          onClick={() => onToggleStatus(item._id, item.status)}
          title="Click to toggle Active / Inactive"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          {getStatusBadge(item.status)}
        </button>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-right block pr-2">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1 pr-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded-md border border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Scout Card"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="w-7 h-7 rounded-md border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete Scout Card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
