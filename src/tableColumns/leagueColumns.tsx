import { ColumnDef } from "@tanstack/react-table";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import dayjs from "dayjs";

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

export const getLeagueColumns = (
  onView: (league: any) => void,
  onDelete: (id: string) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "leagueName",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">League & Season</span>,
    cell: ({ row }) => {
      const name = row.original.leagueName || row.original.title || "Unnamed League";
      const season = row.original.season || "1";
      return (
        <div className="flex flex-col min-w-[180px]">
          <span className="font-semibold text-slate-900 text-sm">{name}</span>
          <span className="text-[11px] font-mono text-slate-500 mt-0.5">Season {season}</span>
        </div>
      );
    },
  },
    {
    accessorKey: "ageGroup",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">Age Group</span>,
    cell: ({ row }) => {
      const age = row.original.ageGroup;
      if (!age) {
        return <span className="text-xs text-slate-400 font-medium">All Ages</span>;
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200/80 whitespace-nowrap">
          {age}
        </span>
      );
    },
  },
  {
    accessorKey: "startDate",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">Start Date</span>,
    cell: ({ row }) => {
      const date = row.original.startDate;
      return (
        <div className="font-mono text-xs text-slate-700 whitespace-nowrap">
          {date ? dayjs(date).format("DD MMM, YYYY") : "—"}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">End Date</span>,
    cell: ({ row }) => {
      const date = row.original.endDate;
      return (
        <div className="font-mono text-xs text-slate-700 whitespace-nowrap">
          {date ? dayjs(date).format("DD MMM, YYYY") : "—"}
        </div>
      );
    },
  },
  {
    id: "duration",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">Duration</span>,
    cell: ({ row }) => {
      const start = row.original.startDate;
      const end = row.original.endDate;
      if (!start || !end) return <span className="text-xs text-slate-400">—</span>;
      const days = dayjs(end).diff(dayjs(start), "day");
      return (
        <span className="font-mono text-xs text-slate-600 whitespace-nowrap">
          {isNaN(days) ? "—" : `${days} days`}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-xs text-slate-600 uppercase tracking-wider">Status</span>,
    cell: ({ row }) => {
      const { label, dotColor, badgeStyle } = getStatusBadge(row.original.status);
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle} whitespace-nowrap`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          {label}
        </span>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="text-right font-semibold text-xs text-slate-600 uppercase tracking-wider">Actions</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
          title="View League Details"
          aria-label="View League"
        >
          <FiEye className="size-4" />
        </button>
        <Link href={`/league-management/create-league?id=${row.original._id}`}>
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 transition-colors cursor-pointer"
            title="Edit League"
            aria-label="Edit League"
          >
            <FiEdit className="size-4" />
          </button>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-8 w-8 rounded-md bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-colors cursor-pointer"
          title="Delete League"
          aria-label="Delete League"
        >
          <FiTrash2 className="size-4" />
        </button>
      </div>
    ),
  },
];
