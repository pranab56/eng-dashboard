"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LogOut } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

const LogoutConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: LogoutConfirmModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Logout Icon Container */}
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="relative w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                <LogOut className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl font-medium text-gray-900 leading-tight">
                Confirm Logout

              </DialogTitle>
              <DialogDescription className="text-gray-500 text-sm leading-relaxed px-4">
                Are you sure you want to log out of your account?
              </DialogDescription>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl cursor-pointer text-gray-600 font-medium hover:bg-gray-50 border-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl bg-red-600 cursor-pointer hover:bg-red-700 text-white font-medium shadow-lg shadow-red-200 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  Log Out
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutConfirmModal;
