/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { X, Sparkles, Gift, Tag, Calendar, CheckCircle2, Coffee, ShieldCheck, Users } from "lucide-react";

dayjs.extend(relativeTime);

interface RewardViewModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardViewModal = ({ reward, isOpen, onClose }: RewardViewModalProps) => {
  if (!reward) return null;

  const imageUrl = formatImagePath(reward.image);
  const isPublished =
    (reward.status || "").toLowerCase() === "publish" ||
    (reward.status || "").toLowerCase() === "active";
  const isCoffee = reward.productType === "Coffee";
  const totalRedemptions = Array.isArray(reward.redeemedUsers)
    ? reward.redeemedUsers.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200 text-slate-800"
      >
        {/* 🧼 CLEAN LIGHT HEADER BANNER */}
        <DialogHeader className="bg-slate-50/90 p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 bg-white rounded-2xl p-2 shadow-sm border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={reward.brand || "Reward Product"}
                  fill
                  className="object-contain p-1"
                />
              ) : (
                <Gift className="w-7 h-7 text-amber-500" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                {reward.brand || reward.rewardName || "Reward Item"}
              </DialogTitle>

              <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCoffee
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {reward.productType || "Item"}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {reward.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* 📜 MODAL BODY CONTENT */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[75vh] hide-scrollbar">
          {/* STATS & VALUATION GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Points Valuation Box */}
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-5 border border-amber-200/80 space-y-1 shadow-sm">
              <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Points Cost
              </p>
              <h4 className="text-3xl font-black text-amber-950 leading-none">
                {reward.point ?? reward.pointsRequired ?? 0}{" "}
                <span className="text-xs font-bold text-amber-600 ml-0.5">pts</span>
              </h4>
            </div>

            {/* Created Date Box */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-1 shadow-sm">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Date Added
              </p>
              <h4 className="text-base font-bold text-slate-900 leading-tight">
                {reward.createdAt ? dayjs(reward.createdAt).format("DD MMM YYYY") : "N/A"}
              </h4>
              {reward.createdAt && (
                <p className="text-[11px] text-slate-400 font-semibold">
                  {dayjs(reward.createdAt).fromNow()}
                </p>
              )}
            </div>
          </div>

          {/* ITEM DETAILS SPECIFICATIONS LIST */}
          <div className="bg-slate-50/60 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-slate-500" /> Item Details
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Brand / Item Name</span>
                <span className="font-bold text-slate-900 truncate max-w-[150px]">
                  {reward.brand}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Category Type</span>
                <span className="font-bold text-slate-900 flex items-center gap-1">
                  {isCoffee && <Coffee className="w-3.5 h-3.5 text-amber-600" />}
                  {reward.productType}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-200/60 sm:border-b-0">
                <span className="text-slate-500 font-semibold">Publication Status</span>
                <span className="font-bold text-emerald-700 capitalize">
                  {reward.status}
                </span>
              </div>

              {isCoffee && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-500 font-semibold">Total Redemptions</span>
                  <span className="font-bold text-blue-700 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-blue-600" />
                    {totalRedemptions} {totalRedemptions === 1 ? "claim" : "claims"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* COFFEE REWARD SYSTEM INFO NOTE */}
          {isCoffee && (
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 flex items-start gap-3 text-xs text-amber-900">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Unlimited QR Code Redemption Active</p>
                <p className="text-amber-700/90 font-medium">
                  This Coffee item generates a QR code that players can scan directly from their mobile app. There is no user limit for Coffee redemptions.
                </p>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardViewModal;
