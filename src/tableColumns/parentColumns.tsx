/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { TUserManagement } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { Eye, Trash2, User, CheckCircle2 } from "lucide-react";
import dayjs from "dayjs";

export const getParentColumns = (
  onViewParent: (parent: TUserManagement) => void,
  onDeleteParent: (parent: TUserManagement) => void
): ColumnDef<TUserManagement>[] => [
  {
    accessorKey: "userName",
    header: () => <div className="min-w-[200px] text-slate-700 font-semibold text-xs">Parent Account Owner</div>,
    cell: ({ row }) => {
      const profileUrl = formatImagePath(row.original.profile || row.original.profilePic);
      const name = row.original.firstName
        ? `${row.original.firstName} ${row.original.lastName || ""}`.trim()
        : (row.original.userName || row.original.name || "Parent Account");
      const initials = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
          <div className="relative h-8 w-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                sizes="32px"
                className="object-cover"
              />
            ) : (
              <span className="text-[11px] font-semibold text-slate-600 uppercase select-none">
                {initials}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-xs truncate max-w-[180px]">{name}</p>
            <p className="text-[11px] text-slate-400 font-normal truncate max-w-[180px]">
              {row.original.email || "No email provided"}
            </p>
            {row.original.phone && (
              <p className="text-[10px] text-slate-400 font-normal tabular-nums">{row.original.phone}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "myPlayers",
    header: () => <div className="min-w-[240px] text-slate-700 font-semibold text-xs">Linked Children & Plans</div>,
    cell: ({ row }) => {
      const children = row.original.myPlayers || (row.original as any).children || [];
      if (!children || children.length === 0) {
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            No players added
          </span>
        );
      }

      const displayChildren = children.slice(0, 3);
      const remainingCount = children.length - 3;

      return (
        <div className="flex flex-col gap-1.5 min-w-[240px] max-w-[340px] py-1">
          {displayChildren.map((child: any, idx: number) => {
            const childName = child.firstName
              ? `${child.firstName} ${child.lastName || ""}`.trim()
              : (child.userName || `Player ${idx + 1}`);
            const childSub = child.subscription || child.activeSubscription;

            return (
              <div
                key={child._id || idx}
                className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <User className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="font-medium text-slate-800 truncate text-[11px]">{childName}</span>
                  {child.position && (
                    <span className="text-[10px] text-slate-400 shrink-0">({child.position})</span>
                  )}
                </div>

                {childSub ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {childSub.packageName || "Active"} • £{childSub.price}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    Free / Unpaid
                  </span>
                )}
              </div>
            );
          })}
          {remainingCount > 0 && (
            <span className="text-[10px] font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 w-fit">
              +{remainingCount} more player{remainingCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription",
    header: () => <div className="min-w-[170px] text-slate-700 font-semibold text-xs">Subscription Entitlement</div>,
    cell: ({ row }) => {
      const children = row.original.myPlayers || (row.original as any).children || [];
      const paidChildren = children.filter((c: any) => Boolean(c.subscription || c.activeSubscription || c.isPaid));
      const parentDirectSub = row.original.subscription || (row.original as any).activeSubscription;

      if (paidChildren.length === 0 && !parentDirectSub) {
        return (
          <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
            No Active Plan
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1 min-w-[170px] py-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            {paidChildren.length} {paidChildren.length === 1 ? "Player Subscribed" : "Players Subscribed"}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {paidChildren.map((c: any) => `${c.firstName || "Player"}: £${(c.subscription || c.activeSubscription)?.price ?? 10}`).join(" • ")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="min-w-[110px] text-slate-700 font-semibold text-xs">Joined Date</div>,
    cell: ({ row }) => (
      <span className="text-xs font-medium text-slate-600 whitespace-nowrap tabular-nums">
        {row.original.createdAt ? dayjs(row.original.createdAt).format("MMM DD, YYYY") : "N/A"}
      </span>
    ),
  },
  {
    id: "action",
    header: () => <div className="text-right pr-4 text-slate-700 font-semibold text-xs">Actions</div>,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1 pr-2">
        <button
          type="button"
          onClick={() => onViewParent(row.original)}
          className="flex items-center justify-center h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          title="View Parent & Child Details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDeleteParent(row.original)}
          className="flex items-center justify-center h-7 w-7 rounded border border-slate-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
          title="Delete Parent Account"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];
