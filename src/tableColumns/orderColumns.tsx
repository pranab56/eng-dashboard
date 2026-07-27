import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { IoIosCheckboxOutline } from "react-icons/io";
import { MdCancelPresentation } from "react-icons/md";
import { TOrder } from "@/types/columnTypes";

export const getOrderColumns = (
  onAccept: (id: string) => void,
  onReject: (id: string) => void,
  isAccepting?: boolean,
  isRejecting?: boolean
): ColumnDef<TOrder>[] => [
  {
    accessorKey: "userName",
    header: () => <div>User</div>,
    cell: ({ row }) => {
      const order = row.original;
      const displayName = order.userName || `${order.firstName || ''} ${order.lastName || ''}`.trim() || "User";
      return (
        <span className="font-semibold text-gray-900">{displayName}</span>
      );
    },
  },
  {
    accessorKey: "brandName",
    header: () => <div>Brand / Item</div>,
    cell: ({ row }) => (
      <div className="font-medium text-gray-800">
        {row.original.brandName || "N/A"}
      </div>
    ),
  },
  {
    accessorKey: "point",
    header: () => <div>Points Used</div>,
    cell: ({ row }) => {
      const pts = row.original.pointUsed ?? row.original.point ?? 0;
      return (
        <div className="flex items-center gap-1.5 font-bold text-amber-700">
          <span className="text-sm">🪙</span>
          <span>{pts.toLocaleString()} Pts</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div>Status</div>,
    cell: ({ row }) => {
      const status = (row.original.status || "pending").toLowerCase();
      let badgeStyle = "bg-amber-50 text-amber-600 border-amber-200";
      if (status === "approved" || status === "accept") {
        badgeStyle = "bg-green-50 text-green-600 border-green-200";
      } else if (status === "rejected" || status === "reject") {
        badgeStyle = "bg-red-50 text-red-600 border-red-200";
      }

      return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${badgeStyle}`}>
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => <div>Date</div>,
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
      const order = row.original;
      const orderId = order.id || order._id || "";
      const isPending = (order.status || "").toLowerCase() === "pending";

      return (
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isPending || isAccepting}
            onClick={() => isPending && onAccept(orderId)}
            className={`flex items-center justify-center h-9 w-9 rounded-md transition-all ${
              isPending
                ? "bg-green-100 hover:bg-green-200 text-green-800 cursor-pointer"
                : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
            }`}
            title={isPending ? "Approve Order" : "Only pending orders can be approved"}
          >
            <IoIosCheckboxOutline className="size-5 font-bold" />
          </button>

          <button
            type="button"
            disabled={!isPending || isRejecting}
            onClick={() => isPending && onReject(orderId)}
            className={`flex items-center justify-center h-9 w-9 rounded-md transition-all ${
              isPending
                ? "bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer"
                : "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
            }`}
            title={isPending ? "Reject Order" : "Only pending orders can be rejected"}
          >
            <MdCancelPresentation className="size-5 font-bold" />
          </button>
        </div>
      );
    },
  },
];
