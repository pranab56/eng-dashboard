"use client";

import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import Image from "next/image";
import Link from "next/link";
import { formatImagePath } from "../utils/formatImagePath";
import {
  Shield,
  Eye,
  MoreVertical,
  Edit3,
  Trash2,
  Clock,
  Award,
  Calendar,
  Goal,
  MapPin,
  Grid,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

dayjs.extend(utc);
dayjs.extend(timezone);

const statusStyle = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "finished":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
    case "upcoming":
    case "scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200/80";
    case "live":
      return "bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse";
    case "half_time":
      return "bg-amber-50 text-amber-700 border-amber-200/80";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export const getMatchColumns = (
  onView: (match: any) => void,
  onDelete: (id: string) => void,
  onModifyScore: (match: any) => void,
  onUpdateStatus?: (match: any) => void,
  onManageCleanSheet?: (match: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "homeTeam",
    header: () => <div className="font-bold text-slate-700 text-xs">Teams & Matchup</div>,
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div className="flex items-center gap-3 py-1">
          <div className="flex items-center shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-xs overflow-hidden relative flex items-center justify-center">
              {match.homeTeam?.teamLogo ? (
                <Image
                  src={formatImagePath(match.homeTeam.teamLogo)}
                  alt="home"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">H</span>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-xs overflow-hidden relative flex items-center justify-center -ml-2.5">
              {match.awayTeam?.teamLogo ? (
                <Image
                  src={formatImagePath(match.awayTeam.teamLogo)}
                  alt="away"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">A</span>
              )}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {match.homeTeam?.teamName || "Home"} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam?.teamName || "Away"}
            </span>
            <span className="text-[11px] text-slate-400 font-medium truncate">
              {match.league?.leagueName || match.ageGroup || "Match"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "matchDate",
    header: () => <div className="font-bold text-slate-700 text-xs">Date & Kickoff</div>,
    cell: ({ row }) => {
      const date = dayjs(row.original.matchDate || row.original.scheduledAt).tz("Europe/London");
      return (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-800">{date.format("DD MMM YYYY")}</span>
          <span className="text-[11px] text-slate-400 font-medium">KO: {date.format("HH:mm a")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "venueName",
    header: () => <div className="font-bold text-slate-700 text-xs">Venue</div>,
    cell: ({ row }) => {
      const venue = row.original.venueName || "Unassigned";
      return (
        <div className="flex items-center gap-1.5 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-semibold text-slate-800 line-clamp-1 max-w-[150px]" title={venue}>
            {venue}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "formation",
    header: () => <div className="font-bold text-slate-700 text-xs">Pitch Formation</div>,
    cell: ({ row }) => {
      const formation = row.original.formation;
      if (!formation) {
        return <span className="text-slate-400 text-xs font-medium">-</span>;
      }
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Grid className="w-3 h-3 text-indigo-500" />
          {formation}
        </span>
      );
    },
  },

  {
    accessorKey: "score",
    header: () => <div className="font-bold text-slate-700 text-xs">Score</div>,
    cell: ({ row }) => (
      <div className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-900 text-white font-black text-xs shadow-xs tracking-wider">
        {row.original.homeScore ?? 0} : {row.original.awayScore ?? 0}
      </div>
    ),
  },
  {
    accessorKey: "matchType",
    header: () => <div className="font-bold text-slate-700 text-xs">Type</div>,
    cell: ({ row }) => {
      const type = (row.original.matchType || "league").toLowerCase();
      switch (type) {
        case "cup":
          return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Cup</span>;
        case "friendly":
          return <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">Friendly</span>;
        default:
          return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">League</span>;
      }
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="font-bold text-slate-700 text-xs">Status</div>,
    cell: ({ row }) => {
      const match = row.original;
      const displayStatus = match.status === "scheduled" ? "upcoming" : match.status;
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus && onUpdateStatus(match)}
          className={`${statusStyle(match.status)} inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full capitalize font-bold text-xs border transition-all cursor-pointer shadow-2xs`}
          title="Click to change status"
        >
          <span>{displayStatus}</span>
        </button>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="font-bold text-slate-700 text-xs text-right pr-4">Actions</div>,
    cell: ({ row }) => {
      const match = row.original;

      return (
        <div className="flex items-center justify-end gap-1.5 pr-2">
          {/* Quick View Button */}
          <button
            type="button"
            onClick={() => onView(match)}
            className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
            title="View Match Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Unified Dropdown Menu for all modification actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs focus:outline-none"
                title="Match Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white rounded-2xl shadow-xl border border-slate-100 text-xs">
              <DropdownMenuItem
                onClick={() => onModifyScore(match)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 font-semibold cursor-pointer"
              >
                <Goal className="w-4 h-4 text-emerald-600" />
                <span>Modify Score & Goals</span>
              </DropdownMenuItem>

              {onManageCleanSheet && (
                <DropdownMenuItem
                  onClick={() => onManageCleanSheet(match)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-teal-700 hover:bg-teal-50 font-semibold cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-teal-600" />
                  <span>Clean Sheet Automation Status</span>
                </DropdownMenuItem>
              )}

              {onUpdateStatus && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(match)}
                  className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50 font-semibold cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Update Status & Timing</span>
                </DropdownMenuItem>
              )}

              <Link href={`/match-management/create-match?id=${match._id}`} className="block">
                <DropdownMenuItem className="flex items-center gap-2.5 p-2 rounded-xl text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 font-semibold cursor-pointer">
                  <Edit3 className="w-4 h-4 text-indigo-600" />
                  <span>Edit Match Setup</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              <DropdownMenuItem
                onClick={() => onDelete(match._id)}
                className="flex items-center gap-2.5 p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>Delete Match</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
