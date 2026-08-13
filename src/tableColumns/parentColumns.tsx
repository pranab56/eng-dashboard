/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { TUserManagement } from "@/types/columnTypes";
import { HiOutlineTrash } from "react-icons/hi";
import { FiEye } from "react-icons/fi";
import { formatImagePath } from "@/utils/formatImagePath";
import Image from "next/image";
import { Users, Sparkles } from "lucide-react";
import dayjs from "dayjs";

export const getParentColumns = (
  onViewParent: (parent: TUserManagement) => void,
  onDeleteParent: (parent: TUserManagement) => void
): ColumnDef<TUserManagement>[] => [
  {
    accessorKey: "userName",
    header: () => <div>Parent Account Owner</div>,
    cell: ({ row }) => {
      const profileUrl = formatImagePath(row.original.profile || row.original.profilePic);
      const name = row.original.firstName ? `${row.original.firstName} ${row.original.lastName || ''}`.trim() : (row.original.userName || row.original.name || 'Parent Account');
      const initials = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-indigo-700">{initials}</span>
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-xs">{name}</p>
            <p className="text-[11px] text-slate-500 font-medium">{row.original.email || 'No email provided'}</p>
            {row.original.phone && (
              <p className="text-[10px] text-slate-400 font-medium">{row.original.phone}</p>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "myPlayers",
    header: () => <div>Registered Child Players & Plans</div>,
    cell: ({ row }) => {
      const children = row.original.myPlayers || (row.original as any).children || [];
      if (!children || children.length === 0) {
        return (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
            No players added yet
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1.5 max-w-sm">
          {children.map((child: any, idx: number) => {
            const childName = child.firstName ? `${child.firstName} ${child.lastName || ''}`.trim() : (child.userName || `Player ${idx + 1}`);
            const childSub = child.subscription || child.activeSubscription;

            return (
              <div
                key={child._id || idx}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 shadow-2xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{childName}</span>
                  {child.position && (
                    <span className="text-[10px] text-slate-500 font-medium shrink-0">({child.position})</span>
                  )}
                </div>

                {childSub ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                    {childSub.packageName || 'Active'} • £{childSub.price}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                    Free / Unpaid
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "subscription",
    header: () => <div>Subscription Status</div>,
    cell: ({ row }) => {
      const children = row.original.myPlayers || (row.original as any).children || [];
      const paidChildren = children.filter((c: any) => Boolean(c.subscription || c.activeSubscription || c.isPaid));
      const parentDirectSub = row.original.subscription || (row.original as any).activeSubscription;

      if (paidChildren.length === 0 && !parentDirectSub) {
        return (
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            No Active Subscriptions
          </span>
        );
      }

      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 w-fit shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            {paidChildren.length} {paidChildren.length === 1 ? 'Player Subscribed' : 'Players Subscribed'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            {paidChildren.map((c: any) => `${c.firstName || 'Player'}: £${(c.subscription || c.activeSubscription)?.price ?? 10}`).join(' • ')}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div>Joined Date</div>,
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-slate-600">
        {row.original.createdAt ? dayjs(row.original.createdAt).format("MMM DD, YYYY") : "N/A"}
      </span>
    ),
  },
  {
    id: "action",
    header: () => <div>Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onViewParent(row.original)}
          className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 cursor-pointer"
          title="View Parent & Child Details"
        >
          <FiEye className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onDeleteParent(row.original)}
          className="flex items-center justify-center h-8 w-8 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200 cursor-pointer"
          title="Delete Parent Account"
        >
          <HiOutlineTrash className="size-4" />
        </button>
      </div>
    ),
  },
];
