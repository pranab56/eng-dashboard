/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { TSponsorship } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { ExternalLink } from "lucide-react";

const getTypeBadge = (type: string) => {
  switch (type) {
    case "sponsor":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Sponsor
        </span>
      );
    case "partner":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
          Official Partner
        </span>
      );
    case "brand_collaboration":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200/80">
          Collaboration
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
          {type}
        </span>
      );
  }
};

const getTierBadge = (tier: string) => {
  switch (tier) {
    case "title":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-300">
          Title
        </span>
      );
    case "platinum":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-100 border border-slate-700">
          Platinum
        </span>
      );
    case "gold":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-100/70 text-amber-900 border border-amber-200">
          Gold
        </span>
      );
    case "silver":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Silver
        </span>
      );
    case "official":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 text-sky-800 border border-sky-200">
          Official
        </span>
      );
    case "media":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Media
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200 capitalize">
          {tier}
        </span>
      );
  }
};

export const getSponsorshipColumns = (
  onEdit: (item: TSponsorship) => void,
  onDelete: (id: string) => void,
  onToggleStatus?: (id: string) => void
): ColumnDef<TSponsorship>[] => [
  {
    accessorKey: "name",
    header: () => <span className="font-semibold text-xs text-slate-600">Brand</span>,
    cell: ({ row }) => {
      const { name, title, logo } = row.original;
      const formattedLogo = formatImagePath(logo);

      return (
        <div className="flex items-center gap-3 min-w-[200px] py-1">
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 shrink-0 flex items-center justify-center p-0.5 overflow-hidden">
            {formattedLogo ? (
              <img
                src={formattedLogo}
                alt={name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                {name?.slice(0, 2) || "SP"}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-slate-900 text-xs leading-snug truncate">
              {name}
            </span>
            {title ? (
              <span className="text-[11px] text-slate-500 leading-snug truncate">
                {title}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: () => <span className="font-semibold text-xs text-slate-600">Type</span>,
    cell: ({ row }) => getTypeBadge(row.original.type),
  },
  {
    accessorKey: "tier",
    header: () => <span className="font-semibold text-xs text-slate-600">Tier</span>,
    cell: ({ row }) => getTierBadge(row.original.tier),
  },
  {
    accessorKey: "placements",
    header: () => <span className="font-semibold text-xs text-slate-600">Placements</span>,
    cell: ({ row }) => {
      const placements = row.original.placements || ["home"];
      return (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {placements.map((p, i) => (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium rounded bg-slate-100 text-slate-600 border border-slate-200"
            >
              {p}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "websiteUrl",
    header: () => <span className="font-semibold text-xs text-slate-600">Website</span>,
    cell: ({ row }) => {
      const url = row.original.websiteUrl;
      if (!url) {
        return <span className="text-xs text-slate-400">—</span>;
      }
      return (
        <a
          href={url.startsWith("http") ? url : `https://${url}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 hover:underline max-w-[160px] truncate"
        >
          <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
          <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
        </a>
      );
    },
  },
  {
    accessorKey: "analytics",
    header: () => <span className="font-semibold text-xs text-slate-600">Metrics</span>,
    cell: ({ row }) => {
      const clicks = row.original.clickCount ?? 0;
      const impressions = row.original.impressionCount ?? 0;

      return (
        <div className="text-xs text-slate-600 tabular-nums whitespace-nowrap">
          <span className="font-medium text-slate-900">{impressions.toLocaleString()}</span>
          <span className="text-slate-400 mx-1">views</span>
          <span className="text-slate-300">·</span>
          <span className="font-medium text-slate-900 ml-1">{clicks.toLocaleString()}</span>
          <span className="text-slate-400 ml-1">clicks</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-xs text-slate-600">Status</span>,
    cell: ({ row }) => {
      const isActive = row.original.status === "active";
      const id = row.original._id;

      return (
        <button
          type="button"
          onClick={() => onToggleStatus && onToggleStatus(id)}
          className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-colors hover:bg-slate-100"
          title="Toggle status"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-slate-300"
            }`}
          />
          <span className={isActive ? "text-slate-800" : "text-slate-500"}>
            {isActive ? "Active" : "Inactive"}
          </span>
        </button>
      );
    },
  },
  {
    id: "actions",
    header: () => <span className="font-semibold text-xs text-slate-600 text-right block pr-2">Actions</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-0.5 pr-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Edit"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Delete"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
