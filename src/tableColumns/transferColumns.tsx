"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TTransfer } from "@/types/columnTypes";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  ArrowRight,
  Eye,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
} from "lucide-react";
import dayjs from "dayjs";

export type ExtendedTransfer = TTransfer & {
  fromTeamLogo?: string;
  toTeamLogo?: string;
  transferFee?: number;
  notes?: string;
  effectiveDate?: string;
};

interface TransferColumnsProps {
  onApprove: (transfer: TTransfer) => void;
  onReject: (transfer: TTransfer) => void;
  onViewDetails: (transfer: ExtendedTransfer) => void;
}

export const getTransferColumns = ({
  onApprove,
  onReject,
  onViewDetails,
}: TransferColumnsProps): ColumnDef<ExtendedTransfer>[] => [
  {
    accessorKey: "playerFirstName",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Player
      </div>
    ),
    cell: ({ row }) => {
      const { playerFirstName, playerLastName, playerEmail, playerProfile } = row.original;
      const initials = `${playerFirstName?.[0] || ""}${playerLastName?.[0] || ""}`.toUpperCase() || "PL";

      return (
        <div className="flex items-center gap-2.5 py-1">
          <div className="w-8 h-8 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 font-semibold text-[11px]">
            {playerProfile ? (
              <Image
                src={formatImagePath(playerProfile)}
                alt="player"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-xs text-slate-900 truncate">
              {playerFirstName} {playerLastName}
            </span>
            <span className="text-[11px] text-slate-500 truncate">
              {playerEmail || "No email"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "movement",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Transfer Movement
      </div>
    ),
    cell: ({ row }) => {
      const { fromTeamName, toTeamName, fromTeamLogo, toTeamLogo } = row.original;
      const isFreeAgent = !fromTeamName || fromTeamName.toLowerCase().includes("free agent");

      return (
        <div className="flex items-center gap-1.5 text-xs">
          {/* Origin */}
          <div className="flex items-center gap-1.5 max-w-[130px]">
            {isFreeAgent ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Free Agent
              </span>
            ) : (
              <>
                <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
                  {fromTeamLogo ? (
                    <Image
                      src={formatImagePath(fromTeamLogo)}
                      alt={fromTeamName}
                      width={16}
                      height={16}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-2.5 h-2.5" />
                  )}
                </div>
                <span className="font-medium text-slate-700 truncate" title={fromTeamName}>
                  {fromTeamName}
                </span>
              </>
            )}
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mx-0.5" />

          {/* Destination */}
          <div className="flex items-center gap-1.5 max-w-[130px]">
            <div className="w-4 h-4 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-400">
              {toTeamLogo ? (
                <Image
                  src={formatImagePath(toTeamLogo)}
                  alt={toTeamName || "Club"}
                  width={16}
                  height={16}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-2.5 h-2.5" />
              )}
            </div>
            <span className="font-semibold text-slate-900 truncate" title={toTeamName}>
              {toTeamName || "Unknown Club"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "transferType",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Type & Fee
      </div>
    ),
    cell: ({ row }) => {
      const type = row.original.transferType;
      const fee = row.original.transferFee;
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-700 text-[11px]">
            {type ? type.replace(/_/g, " ") : "Standard"}
          </span>
          <span className="text-[11px] text-slate-500">
            {fee !== undefined && fee !== null && fee > 0 ? `$${fee.toLocaleString()}` : "Free Transfer"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "requestedByFirstName",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Requested By
      </div>
    ),
    cell: ({ row }) => {
      const managerName = `${row.original.requestedByFirstName || ""} ${row.original.requestedByLastName || ""}`.trim();
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800 truncate max-w-[140px]">
            {managerName || "System / Club"}
          </span>
          <span className="text-[10px] text-slate-400">
            {row.original.createdAt ? dayjs(row.original.createdAt).format("MMM D, YYYY") : "N/A"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Status
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status;

      let badgeClasses = "bg-slate-50 text-slate-700 border-slate-200";
      let IconComponent = Clock;
      let label = status ? status.replace(/_/g, " ") : "N/A";

      if (status === "PENDING") {
        badgeClasses = "bg-amber-50 text-amber-700 border-amber-200";
        IconComponent = Clock;
        label = "Pending Review";
      } else if (status === "MANAGER_APPROVED") {
        badgeClasses = "bg-blue-50 text-blue-700 border-blue-200";
        IconComponent = CheckCircle2;
        label = "Manager Approved";
      } else if (status === "APPROVED") {
        badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
        IconComponent = CheckCircle2;
        label = "Approved";
      } else if (status === "REJECTED") {
        badgeClasses = "bg-rose-50 text-rose-700 border-rose-200";
        IconComponent = XCircle;
        label = "Rejected";
      } else if (status === "WITHDRAWN") {
        badgeClasses = "bg-slate-100 text-slate-600 border-slate-200";
        IconComponent = XCircle;
        label = "Withdrawn";
      }

      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${badgeClasses}`}
        >
          <IconComponent className="w-3 h-3" />
          <span>{label}</span>
        </span>
      );
    },
  },
  {
    id: "action",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider text-right pr-2">
        Action
      </div>
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const isActionable = status === "PENDING" || status === "MANAGER_APPROVED";

      return (
        <div className="flex items-center justify-end gap-1.5 pr-2">
          {/* View Details Button */}
          <button
            type="button"
            onClick={() => onViewDetails(row.original)}
            className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Quick Actions for Pending / Manager Approved */}
          {isActionable && (
            <>
              <button
                type="button"
                onClick={() => onApprove(row.original)}
                className="w-7 h-7 rounded border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Approve Transfer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={() => onReject(row.original)}
                className="w-7 h-7 rounded border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Reject Transfer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </>
          )}
        </div>
      );
    },
  },
];
