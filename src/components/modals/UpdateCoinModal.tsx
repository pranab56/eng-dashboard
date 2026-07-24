"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface UpdateCoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (coinValue: number) => Promise<void>;
  title?: string;
  entityName?: string;
  initialValue?: number;
  isLoading?: boolean;
}

export const UpdateCoinModal: React.FC<UpdateCoinModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Update Coin Amount",
  entityName,
  initialValue = 0,
  isLoading = false,
}) => {
  const [value, setValue] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue !== undefined && initialValue !== null ? String(initialValue) : "");
    }
  }, [isOpen, initialValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    await onConfirm(numValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-6 shadow-2xl border-none">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-yellow-500 text-2xl">🪙</span>
            {title}
          </DialogTitle>
          {entityName && (
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Target: <span className="text-gray-900 font-bold">{entityName}</span>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Enter Coin Amount
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 500 or -100"
              required
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold text-gray-900 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <p className="text-xs text-gray-400">
              Enter amount (positive or negative, e.g. 500 or -100).
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || value.trim() === ""}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Coin
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
