/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import {
  Calendar,
  Clock,
  X,
  Trophy,
  Copy,
  Check,
  CheckCircle2,
  CalendarDays,
  Shield,
  ExternalLink,
} from "lucide-react";
import { FiEdit } from "react-icons/fi";
import Link from "next/link";
import { toast } from "sonner";

interface LeagueViewModalProps {
  league: any;
  isOpen: boolean;
  onClose: () => void;
}

const getStatusBadge = (status: string) => {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "running":
      return {
        label: "Running",
        dotColor: "bg-emerald-500",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    case "upcoming":
      return {
        label: "Upcoming",
        dotColor: "bg-blue-500",
        badgeStyle: "bg-blue-50 text-blue-700 border-blue-200",
      };
    case "finished":
      return {
        label: "Finished",
        dotColor: "bg-slate-400",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      };
    default:
      return {
        label: status || "Pending",
        dotColor: "bg-amber-500",
        badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
      };
  }
};

const LeagueViewModal = ({ league, isOpen, onClose }: LeagueViewModalProps) => {
  const [isCopied, setIsCopied] = useState(false);

  if (!league) return null;

  const start = dayjs(league.startDate);
  const end = dayjs(league.endDate);
  const totalDays = end.diff(start, "day");
  const now = dayjs();

  // Progress calculation
  let progressPct = 0;
  let progressText = "";
  const s = (league.status || "").toLowerCase();

  if (s === "finished") {
    progressPct = 100;
    progressText = "Competition concluded";
  } else if (s === "upcoming") {
    const daysUntilStart = start.diff(now, "day");
    progressPct = 0;
    progressText = daysUntilStart > 0 ? `Starts in ${daysUntilStart} days` : "Starting soon";
  } else {
    // running
    const elapsed = now.diff(start, "day");
    const safeDays = totalDays > 0 ? totalDays : 1;
    progressPct = Math.min(100, Math.max(0, Math.round((elapsed / safeDays) * 100)));
    const remaining = Math.max(0, end.diff(now, "day"));
    progressText = `${elapsed} days elapsed · ${remaining} days remaining`;
  }

  const { label, dotColor, badgeStyle } = getStatusBadge(league.status);

  const handleCopyId = () => {
    if (!league._id) return;
    navigator.clipboard.writeText(league._id);
    setIsCopied(true);
    toast.success("League ID copied to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xl bg-white rounded-xl p-0 overflow-hidden border border-slate-200 shadow-xl"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 shadow-2xs">
              <Trophy className="w-5 h-5 text-slate-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-base font-bold text-slate-900 tracking-tight truncate">
                  {league.leagueName || league.title || "League Record"}
                </DialogTitle>
                <span className="font-mono text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                  Season {league.season || "1"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Competition Season Details
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
              {label}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-900">
          {/* Key Timeline Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 bg-slate-50/80 border border-slate-200 rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-xs">
            <div className="p-3.5 space-y-1">
              <span className="text-slate-500 font-medium block">Start Date</span>
              <span className="font-semibold text-slate-900 font-mono text-sm block">
                {league.startDate ? dayjs(league.startDate).format("DD MMM, YYYY") : "N/A"}
              </span>
              <span className="text-[11px] text-slate-400 block">Season opening fixture</span>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="text-slate-500 font-medium block">End Date</span>
              <span className="font-semibold text-slate-900 font-mono text-sm block">
                {league.endDate ? dayjs(league.endDate).format("DD MMM, YYYY") : "N/A"}
              </span>
              <span className="text-[11px] text-slate-400 block">Scheduled final match</span>
            </div>

            <div className="p-3.5 space-y-1">
              <span className="text-slate-500 font-medium block">Total Duration</span>
              <span className="font-semibold text-slate-900 font-mono text-sm block">
                {isNaN(totalDays) ? "0" : totalDays} Days
              </span>
              <span className="text-[11px] text-slate-400 block">Calendar timespan</span>
            </div>
          </div>

          {/* Timeline Progress Bar */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Season Schedule Progress</span>
              </span>
              <span className="font-mono font-semibold text-slate-900">
                {progressPct}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  s === "finished"
                    ? "bg-slate-400"
                    : s === "running"
                    ? "bg-emerald-600"
                    : "bg-blue-600"
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 text-right font-mono">
              {progressText}
            </p>
          </div>

          {/* Metadata Specifications */}
          <div className="bg-slate-50/60 border border-slate-200 rounded-lg p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">League Identifier</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                  {league._id || "N/A"}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  title="Copy League ID"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Created At</span>
              <span className="font-mono text-slate-700">
                {league.createdAt ? dayjs(league.createdAt).format("DD MMM YYYY, HH:mm") : "—"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Last Modified</span>
              <span className="font-mono text-slate-700">
                {league.updatedAt ? dayjs(league.updatedAt).format("DD MMM YYYY, HH:mm") : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            href={`/league-management/create-league?id=${league._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
          >
            <FiEdit className="w-3.5 h-3.5" />
            <span>Edit League Season</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueViewModal;
