"use client"
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
  type: 'approve' | 'reject';
}

const TransferConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
  type
}: TransferConfirmModalProps) => {
  const isApprove = type === 'approve';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className={cn(
                "absolute inset-0 rounded-full animate-ping opacity-20 scale-150",
                isApprove ? "bg-green-100" : "bg-red-100"
              )}></div>
              <div className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center",
                isApprove ? "bg-green-50" : "bg-red-50"
              )}>
                {isApprove ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-500" />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 leading-tight">
                {title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                {description}
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-12 rounded-xl cursor-pointer text-gray-600 font-bold hover:bg-gray-50 border-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "flex-1 h-12 rounded-xl cursor-pointer text-white font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2",
                isApprove ? "bg-green-600 hover:bg-green-700 shadow-green-200" : "bg-red-600 hover:bg-red-700 shadow-red-200"
              )}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isApprove ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isApprove ? "Approve Now" : "Reject Now"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransferConfirmModal;
