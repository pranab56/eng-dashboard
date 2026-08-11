import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { formatImagePath } from '../utils/formatImagePath';

const statusStyle = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "finished":
      return "bg-green-100 text-green-700";
    case "upcoming":
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "live":
      return "bg-red-100 text-red-700 animate-pulse";
    case "half_time":
      return "bg-amber-100 text-amber-700";
    case "cancelled":
      return "bg-gray-100 text-gray-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

export const getMatchColumns = (
  onView: (match: any) => void,
  onDelete: (id: string) => void,
  onModifyScore: (match: any) => void,
  onUpdateStatus?: (match: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "homeTeam",
    header: () => <div className="">Teams & Matchup</div>,
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div>
          <div className="flex gap-2">
            <div className="flex items-center">
              {match.homeTeam?.teamLogo ? (
                <Image src={formatImagePath(match.homeTeam.teamLogo)} alt="home" width={100} height={100} className="w-10 h-10 rounded-full border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px]">Home</div>
              )}
              {match.awayTeam?.teamLogo ? (
                <Image src={formatImagePath(match.awayTeam.teamLogo)} alt="away" width={100} height={100} className="w-10 h-10 rounded-full relative -left-3 border-2 border-white object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full relative -left-3 border-2 border-white bg-gray-200 flex items-center justify-center text-[10px]">Away</div>
              )}
            </div>
            <p className="flex flex-col flex-start items-start ">
              <span className="font-semibold">{match.homeTeam?.teamName} Vs {match.awayTeam?.teamName}</span>
              <span className=" text-gray-500">{match.venueName}</span>
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "matchDate",
    header: () => <div className="">Date & Time</div>,
    cell: ({ row }) => {
      const date = dayjs(row.original.matchDate || row.original.scheduledAt).tz("Europe/London");
      return (
        <div>
          <div className="font-semibold">{date.format("DD/MM/YYYY")}</div>
          <div className="text-gray-500 text-xs">Kick-off: {date.format("HH:mm a")}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    header: () => <div className="">Score</div>,
    cell: ({ row }) => (
      <div className="bg-[#080808] text-white rounded-md px-4 py-1.5 inline-block font-bold text-xs shadow-xs">
        {row.original.homeScore ?? 0} - {row.original.awayScore ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => {
      const match = row.original;
      const displayStatus = match.status === "scheduled" ? "upcoming" : match.status;
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus && onUpdateStatus(match)}
          className={`${statusStyle(match.status)} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md capitalize font-bold text-xs hover:opacity-80 transition-all cursor-pointer shadow-2xs group`}
          title="Click to Edit Match Status & Timing"
        >
          <span>{displayStatus}</span>
          <span className="text-[10px] text-gray-400 group-hover:text-gray-600 transition-colors">✏️</span>
        </button>
      );
    },
  },
  {
    accessorKey: "period",
    header: () => <div className="">Period</div>,
    cell: ({ row }) => {
      const period = row.original.period;
      if (period === "first_half") {
        return <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-bold text-xs border border-blue-200/50">1st Half</span>;
      }
      if (period === "second_half") {
        return <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md font-bold text-xs border border-purple-200/50">2nd Half</span>;
      }
      return <span className="text-gray-400 text-xs font-medium">-</span>;
    },
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer"
          title="View Match Details & Timing"
        >
          <FiEye className="size-5 font-medium text-gray-800" />
        </button>
        {onUpdateStatus && (
          <button
            type="button"
            onClick={() => onUpdateStatus(row.original)}
            className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-blue-50 hover:text-blue-600 transition-colors duration-300 cursor-pointer"
            title="Change Match Status & Timing"
          >
            <svg className="size-5 text-gray-800 hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        <button
          onClick={() => onModifyScore(row.original)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-emerald-50 hover:text-emerald-600 transition-colors duration-300 cursor-pointer"
          title="Modify Score"
        >
          <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </button>
        <Link href={`/match-management/create-match?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer" title="Edit Match">
            <FiEdit className="size-5 font-medium text-gray-800" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
          title="Delete Match"
        >
          <FiTrash2 className="size-5 font-medium" />
        </button>
      </div>
    ),
  }
];
