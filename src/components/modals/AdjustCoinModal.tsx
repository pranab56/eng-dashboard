"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAdjustPlayerCoinsMutation } from "@/features/player/playerApi";
import { toast } from "sonner";
import {
  Coins,
  Plus,
  Minus,
  FileText,
  Loader2,
  X,
  ArrowRight,
} from "lucide-react";

interface AdjustCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: any;
  currentCoins: number;
  onSuccess?: () => void;
}

export const AdjustCoinModal: React.FC<AdjustCoinModalProps> = ({
  isOpen,
  onClose,
  player,
  currentCoins,
  onSuccess,
}) => {
  const [operation, setOperation] = useState<"ADD" | "DEDUCT">("ADD");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [adjustCoins, { isLoading }] = useAdjustPlayerCoinsMutation();

  const playerId = player?._id || player?.id;
  const fullName = player ? `${player.firstName || ""} ${player.lastName || ""}`.trim() || player.userName : "Player";

  const numAmount = Math.max(0, parseInt(amount) || 0);
  const netDelta = operation === "ADD" ? numAmount : -numAmount;
  const projectedBalance = Math.max(0, currentCoins + netDelta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) {
      toast.error("Player ID missing");
      return;
    }
    if (numAmount <= 0) {
      toast.error("Please enter a valid coin amount greater than 0");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please provide a mandatory reason for this financial ledger transaction");
      return;
    }

    try {
      const res = await adjustCoins({
        playerId,
        data: {
          amount: netDelta,
          reason: reason.trim(),
        },
      }).unwrap();

      toast.success(res.message || "ENG Coins adjusted successfully!");
      setAmount("");
      setReason("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to adjust coins");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl text-slate-800"
      >
        {/* Clean Modal Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Adjust ENG Coins
              </DialogTitle>
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                Coin Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Credit or debit coins for <span className="font-semibold text-slate-800">{fullName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
          {/* Segmented Control for Operation */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => setOperation("ADD")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                operation === "ADD"
                  ? "bg-white text-emerald-700 shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Credit Coins (+)
            </button>
            <button
              type="button"
              onClick={() => setOperation("DEDUCT")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                operation === "DEDUCT"
                  ? "bg-white text-rose-700 shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              Debit Coins (-)
            </button>
          </div>

          {/* Balance Preview Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Current</span>
              <span className="font-semibold text-slate-900">{currentCoins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-medium block">Change</span>
              <span className={`font-semibold ${operation === "ADD" ? "text-emerald-600" : "text-rose-600"}`}>
                {operation === "ADD" ? "+" : "-"}{numAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-500 font-medium block">New Balance</span>
              <span className="font-bold text-slate-900">{projectedBalance.toLocaleString()}</span>
            </div>
          </div>

          {/* Coin Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Coin Amount <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 50)"
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 transition-colors"
              />
            </div>
          </div>

          {/* Audit Reason Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Transaction Reason <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Fair play reward bonus for Tournament Finals"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900 resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || numAmount <= 0 || !reason.trim()}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Confirm Adjustment
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
