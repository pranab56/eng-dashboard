"use client";

import React from "react";
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
import { X, Coffee, Users, Sparkles } from "lucide-react";

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
  if (!reward) return null;

  const redeemedUsers: any[] = reward.redeemedUsers || [];
  const totalCount = redeemedUsers.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* 🧼 CLEAN LIGHT HEADER */}
        <DialogHeader className="bg-slate-50 p-5 sm:p-6 border-b border-slate-100 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
              <Coffee className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>{reward.brand}</span>
                <span className="text-xs font-semibold text-slate-500 font-normal">
                  ({reward.productType || "Reward"})
                </span>
              </DialogTitle>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Users className="w-3 h-3 text-amber-600" />
                  {totalCount} Total Redemption{totalCount === 1 ? "" : "s"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-bold text-slate-700">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {reward.point || 0} pts
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 📜 REDEEMED USERS LIST BODY */}
        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto max-h-[72vh] hide-scrollbar text-slate-800 flex-1">
          {redeemedUsers.length > 0 ? (
            <div className="space-y-3">
              {redeemedUsers.map((ru: any, idx: number) => {
                const userObj = ru.user;
                const isPopulated = typeof userObj === "object" && userObj !== null;

                const playerName = isPopulated
                  ? (
                      userObj.fullName ||
                      [userObj.firstName, userObj.lastName].filter(Boolean).join(" ").trim() ||
                      userObj.userName ||
                      "Player"
                    )
                  : "Player";

                const getValidEmail = (val?: string | null) =>
                  val && typeof val === "string" && val.includes("@") ? val : "";

                const parentObj = typeof userObj?.parentId === "object" ? userObj.parentId : null;
                const playerEmail = isPopulated
                  ? (
                      getValidEmail(userObj.email) ||
                      getValidEmail(userObj.emergencyEmail) ||
                      getValidEmail(parentObj?.email) ||
                      getValidEmail(parentObj?.emergencyEmail)
                    )
                  : "";

                const playerPic = isPopulated && userObj.profile ? formatImagePath(userObj.profile) : null;
                const initials = playerName.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-all gap-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-11 h-11 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm text-xs font-bold text-slate-700">
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
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {playerName}
                        </h5>
                        {playerEmail && (
                          <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                            {playerEmail}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                        <Coffee className="w-3 h-3 text-amber-600" />
                        <span>Redeemed</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold block">
                        {ru.redeemedAt
                          ? dayjs(ru.redeemedAt).format("MMM DD, YYYY • hh:mm A")
                          : "Redeemed"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center border border-amber-100">
                <Coffee className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900">
                  No Redemptions Yet
                </h4>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">
                  No players have redeemed this Coffee reward item yet. When players scan the QR code, their claim history will appear here.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardRedeemedHistoryModal;
