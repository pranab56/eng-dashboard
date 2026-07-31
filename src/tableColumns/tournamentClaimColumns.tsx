import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import React, { useState } from "react";
import { FiEye, FiCheck, FiX } from "react-icons/fi";
import { TTournamentClaim } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { Trophy, User as UserIcon, FileText, ChevronsUpDown, Check, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
  if (status === "approved") {
    badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
  } else if (status === "rejected") {
    badgeStyle = "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={isUpdating}
          className={`px-3 py-1 rounded-full text-[10px] font-medium . tracking-wider border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${badgeStyle}`}
          title="Click to change status"
        >
          {isUpdating ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <>
              <span>{status}</span>
              <ChevronsUpDown className="w-3 h-3 shrink-0 opacity-60" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-36 p-1 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
        {[
          { label: "Approved", value: "approved", color: "text-emerald-600 font-medium" },
          { label: "Rejected", value: "rejected", color: "text-red-600 font-medium" },
          { label: "Pending", value: "pending", color: "text-amber-600 font-medium" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onStatusUpdate(claimId, opt.value as any);
              setOpen(false);
            }}
            className={`w-full px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${status === opt.value
              ? "bg-black text-white font-medium"
              : "text-gray-700 hover:bg-gray-100"
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
      header: () => <div className="">User Info</div>,
      cell: ({ row }) => {
        const user = row.original.user;
        const profilePic = user?.profile ? formatImagePath(user.profile) : null;

        return (
          <div className="flex items-center gap-3 py-1">
            {profilePic ? (
              <Image
                src={profilePic}
                alt={user?.userName || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-medium shrink-0">
                <UserIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}

            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 text-sm leading-tight truncate">
                {user?.userName || "N/A"}
              </span>
              <span className="text-xs text-gray-400 font-normal truncate mt-0.5">
                {user?.email || "N/A"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tournament",
      header: () => <div className="">Tournament</div>,
      cell: ({ row }) => {
        const tournament = row.original.tournament;
        return (
          <div className="flex items-center gap-2.5 py-1 max-w-[240px]">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-gray-900 text-xs leading-snug truncate">
                {tournament?.title || "N/A"}
              </span>
              {tournament?.description && (
                <span className="text-[11px] text-gray-400 truncate mt-0.5">
                  {tournament.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "claimedPositionName",
      header: () => <div className="">Claimed Rank</div>,
      cell: ({ row }) => {
        const claim = row.original;
        let badgeIcon = "#" + claim.claimedPosition;
        if (claim.claimedPosition === 1) badgeIcon = "🥇";
        else if (claim.claimedPosition === 2) badgeIcon = "🥈";
        else if (claim.claimedPosition === 3) badgeIcon = "🥉";

        return (
          <div className="flex items-center gap-1.5 font-medium text-xs">
            <span className="text-base">{badgeIcon}</span>
            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md">
              {claim.claimedPositionName || `Rank ${claim.claimedPosition}`}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "proofNotes",
      header: () => <div className="">Proof / Notes</div>,
      cell: ({ row }) => {
        const notes = row.getValue("proofNotes") as string;
        return (
          <div className="flex items-start gap-1.5 max-w-[220px]">
            <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
            <span className="text-xs text-gray-600 line-clamp-2 italic font-normal">
              {notes ? `"${notes}"` : "No proof notes provided"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="">Status</div>,
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
      header: () => <div className="">Submitted At</div>,
      cell: ({ row }) => {
        const dateStr = row.getValue("createdAt") as string;
        return (
          <span className="text-xs text-gray-500 font-medium">
            {dateStr ? dayjs(dateStr).format("DD MMM YYYY, hh:mm A") : "N/A"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4">Action</div>,
      cell: ({ row }) => {
        const claim = row.original;
        const claimId = claim._id || claim.id || "";
        const isUpdatingThis = updatingId === claimId;

        return (
          <div className="flex items-center justify-end gap-2 pr-2">
            {/* Quick Approve Button */}
            <button
              type="button"
              disabled={isUpdatingThis}
              onClick={() => onStatusUpdate(claimId, "approved")}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Approve Claim"
            >
              <FiCheck className="w-3.5 h-3.5" />
              <span>Approve</span>
            </button>

            {/* Quick Reject Button */}
            <button
              type="button"
              disabled={isUpdatingThis}
              onClick={() => onStatusUpdate(claimId, "rejected")}
              className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-medium transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="Reject Claim"
            >
              <FiX className="w-3.5 h-3.5" />
              <span>Reject</span>
            </button>

            {/* View Details Button */}
            <button
              type="button"
              onClick={() => onView(claim)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="View Claim Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
