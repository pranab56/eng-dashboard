/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TUserManagement } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import Image from "next/image";
import { Eye, Pencil, Shield, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";

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
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Member
      </div>
    ),
    cell: ({ row }) => {
      const profileUrl = formatImagePath(row.original.profile || row.original.profilePic);
      const name = row.original.firstName
        ? `${row.original.firstName} ${row.original.lastName || ""}`.trim()
        : row.original.userName || row.original.name || "N/A";
      const initials = name.charAt(0).toUpperCase();

      return (
        <div className="flex items-center gap-3 py-1">
          {/* Avatar with subtle ring & fallback */}
          <div className="relative w-9 h-9 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={name}
                fill
                sizes="36px"
                className="object-cover"
              />
            ) : (
              <span className="text-xs font-bold text-slate-600 font-mono">
                {initials}
              </span>
            )}
          </div>

          {/* Name & Subtext */}
          <div className="flex flex-col min-w-0 max-w-[200px] sm:max-w-[240px]">
            <span className="font-semibold text-xs text-slate-900 truncate" title={name}>
              {name}
            </span>
            <span className="text-[11px] text-slate-500 truncate" title={row.original.email || "Managed Player Profile"}>
              {row.original.email || "Managed Player Profile"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Role
      </div>
    ),
    cell: ({ row }) => {
      const rawRole = (row.original.role || "USER").toUpperCase();
      let roleBadgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

      if (rawRole === "PLAYER") {
        roleBadgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
      } else if (rawRole === "MANAGER") {
        roleBadgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
      } else if (rawRole === "REFEREE") {
        roleBadgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (rawRole === "OTHER_CLUBS" || rawRole === "CLUB" || rawRole === "CLUBS") {
        roleBadgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
      } else if (rawRole === "TOURNAMENT_PLAYER") {
        roleBadgeStyle = "bg-cyan-50 text-cyan-700 border-cyan-200";
      }

      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wider ${roleBadgeStyle}`}
        >
          {rawRole.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    accessorKey: "verified",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Email Status
      </div>
    ),
    cell: ({ row }) => (
      <span
        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border ${
          row.original.verified
            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
            : "text-amber-700 bg-amber-50 border-amber-200"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            row.original.verified ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span>{row.original.verified ? "Verified" : "Unverified"}</span>
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {activeRole === "INCOMPLETE" ? "Status & Reason" : "Approval Status"}
      </div>
    ),
    cell: ({ row }) => {
      if (activeRole === "INCOMPLETE") {
        const rawStatus = ((row.original as any).status || "").toUpperCase();
        const isVerified = row.original.verified;
        const currentStatus = rawStatus || (isVerified ? "PENDING" : "UNVERIFIED");
        const reason = (row.original as any).incompleteReason || "Incomplete Registration Setup";

        return (
          <div className="flex flex-col gap-1 items-start">
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                currentStatus === "APPROVED"
                  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                  : currentStatus === "REJECTED"
                  ? "text-rose-700 bg-rose-50 border-rose-200"
                  : currentStatus === "UNVERIFIED" || !isVerified
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : "text-blue-700 bg-blue-50 border-blue-200"
              }`}
            >
              {currentStatus}
            </span>
            <span className="text-[10px] text-rose-600 font-medium bg-rose-50/70 px-1.5 py-0.5 rounded border border-rose-100 max-w-[160px] truncate" title={reason}>
              {reason}
            </span>
          </div>
        );
      }

      const role = (row.original as any).role || "";
      const requiresApproval =
        ["PLAYER", "MANAGER", "REFEREE", "OTHER_CLUBS", "CLUB"].includes(role.toUpperCase()) ||
        !!row.original.parentId;
      const currentStatus = (
        (row.original as any).status || (requiresApproval ? "PENDING" : "APPROVED")
      ).toUpperCase();
      const isApproved = currentStatus === "APPROVED";

      // Interactive toggle only under PENDING_REQUESTS tab
      if (activeRole === "PENDING_REQUESTS") {
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onUpdateUserStatus(row.original._id, isApproved ? "REJECTED" : "APPROVED")}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isApproved ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isApproved ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-xs font-semibold ${
                isApproved
                  ? "text-emerald-600"
                  : currentStatus === "REJECTED"
                  ? "text-rose-600"
                  : "text-amber-600"
              }`}
            >
              {currentStatus}
            </span>
          </div>
        );
      }

      // If does not require approval
      if (!requiresApproval) {
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Active</span>
          </span>
        );
      }

      // Requires approval
      return (
        <div className="flex flex-col gap-0.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border w-fit ${
              isApproved
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : currentStatus === "REJECTED"
                ? "text-rose-700 bg-rose-50 border-rose-200"
                : "text-amber-700 bg-amber-50 border-amber-200"
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ) : currentStatus === "REJECTED" ? (
              <XCircle className="w-3 h-3 text-rose-600" />
            ) : (
              <Clock className="w-3 h-3 text-amber-600" />
            )}
            <span>{currentStatus}</span>
          </span>
          {currentStatus === "REJECTED" && (row.original as any).rejectionReason && (
            <span
              className="text-[10px] text-rose-600 font-medium truncate max-w-[140px]"
              title={(row.original as any).rejectionReason}
            >
              {(row.original as any).rejectionReason}
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">
        Actions
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        {onViewUser && (
          <button
            type="button"
            onClick={() => onViewUser(row.original)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Inspect Details & Verification Documents"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        {onEditProfile && (
          <button
            type="button"
            onClick={() => onEditProfile(row.original)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
            title="Edit Profile Picture & Details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        )}
        {onAssignTeams && row.original.role === "MANAGER" && (
          <button
            type="button"
            onClick={() => onAssignTeams(row.original)}
            className="p-1.5 rounded-md text-purple-600 hover:text-purple-800 hover:bg-purple-50 transition-colors cursor-pointer border border-transparent hover:border-purple-200"
            title="Assign Teams to Manager"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onDeleteUser(row.original._id)}
          className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
          title="Delete User Account"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];

export default getUsersColumns;
