/* eslint-disable @next/next/no-img-element */
import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import { HelpCircle, Award, Clock } from "lucide-react";
import dayjs from "dayjs";

const getStatusBadge = (status: string) => {
  const norm = (status || "").toLowerCase();
  switch (norm) {
    case "active":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
          Active
        </span>
      );
    case "draft":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
          Draft
        </span>
      );
    case "completed":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
          Completed
        </span>
      );
    case "archived":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
          Archived
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
          {status}
        </span>
      );
  }
};

export const getQuizColumns = (
  onViewLeaderboard: (item: any) => void,
  onEdit: (item: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "title",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Quiz Information
      </span>
    ),
    cell: ({ row }) => {
      const { title, category, questions, timeLimitSeconds } = row.original;
      const qCount = Array.isArray(questions) ? questions.length : 0;
      const minutes = Math.floor((timeLimitSeconds || 120) / 60);
      const seconds = (timeLimitSeconds || 120) % 60;
      const durationStr = minutes > 0 ? `${minutes}m ${seconds > 0 ? seconds + 's' : ''}` : `${seconds}s`;

      return (
        <div className="flex flex-col min-w-[240px] py-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
              {category || "General"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
              {qCount} {qCount === 1 ? "question" : "questions"}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              {durationStr}
            </span>
          </div>
          <span className="font-medium text-slate-900 text-xs mt-1.5 leading-snug">
            {title}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "rewardPoints",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Reward & Pass %
      </span>
    ),
    cell: ({ row }) => {
      const { rewardPoints, passingPercentage } = row.original;
      return (
        <div className="flex flex-col gap-0.5">
          <div className="inline-flex items-center gap-1 font-semibold text-xs text-amber-700">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{rewardPoints || 0} Points</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Passing: {passingPercentage || 70}%
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "totalAttempts",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-center block">
        Participants
      </span>
    ),
    cell: ({ row }) => {
      const { totalAttempts = 0, totalPassed = 0 } = row.original;
      const passRate = totalAttempts > 0 ? Math.round((totalPassed / totalAttempts) * 100) : 0;
      return (
        <div className="text-center py-1">
          <span className="font-semibold text-xs text-slate-900 block font-mono">
            {totalAttempts}
          </span>
          <span className="text-[10px] text-slate-500 block">
            {totalPassed} passed ({passRate}%)
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Schedule Period
      </span>
    ),
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      const start = startDate ? dayjs(startDate).format("DD MMM YYYY") : "N/A";
      const end = endDate ? dayjs(endDate).format("DD MMM YYYY") : "N/A";

      return (
        <div className="flex flex-col text-xs text-slate-600 min-w-[130px]">
          <span className="font-mono text-[11px] text-slate-900">
            {start} - {end}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">
        Status
      </span>
    ),
    cell: ({ row }) => {
      return getStatusBadge(row.original.status);
    },
  },
  {
    id: "actions",
    header: () => (
      <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider text-right block pr-2">
        Actions
      </span>
    ),
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1 pr-1">
          <button
            type="button"
            onClick={() => onViewLeaderboard(item)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="View Leaderboard & Participants"
          >
            <FiEye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
            title="Edit Quiz"
          >
            <FiEdit className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
            title="Delete Quiz"
          >
            <FiTrash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
