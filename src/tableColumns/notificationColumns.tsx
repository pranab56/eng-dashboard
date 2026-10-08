import { TNotification } from "@/types/columnTypes";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Bell } from "lucide-react";

const getCategoryBadge = (category?: string) => {
  switch (category) {
    case "TRANSFERS_GOSSIP":
      return {
        label: "Transfers Gossip",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "⇄",
      };
    case "PLAYER_OF_THE_WEEK":
      return {
        label: "Player of the Week",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "🏆",
      };
    case "MATCH_UPDATE":
      return {
        label: "Match Updates",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: "🎯",
      };
    case "GENERAL_NEWS":
    default:
      return {
        label: "General News",
        className: "bg-purple-50 text-purple-700 border-purple-200",
        icon: "📰",
      };
  }
};

export const notificationColumns: ColumnDef<TNotification>[] = [
  {
    accessorKey: "title",
    header: () => <div className="">Notification</div>,
    cell: ({ row }) => (
      <div className="flex gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-500 shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 leading-tight">{row.original.title}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="">Category</div>,
    cell: ({ row }) => {
      const badge = getCategoryBadge(row.original.category);
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}>
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "message",
    header: () => <div className="">Message</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-700">{row.original.message || "N/A"}</span>
        <span className="text-[10px] text-gray-400 font-medium">{row.original.user?.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => (
      <div className="text-gray-500 text-sm">
        {dayjs(row.original.createdAt).format("MMM DD, YYYY • HH:mm")}
      </div>
    ),
  }
];
