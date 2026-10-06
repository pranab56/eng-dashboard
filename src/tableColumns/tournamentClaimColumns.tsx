import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import React, { useState } from "react";
import { TTournamentClaim } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Trophy,
  FileText,
  ChevronsUpDown,
  Check,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function StatusCell({
  claimId,
  currentStatus,
  onStatusUpdate,
  isUpdating,
}: {
  claimId: string;
  currentStatus: string;
  onStatusUpdate: (id: string, status: "approved" | "rejected" | "pending") => void;
  isUpdating: boolean;
}) {
  const [open, setOpen] = useState(false);
  const status = (currentStatus || "pending").toLowerCase();

  let badgeStyle =
    "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80";
  if (status === "approved") {
    badgeStyle =
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80";
  } else if (status === "rejected") {
    badgeStyle =
      "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/80";
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isUpdating}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wide border flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 ${badgeStyle}`}
          title="Click to update status"
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <span className="capitalize">{status}</span>
              <ChevronsUpDown className="w-3 h-3 opacity-50 shrink-0" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1 bg-white border border-slate-200 shadow-lg rounded-lg z-50">
        {[
          { label: "Approved", value: "approved", color: "text-emerald-700" },
          { label: "Pending", value: "pending", color: "text-amber-700" },
          { label: "Rejected", value: "rejected", color: "text-rose-700" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onStatusUpdate(claimId, opt.value as any);
              setOpen(false);
            }}
            className={`w-full px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${
              status === opt.value
                ? "bg-slate-900 text-white font-medium"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className={status === opt.value ? "text-white" : opt.color}>
              {opt.label}
            </span>
            {status === opt.value && <Check className="w-3.5 h-3.5 text-white" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export const getTournamentClaimColumns = (
  onView: (claim: TTournamentClaim) => void,
  onStatusUpdate: (id: string, status: "approved" | "rejected" | "pending") => void,
  updatingId: string | null
): ColumnDef<TTournamentClaim>[] => [
  {
    accessorKey: "user",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Participant</div>,
    cell: ({ row }) => {
      const user = row.original.user;
      const profilePic = user?.profile ? formatImagePath(user.profile) : null;
      const initials = (user?.userName || "U")
        .substring(0, 2)
        .toUpperCase();

      return (
        <div className="flex items-center gap-3 py-1">
          {profilePic ? (
            <Image
              src={profilePic}
              alt={user?.userName || "User"}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs shrink-0">
              {initials}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight truncate">
                {user?.userName || "Anonymous"}
              </span>
              {user?.role && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {user.role}
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-normal truncate mt-0.5">
              {user?.email || "No email available"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "tournament",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Tournament</div>,
    cell: ({ row }) => {
      const tournament = row.original.tournament;
      return (
        <div className="flex items-center gap-2.5 py-1 max-w-[260px]">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            <Trophy className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-medium text-slate-900 text-xs leading-snug truncate">
              {tournament?.title || "N/A"}
            </span>
            {tournament?.startDate && tournament?.endDate ? (
              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                {dayjs(tournament.startDate).format("DD MMM")} &ndash;{" "}
                {dayjs(tournament.endDate).format("DD MMM YYYY")}
              </span>
            ) : tournament?.description ? (
              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                {tournament.description}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "claimedPositionName",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Claimed Placement</div>,
    cell: ({ row }) => {
      const claim = row.original;
      const pos = claim.claimedPosition;

      // Restrained position badges without emojis
      let badgeTheme = "bg-slate-100 text-slate-700 border-slate-200";
      if (pos === 1) {
        badgeTheme = "bg-amber-50 text-amber-800 border-amber-200 font-bold";
      } else if (pos === 2) {
        badgeTheme = "bg-slate-100 text-slate-800 border-slate-300 font-semibold";
      } else if (pos === 3) {
        badgeTheme = "bg-orange-50 text-orange-800 border-orange-200 font-semibold";
      }

      return (
        <div className="flex items-center gap-2 font-medium text-xs">
          <span
            className={`px-2 py-0.5 rounded-md border text-[11px] font-mono ${badgeTheme}`}
          >
            #{pos || "—"}
          </span>
          <span className="text-slate-800 font-medium">
            {claim.claimedPositionName || `Rank ${pos}`}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "proofNotes",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Verification Notes</div>,
    cell: ({ row }) => {
      const notes = row.getValue("proofNotes") as string;
      return (
        <div className="flex items-start gap-1.5 max-w-[220px]">
          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <span className="text-xs text-slate-600 line-clamp-2 font-normal">
            {notes ? notes : <span className="text-slate-400 italic">No notes provided</span>}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</div>,
    cell: ({ row }) => {
      const claim = row.original;
      const claimId = claim._id || claim.id || "";
      const isUpdatingThis = updatingId === claimId;

      return (
        <StatusCell
          claimId={claimId}
          currentStatus={claim.status}
          onStatusUpdate={onStatusUpdate}
          isUpdating={isUpdatingThis}
        />
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Submitted</div>,
    cell: ({ row }) => {
      const dateStr = row.getValue("createdAt") as string;
      return (
        <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
          {dateStr ? dayjs(dateStr).format("DD MMM YYYY, HH:mm") : "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</div>,
    cell: ({ row }) => {
      const claim = row.original;
      const claimId = claim._id || claim.id || "";
      const isUpdatingThis = updatingId === claimId;
      const status = (claim.status || "pending").toLowerCase();

      return (
        <div className="flex items-center justify-end gap-1.5 pr-1">
          {/* Quick Approve Button */}
          {status !== "approved" && (
            <button
              type="button"
              disabled={isUpdatingThis}
              onClick={() => onStatusUpdate(claimId, "approved")}
              className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Approve Claim"
            >
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">Approve</span>
            </button>
          )}

          {/* Quick Reject Button */}
          {status !== "rejected" && (
            <button
              type="button"
              disabled={isUpdatingThis}
              onClick={() => onStatusUpdate(claimId, "rejected")}
              className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Reject Claim"
            >
              <X className="w-3 h-3" />
              <span className="hidden sm:inline">Reject</span>
            </button>
          )}

          {/* View Details Button */}
          <button
            type="button"
            onClick={() => onView(claim)}
            className="h-7 w-7 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-center border border-transparent hover:border-slate-200"
            title="View Claim Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
