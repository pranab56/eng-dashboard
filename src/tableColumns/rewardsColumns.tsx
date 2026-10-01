/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import Link from "next/link";
import { Eye, Pencil, Trash2, QrCode, Users, Coffee, Package } from "lucide-react";
import { formatImagePath } from "../utils/formatImagePath";

export const getRewardsColumns = (
  onView: (reward: any) => void,
  onDelete: (id: string) => void,
  onShowQr?: (reward: any) => void,
  onShowHistory?: (reward: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "brand",
    header: () => <span className="font-semibold text-xs text-slate-700">Reward Item</span>,
    cell: ({ row }) => {
      const reward = row.original;
      const isCoffee = reward.productType === "Coffee";
      const imageSrc = reward.image ? formatImagePath(reward.image) : null;

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-md border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={reward.brand || "Reward"}
                fill
                className="object-contain p-1"
              />
            ) : isCoffee ? (
              <Coffee className="w-5 h-5 text-amber-600" />
            ) : (
              <Package className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
              {reward.brand}
            </p>
            <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
              {isCoffee ? "Instant QR Code" : "Physical Merchandise"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "productType",
    header: () => <span className="font-semibold text-xs text-slate-700">Category</span>,
    cell: ({ row }) => {
      const isCoffee = row.original.productType === "Coffee";
      return (
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
              isCoffee
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {isCoffee ? (
              <>
                <Coffee className="w-3 h-3 text-amber-600" />
                <span>Coffee</span>
              </>
            ) : (
              <>
                <Package className="w-3 h-3 text-slate-500" />
                <span>Merchandise</span>
              </>
            )}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "point",
    header: () => <span className="font-semibold text-xs text-slate-700">Points Cost</span>,
    cell: ({ row }) => {
      const point = row.original.point ?? 0;
      const formatted = Number(point).toLocaleString();
      return (
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-xs sm:text-sm text-slate-900 tabular-nums">
            {formatted}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">pts</span>
        </div>
      );
    },
  },
  {
    id: "claims",
    header: () => <span className="font-semibold text-xs text-slate-700">Redemptions</span>,
    cell: ({ row }) => {
      const reward = row.original;
      const isCoffee = reward.productType === "Coffee";
      const count = Array.isArray(reward.redeemedUsers) ? reward.redeemedUsers.length : 0;

      if (isCoffee) {
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 tabular-nums">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{count} claims</span>
          </span>
        );
      }

      return (
        <span className="text-xs text-slate-400 font-medium">
          Order dispatch
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-xs text-slate-700">Status</span>,
    cell: ({ row }) => {
      const status = (row.getValue("status") as string) || "publish";
      const isPublished = status.toLowerCase() === "publish" || status.toLowerCase() === "active";

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
            isPublished
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "action",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => {
      const reward = row.original;
      const isCoffee = reward.productType === "Coffee";

      return (
        <div className="flex items-center justify-end gap-1">
          {onShowQr && isCoffee && (
            <button
              type="button"
              onClick={() => onShowQr(reward)}
              title="View QR Code"
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-700" />
            </button>
          )}

          {onShowHistory && isCoffee && (
            <button
              type="button"
              onClick={() => onShowHistory(reward)}
              title="Redeemed Users History"
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-slate-600" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onView(reward)}
            title="View Details"
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          <Link href={`/rewards-redemption/create-reward/?id=${reward._id}`}>
            <button
              type="button"
              title="Edit Reward"
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(reward._id)}
            title="Delete Reward"
            className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
