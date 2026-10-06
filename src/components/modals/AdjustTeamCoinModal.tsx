"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdjustTeamCoinsMutation } from "@/features/teamManagement/teamApi";
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

interface AdjustTeamCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: any;
  currentCoins: number;
  onSuccess?: () => void;
}

export const AdjustTeamCoinModal: React.FC<AdjustTeamCoinModalProps> = ({
  isOpen,
  onClose,
  team,
  currentCoins,
  onSuccess,
}) => {
  const [operation, setOperation] = useState<"ADD" | "DEDUCT">("ADD");
  const [amount, setAmount] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [adjustTeamCoins, { isLoading }] = useAdjustTeamCoinsMutation();

  const teamId = team?._id || team?.id;
  const teamName = team?.teamName || "Club Team";

  const numAmount = Math.max(0, parseInt(amount) || 0);
  const netDelta = operation === "ADD" ? numAmount : -numAmount;
  const projectedBalance = Math.max(0, currentCoins + netDelta);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      toast.error("Team ID missing");
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
      const res = await adjustTeamCoins({
        teamId,
        data: {
          amount: netDelta,
          reason: reason.trim(),
        },
      }).unwrap();

      toast.success(res.message || "Team coins adjusted successfully!");
      setAmount("");
      setReason("");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to adjust team coins");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md w-full bg-white dark:bg-slate-900 rounded-xl p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl text-slate-800 dark:text-slate-200"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Adjust Team Coins
              </DialogTitle>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                Club Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Record manual financial adjustment for <span className="font-semibold text-slate-700 dark:text-slate-300">{teamName}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Operation Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Transaction Action
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOperation("ADD")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  operation === "ADD"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Credit (+ Add Coins)
              </button>

              <button
                type="button"
                onClick={() => setOperation("DEDUCT")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  operation === "DEDUCT"
                    ? "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                <Minus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Debit (- Deduct Coins)
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Coin Amount <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Coins className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:ring-slate-400"
                required
              />
            </div>
          </div>

          {/* Projected Balance Card */}
          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 rounded-lg p-3 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Current Balance</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentCoins.toLocaleString()} Coins
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <div className="text-right">
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">After Adjustment</span>
              <span
                className={`font-bold ${
                  operation === "ADD"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {projectedBalance.toLocaleString()} Coins
              </span>
            </div>
          </div>

          {/* Mandatory Reason Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Reason / Audit Note <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason for this manual club adjustment..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 dark:focus:ring-slate-400 resize-none"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || numAmount <= 0 || !reason.trim()}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
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
