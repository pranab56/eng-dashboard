import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import { FiEdit, FiTrash2, FiGlobe } from "react-icons/fi";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa";
import { TSocialMedia } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { ExternalLink } from "lucide-react";

const getPlatformIcon = (platformName: string, iconUrl?: string) => {
  if (iconUrl) {
    const formattedUrl = formatImagePath(iconUrl);
    if (formattedUrl) {
      return (
        <div className="relative w-7 h-7 rounded-md overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
          <Image src={formattedUrl} alt="icon" fill sizes="28px" className="object-cover" />
        </div>
      );
    }
  }

  const p = platformName.toLowerCase();
  if (p.includes("facebook")) return <FaFacebook className="w-5 h-5 text-blue-600 shrink-0" />;
  if (p.includes("github")) return <FaGithub className="w-5 h-5 text-slate-900 shrink-0" />;
  if (p.includes("instagram")) return <FaInstagram className="w-5 h-5 text-pink-600 shrink-0" />;
  if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="w-5 h-5 text-sky-500 shrink-0" />;
  if (p.includes("youtube")) return <FaYoutube className="w-5 h-5 text-red-600 shrink-0" />;
  if (p.includes("linkedin")) return <FaLinkedin className="w-5 h-5 text-blue-700 shrink-0" />;

  return <FiGlobe className="w-5 h-5 text-slate-500 shrink-0" />;
};

export const getSocialColumns = (
  onEdit: (item: TSocialMedia) => void,
  onDelete: (id: string) => void
): ColumnDef<TSocialMedia>[] => [
  {
    accessorKey: "platform",
    header: () => <span>Platform</span>,
    cell: ({ row }) => {
      const { platform, icon } = row.original;
      return (
        <div className="flex items-center gap-2.5">
          {getPlatformIcon(platform, icon)}
          <span className="font-semibold text-slate-900 text-xs sm:text-sm">{platform}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "url",
    header: () => <span>URL / Link</span>,
    cell: ({ row }) => {
      const url = row.original.url;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 hover:underline max-w-xs truncate font-medium"
        >
          <span className="truncate">{url}</span>
          <ExternalLink className="w-3 h-3 shrink-0 text-slate-400" />
        </a>
      );
    },
  },
  {
    accessorKey: "order",
    header: () => <span>Order</span>,
    cell: ({ row }) => (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 font-semibold text-xs text-slate-700 tabular-nums border border-slate-200/60">
        {row.original.order ?? 1}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ row }) => {
      const isActive = row.original.status === true;
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => <span>Last Modified</span>,
    cell: ({ row }) => {
      const dateVal = row.original.updatedAt || row.original.createdAt;
      return (
        <div className="text-xs text-slate-600 font-medium tabular-nums">
          {dateVal ? dayjs(dateVal).format("MMM DD, YYYY · hh:mm A") : "—"}
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => <span>Action</span>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Edit Social Media Link"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="flex items-center justify-center h-8 w-8 rounded-md border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
            title="Delete Social Media Link"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
