"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { TUserManagement } from "@/types/columnTypes";

interface DeleteConfirmationModalProps {
  user?: TUserManagement | any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void> | void;
  isDeleting?: boolean;
  title?: string;
  description?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  title = "Confirm Account Deletion",
  description = "Are you sure you want to permanently delete this user account? This action cannot be undone.",
}) => {
  const userName =
    user?.userName ||
    user?.name ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.email ||
    "User";

  const handleConfirm = async () => {
    if (user?._id) {
      await onConfirm(user._id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md bg-white dark:bg-slate-900 rounded-lg p-6 border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Subtle Warning Icon */}
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>

          <div className="space-y-1.5 w-full">
            <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
              {description}
            </DialogDescription>

            {user && (
              <div className="mt-2.5 p-2 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs mx-auto">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {userName}
                </span>
                {user.email && (
                  <span className="text-slate-500 dark:text-slate-400 font-normal">
                    {" "}
                    ({user.email})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 h-9 rounded-md text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 h-9 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmationModal;
