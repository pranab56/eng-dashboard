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
import Link from "next/link";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Coffee, Package, Pencil, QrCode } from "lucide-react";

dayjs.extend(relativeTime);

interface RewardViewModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardViewModal = ({ reward, isOpen, onClose }: RewardViewModalProps) => {
  if (!reward) return null;

  const imageUrl = reward.image ? formatImagePath(reward.image) : null;
  const isPublished =
    (reward.status || "").toLowerCase() === "publish" ||
    (reward.status || "").toLowerCase() === "active";
  const isCoffee = reward.productType === "Coffee";
  const totalRedemptions = Array.isArray(reward.redeemedUsers)
    ? reward.redeemedUsers.length
    : 0;

  const pointsCost = reward.point ?? reward.pointsRequired ?? 0;
  const approxValue = (pointsCost * 0.01).toFixed(2);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-lg text-slate-900"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <DialogTitle className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {reward.brand || "Reward Item Details"}
            </DialogTitle>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                isCoffee
                  ? "bg-amber-50 text-amber-800 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isCoffee ? "Coffee" : "Merchandise"}
            </span>
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

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Main Visual & Key Metrics */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Artwork Frame */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={reward.brand || "Reward"}
                  fill
                  className="object-contain p-2"
                />
              ) : isCoffee ? (
                <Coffee className="w-10 h-10 text-amber-600" />
              ) : (
                <Package className="w-10 h-10 text-slate-300" />
              )}
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-2 gap-2.5 w-full flex-1">
              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block">
                  Points Cost
                </span>
                <p className="text-lg font-bold text-slate-900 tabular-nums mt-0.5">
                  {Number(pointsCost).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">pts</span>
                </p>
                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                  Approx. £{approxValue}
                </span>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block">
                  Status
                </span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${
                      isPublished
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {reward.status || "Active"}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block">
                  Category
                </span>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {isCoffee ? "Instant QR Code" : "Physical Merchandise"}
                </p>
              </div>

              <div className="p-3 rounded-md border border-slate-200 bg-slate-50/60">
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 block">
                  {isCoffee ? "Redemptions" : "Fulfillment"}
                </span>
                <p className="text-xs font-semibold text-slate-900 mt-1">
                  {isCoffee ? `${totalRedemptions} total claims` : "Order Dispatch"}
                </p>
              </div>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="border border-slate-200 rounded-md overflow-hidden bg-white text-xs">
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
              Inventory Specifications
            </div>
            <div className="divide-y divide-slate-100">
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Brand Title</span>
                <span className="font-semibold text-slate-900">{reward.brand}</span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Redemption Method</span>
                <span className="text-slate-800 font-medium">
                  {isCoffee ? "In-App QR Scanner" : "Standard Shipping Order"}
                </span>
              </div>
              <div className="px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-slate-500 font-medium">Date Added</span>
                <span className="text-slate-800 font-medium tabular-nums">
                  {reward.createdAt
                    ? dayjs(reward.createdAt).format("MMM DD, YYYY • hh:mm A")
                    : "N/A"}
                </span>
              </div>
              {isCoffee && (
                <div className="px-3.5 py-2.5 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Claim Limits</span>
                  <span className="text-slate-800 font-medium">
                    Unlimited player scans allowed
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Coffee QR Notice */}
          {isCoffee && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-600 flex items-start gap-2.5">
              <QrCode className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">QR Code Scan Active</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Players can scan the dedicated QR code directly through the mobile app to redeem this item using ENG Coins.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <Link
            href={`/rewards-redemption/create-reward/?id=${reward._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Item</span>
          </Link>

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

export default RewardViewModal;
