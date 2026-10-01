/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, QrCode, Download, Coffee, AlertCircle, Loader2 } from "lucide-react";
import { useGetRewardProductQrCodeQuery } from "@/features/rewordProduct/rewordApi";
import { toast } from "sonner";

interface RewardProductQrModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardProductQrModal: React.FC<RewardProductQrModalProps> = ({
  reward,
  isOpen,
  onClose,
}) => {
  const isCoffee = reward?.productType === "Coffee";

  const { data: qrResponse, isLoading } = useGetRewardProductQrCodeQuery(
    reward?._id,
    { skip: !reward?._id || !isOpen || !isCoffee }
  );

  if (!reward) return null;

  const qrData = qrResponse?.data;
  const qrPayloadString = qrData?.qrPayloadString || "";
  const qrImageUrl = qrPayloadString
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        qrPayloadString
      )}`
    : "";

  const handleDownloadQr = async () => {
    if (!qrImageUrl) return;
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${(reward.brand || "Coffee_Reward").replace(/\s+/g, "_")}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      toast.success("Coffee Reward QR Code downloaded successfully");
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-lg text-slate-900"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded border border-amber-200 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
              <Coffee className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                {reward.brand}
              </DialogTitle>
              <p className="text-[11px] text-slate-500 font-medium">
                {Number(reward.point || 0).toLocaleString()} ENG Coins
              </p>
            </div>
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
        <div className="p-5 sm:p-6 space-y-4">
          {isCoffee ? (
            <div className="space-y-4">
              {/* QR Code Container */}
              <div className="p-5 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-3 rounded-md border border-slate-200 shadow-2xs w-48 h-48 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                      <span>Generating QR...</span>
                    </div>
                  ) : qrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrImageUrl}
                      alt={`${reward.brand} QR Code`}
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">
                      Failed to load QR code
                    </span>
                  )}
                </div>

                <div className="mt-3.5 space-y-1">
                  <span className="text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5">
                    <QrCode className="w-3.5 h-3.5 text-amber-700" />
                    <span>Redemption QR Code</span>
                  </span>
                  <p className="text-[11px] text-slate-500 max-w-xs leading-normal">
                    Display or print this QR code at partner facilities. Players scan using the ENG mobile app to deduct {Number(reward.point).toLocaleString()} points.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={isLoading || !qrImageUrl}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900">QR Code Unavailable</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5">
                  Instant QR code generation is exclusively supported for Coffee products. Physical merchandise items are managed through the order dispatch system.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-4 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardProductQrModal;
