import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { TTournament, TPositionReward } from "@/types/columnTypes";
import { Trophy, Calendar } from "lucide-react";

export const getTournamentsColumns = (
  onView: (tournament: TTournament) => void,
  onEdit: (tournament: TTournament) => void,
  onDelete: (id: string) => void
): ColumnDef<TTournament>[] => [
    {
      accessorKey: "title",
      header: () => <div className="">Tournament Title</div>,
      cell: ({ row }) => {
        const tournament = row.original;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="flex flex-col max-w-[280px]">
              <span className="font-medium text-gray-900 leading-tight line-clamp-1">
                {tournament.title}
              </span>
              {tournament.description && (
                <span className="text-xs text-gray-400 line-clamp-1 mt-0.5 font-normal">
                  {tournament.description}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: () => <div className="">Duration</div>,
      cell: ({ row }) => {
        const start = row.original.startDate
          ? dayjs(row.original.startDate).format("DD MMM, YYYY")
          : "N/A";
        const end = row.original.endDate
          ? dayjs(row.original.endDate).format("DD MMM, YYYY")
          : "N/A";
        return (
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {start} &mdash; {end}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "positionRewards",
      header: () => <div className="">Position Rewards</div>,
      cell: ({ row }) => {
        const rewards: TPositionReward[] = row.original.positionRewards || [];
        if (rewards.length === 0) {
          return <span className="text-xs text-gray-400 italic">No rewards</span>;
        }

        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[260px]">
            {rewards.slice(0, 3).map((r, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-gray-50 border border-gray-200 text-gray-700 flex items-center gap-1"
              >
                <span className="font-medium text-amber-600">#{r.position}</span>
                <span className="truncate max-w-[80px]">{r.positionName}:</span>
                <span className="font-medium text-blue-600">{r.points} pts</span>
              </span>
            ))}
            {rewards.length > 3 && (
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                +{rewards.length - 3} more
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="">Status</div>,
      cell: ({ row }) => {
        const status = (row.getValue("status") || "upcoming").toString().toLowerCase();

        let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
        if (status === "ongoing" || status === "active") {
          badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
        } else if (status === "completed" || status === "finished") {
          badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
        }

        return (
          <div
            className={`px-3 py-1 rounded-full text-[10px] font-medium . tracking-wider border inline-block ${badgeStyle}`}
          >
            {status}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="">Action</div>,
      cell: ({ row }) => {
        const tournament = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onView(tournament)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="View Tournament Details"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(tournament)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
              title="Edit Tournament"
            >
              <FiEdit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(tournament._id || (tournament as any).id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete Tournament"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
