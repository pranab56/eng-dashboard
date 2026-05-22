import { TNotification } from "@/types/columnTypes";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { Bell } from "lucide-react";

export const notificationColumns: ColumnDef<TNotification>[] = [
  {
    accessorKey: "title",
    header: () => <div className="">Notification</div>,
    cell: ({ row }) => (
      <div className="flex gap-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 leading-tight">{row.original.title}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "message",
    header: () => <div className="">Message</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium text-gray-700">{row.original.message || "N/A"}</span>
        <span className="text-[10px] text-gray-400 uppercase font-bold">{row.original.user?.email}</span>
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
]