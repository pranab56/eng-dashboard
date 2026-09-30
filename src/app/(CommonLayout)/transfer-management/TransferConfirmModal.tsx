"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from "lucide-react";

interface TransferConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  type: "approve" | "reject";
}

const TransferConfirmModal: React.FC<TransferConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  type,
}) => {
  const isApprove = type === "approve";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Status Icon */}
          <div
            className={`w-10 h-10 rounded-full border flex items-center justify-center ${
              isApprove
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/40 text-red-600 dark:text-red-400"
            }`}
          >
            {isApprove ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
          </div>

          <div className="space-y-1.5 w-full">
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {description}
            </DialogDescription>
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-9 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 h-9 rounded-md text-xs font-medium text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 ${
              isApprove
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isApprove ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                <span>{isApprove ? "Approve" : "Reject"}</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferConfirmModal;
