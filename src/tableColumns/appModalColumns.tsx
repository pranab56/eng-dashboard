/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import {
  Edit2,
  Trash2,
  Eye,
  MousePointerClick,
  ExternalLink,
  Smartphone,
  Calendar,
  ImageIcon,
} from "lucide-react";
import { TAppModal } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import dayjs from "dayjs";

const getFrequencyBadge = (freq?: string) => {
  switch (freq) {
    case "once":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Once per user
        </span>
      );
    case "once_per_day":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          Daily
        </span>
      );
    case "always":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Every launch
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Once per user
        </span>
      );
  }
};

export const getAppModalColumns = (
  onEdit: (item: TAppModal) => void,
  onDelete: (id: string) => void,
  onToggleStatus: (id: string, currentStatus: string) => void
): ColumnDef<TAppModal>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Popup Campaign
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      const imgSrc = item.image ? formatImagePath(item.image) : null;

      return (
        <div className="flex items-center gap-3 max-w-[320px]">
          <div className="w-12 h-9 rounded bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative flex items-center justify-center">
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
            <p className="text-xs font-semibold text-slate-900 truncate" title={item.title}>
              {item.title}
            </p>
            {item.subtitle ? (
              <p className="text-[11px] text-slate-500 truncate" title={item.subtitle}>
                {item.subtitle}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">No subtitle</p>
            )}
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                CTA: {item.ctaText || "ENTER NOW"}
              </span>
              {item.priority && item.priority > 0 ? (
                <span className="text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                  P{item.priority}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "actionType",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Target Destination
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;

      if (item.actionType === "screen") {
        return (
          <div className="max-w-[240px]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <Smartphone className="w-3 h-3" />
              App Screen
            </span>
            <p className="text-xs font-medium text-slate-800 mt-1 truncate" title={item.screenName || item.targetScreen}>
              {item.screenName || "Screen"}
            </p>
            <p className="text-[11px] text-slate-400 font-mono truncate" title={item.targetScreen}>
              {item.targetScreen || "/"}
            </p>
          </div>
        );
      }

      if (item.actionType === "external_url") {
        return (
          <div className="max-w-[240px]">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
              <ExternalLink className="w-3 h-3" />
              Web Link
            </span>
            {item.targetUrl ? (
              <a
                href={item.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline block mt-1 truncate"
                title={item.targetUrl}
              >
                {item.targetUrl}
              </a>
            ) : (
              <span className="text-xs text-slate-400 block mt-1">No URL specified</span>
            )}
          </div>
        );
      }

      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
          Dismiss only
        </span>
      );
    },
  },
  {
    accessorKey: "showFrequency",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Frequency
      </span>
    ),
    cell: ({ row }) => getFrequencyBadge(row.original.showFrequency),
  },
  {
    id: "engagement",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Engagement
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium text-slate-900">{(item.viewsCount || 0).toLocaleString()}</span>
            <span className="text-slate-400 text-[11px]">views</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MousePointerClick className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-emerald-700">{(item.clicksCount || 0).toLocaleString()}</span>
            <span className="text-slate-400 text-[11px]">clicks</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "schedule",
    header: () => (
      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        Schedule
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="text-xs text-slate-700">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {item.startDate ? dayjs(item.startDate).format("MMM D, YYYY") : "Immediate"}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {item.endDate ? `Ends ${dayjs(item.endDate).format("MMM D, YYYY")}` : "No expiry date"}
          </p>
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
      const isActive = item.status === "active";

      return (
        <button
          type="button"
          onClick={() => onToggleStatus(item._id, item.status)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
          }`}
          title="Click to toggle active status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-emerald-600" : "bg-slate-400"
            }`}
          />
          {isActive ? "Active" : "Inactive"}
        </button>
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

      return (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Edit popup"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            title="Delete popup"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
