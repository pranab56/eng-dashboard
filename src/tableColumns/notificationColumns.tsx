import { ColumnDef } from "@tanstack/react-table"
import { TNotification } from "@/types/columnTypes";
import { TfiReload } from "react-icons/tfi";
import { PiUsersThreeLight } from "react-icons/pi";

const switchNotificationType = (type: string) => {
  switch (type) {
    case "Transfer Alert":
      return <span className="bg-blue-100 inline-block p-2 rounded-sm">
        <PiUsersThreeLight className="text-blue-500" size={20} />
      </span>;
    case "Feature":
      return <span className="bg-green-100 inline-block p-2 rounded-sm">
        <TfiReload className="text-green-500" size={20} />
      </span>;
    default:
      return <span className="bg-gray-100 inline-block p-2 rounded-sm">
        <TfiReload className="text-gray-500" size={20} />
      </span>;
  }
}

export const notificationColumns: ColumnDef<TNotification>[] = [
  {
    accessorKey: "title",
    header: () => <div className="">Notification</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex gap-2">
          <p>
            {switchNotificationType(row.getValue("type"))}
          </p>
          <p className="flex flex-col flex-start items-start ">
            <span className="font-semibold">{row.getValue("title")}</span>
            <span className="text-[12px] text-gray-400">{row.original.subtitle}</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => (
      <div className="">{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: () => <div className="">Date</div>,
    cell: ({ row }) => (
      <div className="">{row.getValue("date")}</div>
    ),
  }
]