/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { TUserManagement } from "@/types/columnTypes";
import { HiOutlineTrash } from "react-icons/hi";
import { FiEye, FiEdit } from "react-icons/fi";
import { formatImagePath } from "@/utils/formatImagePath";
import Image from "next/image";
import { Shield } from "lucide-react";

export const getUsersColumns = (
  onToggleVerified: (id: string) => void,
  onUpdateUserStatus: (id: string, status: "APPROVED" | "REJECTED") => void,
  onDeleteUser: (id: string) => void,
  onViewUser: (user: TUserManagement) => void,
  onAssignTeams: (user: TUserManagement) => void,
  activeRole?: string,
  onEditProfile?: (user: TUserManagement) => void
): ColumnDef<TUserManagement>[] => [
  {
    accessorKey: "userName",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => {
      const profileUrl = formatImagePath(row.original.profile || row.original.profilePic);
      const name = row.original.firstName ? `${row.original.firstName} ${row.original.lastName || ''}`.trim() : (row.original.userName || row.original.name || 'N/A');
      const initials = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-slate-600">{initials}</span>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{name}</p>
            <p className="text-[11px] text-slate-500">{row.original.email || 'Managed Player Profile'}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => <div className="">Role</div>,
    cell: ({ row }) => (
      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
        {row.original.role ? row.original.role.replace(/_/g, ' ') : 'USER'}
      </span>
    ),
  },
  {
    accessorKey: "verified",
    header: () => <div className="">Email Verified</div>,
    cell: ({ row }) => (
      <span
        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          row.original.verified
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-amber-700 bg-amber-50 border-amber-200"
        }`}
      >
        {row.original.verified ? "Verified" : "Unverified"}
      </span>
    ),
  },

  {
    accessorKey: "status",
    header: () => <div className="">Approval Status</div>,
    cell: ({ row }) => {
      const role = (row.original.role || "").toUpperCase();
      const requiresApproval = ["PLAYER", "MANAGER", "REFEREE", "OTHER_CLUBS", "CLUB"].includes(role) || !!row.original.parentId;
      const currentStatus = (row.original.status || (requiresApproval ? "PENDING" : "APPROVED")).toUpperCase();
      const isApproved = currentStatus === "APPROVED";

      // Show interactive approval toggle ONLY under PENDING_REQUESTS tab
      if (activeRole === "PENDING_REQUESTS") {
        return (
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={isApproved}
                onChange={() => onUpdateUserStatus(row.original._id, isApproved ? "REJECTED" : "APPROVED")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
            <span className={`text-xs font-semibold ${isApproved ? 'text-green-600' : currentStatus === 'REJECTED' ? 'text-red-500' : 'text-amber-500'}`}>
              {currentStatus}
            </span>
          </div>
        );
      }

      // For accounts not requiring approval (Parent accounts): display Active
      if (!requiresApproval) {
        return (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Active
          </span>
        );
      }

      // For roles requiring approval (REFEREE, MANAGER, CLUB, PLAYER): display actual status
      return (
        <div className="flex flex-col gap-0.5">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${
              isApproved
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : currentStatus === 'REJECTED'
                ? 'text-rose-700 bg-rose-50 border-rose-200'
                : 'text-amber-700 bg-amber-50 border-amber-200'
            }`}
          >
            {currentStatus}
          </span>
          {currentStatus === 'REJECTED' && (row.original as any).rejectionReason && (
            <span className="text-[10px] text-rose-600 font-medium truncate max-w-[120px]" title={(row.original as any).rejectionReason}>
              Reason: {(row.original as any).rejectionReason}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {onViewUser && (
          <button
            type="button"
            onClick={() => onViewUser(row.original)}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors duration-200 cursor-pointer"
            title="Inspect Details & Verification Documents"
          >
            <FiEye className="size-4" />
          </button>
        )}
        {onEditProfile && (
          <button
            type="button"
            onClick={() => onEditProfile(row.original)}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors duration-200 cursor-pointer"
            title="Edit Profile Picture & Details"
          >
            <FiEdit className="size-4" />
          </button>
        )}
        {onAssignTeams && row.original.role === "MANAGER" && (
          <button
            type="button"
            onClick={() => onAssignTeams(row.original)}
            className="flex items-center justify-center h-8 w-8 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors duration-200 cursor-pointer"
            title="Assign Teams to Manager"
          >
            <Shield className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteUser(row.original._id)}
          className="flex items-center justify-center h-8 w-8 rounded-md bg-red-50 hover:bg-red-100 text-red-600 transition-colors duration-200 cursor-pointer"
          title="Delete User"
        >
          <HiOutlineTrash className="size-5" />
        </button>
      </div>
    ),
  }
];