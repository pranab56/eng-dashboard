"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatImagePath } from "@/utils/formatImagePath";
import { useGetLiveMarketPlayersQuery } from "@/features/transfer/transferApi";
import {
  Search,
  X,
  Building2,
  Calendar,
  Sparkles,
  Coins,
  Shield,
  User,
  RefreshCw,
} from "lucide-react";
import dayjs from "dayjs";

interface LiveMarketPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveMarketPlayersModal: React.FC<LiveMarketPlayersModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, refetch } = useGetLiveMarketPlayersQuery(
    {
      page,
      limit: 10,
      searchTerm: searchTerm.trim() || undefined,
    },
    { skip: !isOpen }
  );

  const playersList = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl bg-white p-0 border border-slate-200 rounded-xl shadow-xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Live Transfer Market</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">
                  Active Listings ({meta.total || 0})
                </span>
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Players currently seeking a club transfer while registered with their team.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by player name or email..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Players List Container */}
        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading Live Market players...
            </div>
          ) : playersList.length === 0 ? (
            <div className="py-12 text-center">
              <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-600">No players found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {searchTerm
                  ? "Try adjusting your search criteria"
                  : "No players are currently listed on the Live Transfer Market."}
              </p>
            </div>
          ) : (
            playersList.map((item: any) => {
              const player = item.player || {};
              const currentTeam = item.currentTeam || {};
              const playerName = `${player.firstName || ""} ${player.lastName || player.userName || "Player"}`.trim();
              const initials = `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase() || "PL";

              return (
                <div
                  key={item._id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left: Player Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden text-slate-600 font-semibold text-xs">
                      {player.profile ? (
                        <Image
                          src={formatImagePath(player.profile)}
                          alt={playerName}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900 truncate">
                          {playerName}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {player.position || "Player"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{currentTeam.teamName || "Current Club"}</span>
                        <span>•</span>
                        <span>{player.email || "No email"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Market Value & Preferred Positions */}
                  <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-center">
                    {/* Preferred Positions */}
                    {item.preferredPositions && item.preferredPositions.length > 0 && (
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Preferred</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          {item.preferredPositions.map((p: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-medium"
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cost / Market Value */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Transfer Cost</span>
                      <span className="font-mono font-bold text-xs text-amber-700 flex items-center gap-1 mt-0.5">
                        <Coins className="w-3 h-3 text-amber-500" />
                        {(player.engCoine || player.marketValue || 0).toLocaleString()} Coins
                      </span>
                    </div>

                    {/* Listed Date */}
                    <div className="hidden lg:flex flex-col items-end">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Listed Date</span>
                      <span className="text-[11px] text-slate-500 mt-0.5">
                        {item.listedAt ? dayjs(item.listedAt).format("MMM D, YYYY") : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/70 text-xs text-slate-500">
          <span>
            Showing page {page} of {meta.totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 cursor-pointer text-xs"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= (meta.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 cursor-pointer text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveMarketPlayersModal;
