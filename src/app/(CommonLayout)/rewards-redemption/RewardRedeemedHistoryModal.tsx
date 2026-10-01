/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Coffee, Users, Search } from "lucide-react";

dayjs.extend(relativeTime);

interface RewardRedeemedHistoryModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardRedeemedHistoryModal: React.FC<RewardRedeemedHistoryModalProps> = ({
  reward,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const redeemedUsers: any[] = useMemo(() => {
    return reward?.redeemedUsers || [];
  }, [reward]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return redeemedUsers;
    const q = searchTerm.toLowerCase().trim();

    return redeemedUsers.filter((ru: any) => {
      const userObj = ru.user;
      if (!userObj) return false;

      const name = (
        userObj.fullName ||
        [userObj.firstName, userObj.lastName].filter(Boolean).join(" ") ||
        userObj.userName ||
        ""
      ).toLowerCase();

      const email = (
        userObj.email ||
        userObj.emergencyEmail ||
        userObj.parentId?.email ||
        ""
      ).toLowerCase();

      return name.includes(q) || email.includes(q);
    });
  }, [redeemedUsers, searchTerm]);

  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-lg text-slate-900 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded border border-amber-200 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                  {reward.brand}
                </DialogTitle>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
                  {redeemedUsers.length} claims
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Redemption history log ({Number(reward.point || 0).toLocaleString()} pts per claim)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Filter Toolbar */}
        {redeemedUsers.length > 0 && (
          <div className="px-5 py-2.5 border-b border-slate-100 bg-white shrink-0">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by player name or email..."
                className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
              />
            </div>
          </div>
        )}

        {/* User Claims List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2">
          {redeemedUsers.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800">No redemptions yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                When players scan the QR code to claim this item, their claim records will appear here.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No redeemed records matched &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white divide-y divide-slate-100">
              {filteredUsers.map((ru: any, idx: number) => {
                const userObj = ru.user;
                const isPopulated = typeof userObj === "object" && userObj !== null;

                const playerName = isPopulated
                  ? userObj.fullName ||
                    [userObj.firstName, userObj.lastName].filter(Boolean).join(" ").trim() ||
                    userObj.userName ||
                    "Registered Player"
                  : "Registered Player";

                const getValidEmail = (val?: string | null) =>
                  val && typeof val === "string" && val.includes("@") ? val : "";

                const parentObj = typeof userObj?.parentId === "object" ? userObj.parentId : null;
                const playerEmail = isPopulated
                  ? getValidEmail(userObj.email) ||
                    getValidEmail(userObj.emergencyEmail) ||
                    getValidEmail(parentObj?.email) ||
                    getValidEmail(parentObj?.emergencyEmail)
                  : "";

                const playerPic = isPopulated && userObj.profile ? formatImagePath(userObj.profile) : null;
                const initials = playerName.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={idx}
                    className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-8 h-8 rounded-md border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 text-[11px] font-semibold text-slate-600">
                        {playerPic ? (
                          <Image
                            src={playerPic}
                            alt={playerName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate leading-tight">
                          {playerName}
                        </p>
                        {playerEmail && (
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {playerEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Claimed
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium tabular-nums mt-0.5">
                        {ru.redeemedAt
                          ? dayjs(ru.redeemedAt).format("MMM DD, YYYY • hh:mm A")
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredUsers.length} of {redeemedUsers.length} redemptions
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardRedeemedHistoryModal;
