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

const getPlatformIcon = (platformName: string, iconUrl?: string) => {
  if (iconUrl) {
    const formattedUrl = formatImagePath(iconUrl);
    if (formattedUrl) {
      return (
        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
          <Image src={formattedUrl} alt="icon" fill sizes="28px" className="object-cover" />
        </div>
      );
    }
  }

  const p = platformName.toLowerCase();
  if (p.includes("facebook")) return <FaFacebook className="w-6 h-6 text-blue-600" />;
  if (p.includes("github")) return <FaGithub className="w-6 h-6 text-gray-900" />;
  if (p.includes("instagram")) return <FaInstagram className="w-6 h-6 text-pink-600" />;
  if (p.includes("twitter") || p.includes("x")) return <FaTwitter className="w-6 h-6 text-sky-500" />;
  if (p.includes("youtube")) return <FaYoutube className="w-6 h-6 text-red-600" />;
  if (p.includes("linkedin")) return <FaLinkedin className="w-6 h-6 text-blue-700" />;

  return <FiGlobe className="w-6 h-6 text-gray-500" />;
};

export const getSocialColumns = (
  onEdit: (item: TSocialMedia) => void,
  onDelete: (id: string) => void
): ColumnDef<TSocialMedia>[] => [
    {
      accessorKey: "platform",
      header: () => <div>Platform</div>,
      cell: ({ row }) => {
        const { platform, icon } = row.original;
        return (
          <div className="flex items-center gap-3">
            {getPlatformIcon(platform, icon)}
            <span className="font-semibold text-gray-900">{platform}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "url",
      header: () => <div>URL / Link</div>,
      cell: ({ row }) => {
        const url = row.original.url;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline max-w-xs truncate block font-medium"
          >
            {url}
          </a>
        );
      },
    },
    {
      accessorKey: "order",
      header: () => <div>Order</div>,
      cell: ({ row }) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 font-medium text-xs text-gray-700">
          {row.original.order ?? 1}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div>Status</div>,
      cell: ({ row }) => {
        const isActive = row.original.status === true;
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold . tracking-wider border ${isActive
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    },
    {
      accessorKey: "updatedAt",
      header: () => <div>Updated At</div>,
      cell: ({ row }) => {
        const dateVal = row.original.updatedAt || row.original.createdAt;
        return (
          <div className="text-sm text-gray-600 font-medium">
            {dateVal ? dayjs(dateVal).format("MMM DD, YYYY · hh:mm A") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div>Action</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800"
              title="Edit Social Media Link"
            >
              <FiEdit className="size-5 font-medium" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
              title="Delete Social Media Link"
            >
              <FiTrash2 className="size-5 font-medium" />
            </button>
          </div>
        );
      },
    },
  ];
