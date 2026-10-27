/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import {
  Edit2,
  Trash2,
  Star,
  Eye,
  ExternalLink,
  Calendar,
  MousePointerClick,
  Megaphone,
} from "lucide-react";
import { TPromotionalZone } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getStatusBadge = (status: string) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "approved":
    case "active":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active
        </span>
      );
    case "pending":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          Paused
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          Rejected
        </span>
      );
    case "expired":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          Expired
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
          {status}
        </span>
      );
  }
};

export const getPromotionalZoneColumns = (
  _onViewInquiries: (item: TPromotionalZone) => void,
  onEdit: (item: TPromotionalZone) => void,
  onDelete: (id: string) => void,
  onToggleFeature: (id: string) => void,
  _onStatusChange: (id: string, status: "approved" | "rejected") => void
): ColumnDef<TPromotionalZone>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Ad Campaign & Banner
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const bannerSrc = item.banner ? formatImagePath(item.banner) : null;

      return (
        <div className="flex items-center gap-3 max-w-[340px]">
          {/* Banner Thumbnail */}
          <div className="w-14 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative">
            {bannerSrc ? (
              <img
                src={bannerSrc}
                alt={item.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Megaphone className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {item.isFeatured && (
                <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  Top Banner
                </span>
              )}
            </div>
            <div className="font-semibold text-xs text-slate-900 truncate" title={item.title}>
              {item.title}
            </div>
            {item.description && (
              <div className="text-[11px] text-slate-500 truncate" title={item.description}>
                {item.description}
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "websiteUrl",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Destination Link
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const url = item.websiteUrl || item.externalUrl || item.contactInfo?.registrationLink || "";

      if (!url) {
        return <span className="text-xs text-slate-400">No URL</span>;
      }

      const displayUrl = url.replace(/^https?:\/\//i, "");

      return (
        <a
          href={url.startsWith("http") ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline max-w-[220px] truncate font-medium bg-blue-50/60 px-2.5 py-1 rounded-md border border-blue-100"
          title={url}
        >
          <ExternalLink className="w-3 h-3 shrink-0" />
          <span className="truncate">{displayUrl}</span>
        </a>
      );
    },
  },
  {
    accessorKey: "analytics",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Performance
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const views = item.viewsCount || 0;
      const clicks = item.clicksCount || 0;
      const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";

      return (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
              <Eye className="w-3 h-3 text-slate-400" />
              {views} views
            </span>
            <span className="inline-flex items-center gap-1 text-blue-700 font-semibold">
              <MousePointerClick className="w-3 h-3 text-blue-500" />
              {clicks} clicks
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            CTR: {ctr}%
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Campaign Period
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{dayjs(item.startDate).format("MMM D")} - {dayjs(item.endDate).format("MMM D, YYYY")}</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {dayjs().isAfter(dayjs(item.endDate)) ? (
              <span className="text-rose-500 font-medium">Campaign Ended</span>
            ) : (
              `${dayjs(item.endDate).diff(dayjs(), "day")} days remaining`
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Status
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-2">
          {getStatusBadge(item.status)}
          <button
            onClick={() => onToggleFeature(item._id)}
            className={`p-1 rounded transition-colors ${
              item.isFeatured
                ? "text-amber-500 hover:bg-amber-50"
                : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
            }`}
            title={item.isFeatured ? "Unpin from top" : "Pin as top featured banner"}
          >
            <Star className={`w-3.5 h-3.5 ${item.isFeatured ? "fill-amber-500" : ""}`} />
          </button>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-right block">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;

      return (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
            title="Edit Ad"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
            title="Delete Ad"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
