"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Check, X, AlertTriangle } from "lucide-react";

interface TransferConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  playerName?: string;
  fromTeam?: string;
  toTeam?: string;
  isLoading?: boolean;
  type: "approve" | "reject";
}

const TransferConfirmModal: React.FC<TransferConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  playerName,
  fromTeam,
  toTeam,
  isLoading = false,
  type,
}) => {
  const isApprove = type === "approve";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent
        showCloseButton={!isLoading}
        className="max-w-md bg-white p-6 border border-slate-200 rounded-lg shadow-sm"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-md border flex items-center justify-center shrink-0 ${
              isApprove
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {isApprove ? (
              <Check className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <DialogTitle className="text-base font-semibold text-slate-900 tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-slate-600 leading-relaxed">
              {description}
            </DialogDescription>

            {playerName && (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500 font-medium">Player</span>
                  <span className="font-semibold text-slate-900">{playerName}</span>
                </div>
                {(fromTeam || toTeam) && (
                  <div className="flex justify-between items-center text-slate-700 pt-1 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium">Movement</span>
                    <span className="font-medium text-slate-800">
                      {fromTeam || "Free Agent"} &rarr; {toTeam || "New Club"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 px-3.5 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`h-8 px-4 rounded-md text-xs font-medium text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700"
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isApprove ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                <span>{isApprove ? "Confirm Approval" : "Confirm Rejection"}</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferConfirmModal;
