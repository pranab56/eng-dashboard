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
  Activity,
  MoreVertical,
  Edit3,
  Trash2,
  Clock,
  Goal,
  MapPin,
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
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "upcoming":
    case "scheduled":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "live":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "half_time":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export const getMatchColumns = (
  onView: (match: any, initialTab?: "overview" | "events" | "actions") => void,
  onDelete: (id: string) => void,
  onModifyScore: (match: any) => void,
  onUpdateStatus?: (match: any) => void,
  onManageCleanSheet?: (match: any) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "homeTeam",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Teams & Matchup
      </div>
    ),
    cell: ({ row }) => {
      const match = row.original;
      const homeName = match.homeTeam?.teamName || "Home";
      const awayName = match.awayTeam?.teamName || "Away";

      return (
        <div className="flex items-center gap-2.5 py-1">
          {/* Crests */}
          <div className="flex items-center shrink-0">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0">
              {match.homeTeam?.teamLogo ? (
                <Image
                  src={formatImagePath(match.homeTeam.teamLogo)}
                  alt="home"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">
                  {homeName[0] || "H"}
                </span>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative flex items-center justify-center shrink-0 -ml-2">
              {match.awayTeam?.teamLogo ? (
                <Image
                  src={formatImagePath(match.awayTeam.teamLogo)}
                  alt="away"
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-slate-500">
                  {awayName[0] || "A"}
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col min-w-0 max-w-[220px]">
            <span className="font-semibold text-xs text-slate-900 truncate">
              {homeName} <span className="text-slate-400 font-normal">vs</span> {awayName}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-slate-500 truncate">
                {match.league?.leagueName || match.ageGroup || "League Match"}
              </span>
              {match.formation && (
                <span className="text-[10px] font-mono text-slate-400 px-1 py-0.2 rounded bg-slate-100">
                  {match.formation}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "matchDate",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Date & Kickoff
      </div>
    ),
    cell: ({ row }) => {
      const date = dayjs(row.original.matchDate || row.original.scheduledAt).tz("Europe/London");
      return (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800">{date.format("DD MMM YYYY")}</span>
          <span className="text-[11px] text-slate-400 font-mono">KO: {date.format("HH:mm a")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "venueName",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Venue
      </div>
    ),
    cell: ({ row }) => {
      const venue = row.original.venueName || "Unassigned";
      return (
        <div className="flex items-center gap-1.5 text-xs text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate max-w-[140px]" title={venue}>
            {venue}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "score",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Score
      </div>
    ),
    cell: ({ row }) => {
      const homeScore = row.original.homeScore ?? 0;
      const awayScore = row.original.awayScore ?? 0;
      const isFinished = row.original.status === "finished";

      return (
        <div
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold border ${
            isFinished
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-slate-100 text-slate-800 border-slate-200"
          }`}
        >
          {homeScore} : {awayScore}
        </div>
      );
    },
  },
  {
    accessorKey: "matchType",
    header: () => (
      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        Type
      </div>
    ),
    cell: ({ row }) => {
      const type = (row.original.matchType || "league").toLowerCase();
      let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";

      if (type === "cup") {
        badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
      } else if (type === "friendly") {
        badgeStyle = "bg-sky-50 text-sky-700 border-sky-200";
      }

      return (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${badgeStyle}`}
        >
          {type}
        </span>
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
      const match = row.original;
      const rawStatus = match.status || "upcoming";
      const displayStatus = rawStatus === "scheduled" ? "upcoming" : rawStatus;
      const isLive = rawStatus === "live";

      return (
        <button
          type="button"
          onClick={() => onUpdateStatus && onUpdateStatus(match)}
          className={`${statusStyle(
            rawStatus
          )} inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full capitalize font-medium text-xs border transition-colors cursor-pointer`}
          title="Click to update status & stage"
        >
          {isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          )}
          <span>{displayStatus.replace(/_/g, " ")}</span>
        </button>
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
      const match = row.original;

      return (
        <div className="flex items-center justify-end gap-1.5 pr-2">
          {/* Quick View Button */}
          <button
            type="button"
            onClick={() => onView(match, "overview")}
            className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Match Overview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Match Events & Cards Button */}
          <button
            type="button"
            onClick={() => onView(match, "events")}
            className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Match Events & Cards"
          >
            <Activity className="w-3.5 h-3.5" />
          </button>

          {/* Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer focus:outline-hidden"
                title="Match Actions"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 p-1 bg-white rounded-lg shadow-md border border-slate-200 text-xs"
            >
              <DropdownMenuItem
                onClick={() => onModifyScore(match)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer"
              >
                <Goal className="w-3.5 h-3.5 text-emerald-600" />
                <span>Modify Score & Goals</span>
              </DropdownMenuItem>

              {onManageCleanSheet && (
                <DropdownMenuItem
                  onClick={() => onManageCleanSheet(match)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Clean Sheet Automation</span>
                </DropdownMenuItem>
              )}

              {onUpdateStatus && (
                <DropdownMenuItem
                  onClick={() => onUpdateStatus(match)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Update Status & Timing</span>
                </DropdownMenuItem>
              )}

              <Link href={`/match-management/create-match?id=${match._id}`} className="block">
                <DropdownMenuItem className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-medium cursor-pointer">
                  <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Edit Match Setup</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              <DropdownMenuItem
                onClick={() => onDelete(match._id)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Delete Match</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
