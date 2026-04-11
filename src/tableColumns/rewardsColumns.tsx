import { ColumnDef } from "@tanstack/react-table"
import { TReward } from "@/types/columnTypes";
import Image from "next/image";

const statusStyle = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-500";
    case "Inactive":
      return "bg-blue-100 text-blue-500";
    default:
      return "bg-gray-500";
  }
};

export const rewardsColumns: ColumnDef<TReward>[] = [
  {
    accessorKey: "rewardName",
    header: () => <div className="">Reward Name</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Image src={row.original.image} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-md border-2 border-white" />
        <p className="flex items-center">
          <span className="font-semibold">{row.getValue("rewardName")}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: () => <div className="">Type</div>,
    cell: ({ row }) => (
      <div className={`px-4 py-1 rounded-full bg-gray-100 inline-block `}>{row.getValue("type")}</div>
    ),
  },
  {
    accessorKey: "pointsRequired",
    header: () => <div className="">Required Points</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md`}>{row.getValue("pointsRequired")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md inline-block ${statusStyle(row.getValue("status"))}`}>{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "usage",
    header: () => <div className="">Usage</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md`}>{row.getValue("usage")}</div>
    ),
  },
]