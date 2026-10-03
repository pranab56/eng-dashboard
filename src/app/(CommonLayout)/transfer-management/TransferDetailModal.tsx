"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TTransfer } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  ShieldAlert,
  User,
  X,
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

interface TransferDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transfer: ExtendedTransfer | null;
  onApprove?: (transfer: TTransfer) => void;
  onReject?: (transfer: TTransfer) => void;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending Review",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      };
    case "MANAGER_APPROVED":
      return {
        label: "Manager Approved",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: CheckCircle2,
      };
    case "APPROVED":
      return {
        label: "Approved",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      };
    case "REJECTED":
      return {
        label: "Rejected",
        className: "bg-rose-50 text-rose-700 border-rose-200",
        icon: XCircle,
      };
    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: XCircle,
      };
    default:
      return {
        label: status || "Unknown",
        className: "bg-slate-100 text-slate-700 border-slate-200",
        icon: Clock,
      };
  }
};

const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  isOpen,
  onClose,
  transfer,
  onApprove,
  onReject,
}) => {
  if (!transfer) return null;

  const statusConfig = getStatusBadge(transfer.status);
  const StatusIcon = statusConfig.icon;
  const isActionable = transfer.status === "PENDING" || transfer.status === "MANAGER_APPROVED";

  const playerInitials = `${transfer.playerFirstName?.[0] || ""}${transfer.playerLastName?.[0] || ""}`.toUpperCase() || "PL";
  const managerName = `${transfer.requestedByFirstName || ""} ${transfer.requestedByLastName || ""}`.trim() || "N/A";
  const approverName = transfer.approvedByFirstName
    ? `${transfer.approvedByFirstName} ${transfer.approvedByLastName || ""}`.trim()
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl bg-white p-0 border border-slate-200 rounded-lg shadow-lg overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900 tracking-tight">
                Transfer Details
              </DialogTitle>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${statusConfig.className}`}
              >
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ref ID: <span className="font-mono text-slate-700">{transfer.id}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Movement Summary Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              Transfer Movement
            </div>
            <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-3">
              {/* Origin Team */}
              <div className="p-3 bg-white border border-slate-200 rounded-md">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Current Club</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-500">
                    {transfer.fromTeamLogo ? (
                      <Image
                        src={formatImagePath(transfer.fromTeamLogo)}
                        alt={transfer.fromTeamName || "Club"}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {transfer.fromTeamName || "Free Agent"}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center px-1">
                <div className="w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Destination Team */}
              <div className="p-3 bg-white border border-slate-200 rounded-md">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Target Club</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-slate-500">
                    {transfer.toTeamLogo ? (
                      <Image
                        src={formatImagePath(transfer.toTeamLogo)}
                        alt={transfer.toTeamName || "Club"}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {transfer.toTeamName || "Target Club"}
                  </span>
                </div>
              </div>
            </div>

            {/* Movement metadata */}
            <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-200/80 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Type:</span>
                <span className="font-medium text-slate-800">
                  {transfer.transferType ? transfer.transferType.replace(/_/g, " ") : "Standard"}
                </span>
              </div>
              {transfer.transferFee !== undefined && transfer.transferFee !== null && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Fee:</span>
                  <span className="font-semibold text-slate-900">
                    {transfer.transferFee > 0 ? `$${transfer.transferFee.toLocaleString()}` : "Free Transfer"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Player Information Card */}
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Player Information
            </div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 font-semibold text-xs">
                {transfer.playerProfile ? (
                  <Image
                    src={formatImagePath(transfer.playerProfile)}
                    alt="Player Profile"
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{playerInitials}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {transfer.playerFirstName} {transfer.playerLastName}
                </div>
                <div className="text-xs text-slate-500 truncate">{transfer.playerEmail || "No email registered"}</div>
              </div>
            </div>
          </div>

          {/* Request & Audit Trail */}
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {/* Requester Row */}
            <div className="p-3.5 flex items-start justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Requested By</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{managerName}</div>
                <div className="text-slate-500 text-[11px]">{transfer.requestedByEmail}</div>
              </div>
            </div>

            {/* Submission Date */}
            <div className="p-3.5 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Submitted On</span>
              </div>
              <div className="font-medium text-slate-900">
                {transfer.createdAt ? dayjs(transfer.createdAt).format("MMM D, YYYY · h:mm A") : "N/A"}
              </div>
            </div>

            {/* Approver row if decided */}
            {approverName && (
              <div className="p-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Approved By</span>
                </div>
                <div className="font-semibold text-slate-900">{approverName}</div>
              </div>
            )}

            {/* Rejection notice if rejected */}
            {transfer.rejectReason && (
              <div className="p-3.5 bg-rose-50/50 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-rose-800 mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  <span>Rejection Reason</span>
                </div>
                <div className="text-slate-700 leading-relaxed pl-5">{transfer.rejectReason}</div>
              </div>
            )}

            {/* Notes if provided */}
            {transfer.notes && (
              <div className="p-3.5 text-xs">
                <div className="font-semibold text-slate-700 mb-1">Transfer Notes</div>
                <div className="text-slate-600 leading-relaxed">{transfer.notes}</div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-400">
            Last updated: {transfer.updatedAt ? dayjs(transfer.updatedAt).format("MMM D, YYYY") : "N/A"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8 px-3.5 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>

            {isActionable && onReject && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReject(transfer);
                }}
                className="h-8 px-3.5 rounded-md text-xs font-medium text-rose-700 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            )}

            {isActionable && onApprove && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onApprove(transfer);
                }}
                className="h-8 px-3.5 rounded-md text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve</span>
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferDetailModal;
