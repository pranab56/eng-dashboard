import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { PiEyeBold } from "react-icons/pi";
import { TUser } from "@/types/columnTypes";


export const subscribersColumns: ColumnDef<TUser>[] = [
  {
    accessorKey: "id",
    header: () => <div className="text-center">No.</div>,
    cell: ({ row }) => (
      <div className="capitalize text-center">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-center">Name</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: () => <div className="text-center">Email</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("email")}</div>
    ),
  },
  {
    accessorKey: "number",
    header: () => <div className="text-center">Contact No</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("number")}</div>
    ),
  },
  {
    accessorKey: "location",
    header: () => <div className="text-center">Location</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("location")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center">Status</div>,
    cell: ({ row }) => (
      <div className={`capitalize text-center text-semibold text-white hover:text-gray-100 transition-colors duration-300 py-2 cursor-pointer ${row.getValue("status") === "Active" ? "bg-green-500" : "bg-red-500"}`}>{row.getValue("status")}</div>
    ),
  },
  {
    id: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        <Link href={`/subscriber-list/${row.getValue("id")}`} className="flex items-center justify-center h-9 w-9 bg-gray-500 hover:bg-gray-600 transition-colors duration-300  cursor-pointer">
          <PiEyeBold className="text-2xl font-bold text-white transition-colors duration-300" />
        </Link>
      </div>
    ),
  }
]