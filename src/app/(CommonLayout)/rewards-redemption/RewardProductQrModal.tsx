"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Sparkles, QrCode, Download, Coffee, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
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
      toast.success("Coffee Reward QR Code downloaded successfully!");
    } catch {
      window.open(qrImageUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200"
      >
        {/* HEADER BANNER */}
        <DialogHeader className="bg-slate-50 p-5 sm:p-6 border-b border-slate-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0 shadow-sm">
              <Coffee className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                {reward.brand}
              </DialogTitle>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCoffee
                      ? "bg-amber-100 text-amber-800 border border-amber-300"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {reward.productType || "Item"}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {reward.point} Points
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* MODAL BODY */}
        <div className="p-6 space-y-6 text-slate-800">
          {isCoffee ? (
            <div className="space-y-6">
              {/* QR DISPLAY CARD */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center gap-4 text-center">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm relative w-52 h-52 flex items-center justify-center">
                  {isLoading ? (
                    <div className="flex flex-col items-center gap-2 text-slate-400 text-xs font-semibold">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                      <span>Generating QR Code...</span>
                    </div>
                  ) : qrImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={qrImageUrl}
                      alt={`${reward.brand} QR Code`}
                      className="w-48 h-48 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 font-medium">
                      Failed to load QR code
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1.5">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    Coffee Reward Redemption QR Code
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium max-w-xs">
                    Scan this QR code in the app to claim or redeem{" "}
                    <strong className="text-slate-900">{reward.brand}</strong> ({reward.point} pts).
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  disabled={isLoading || !qrImageUrl}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-amber-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Code</span>
                </button>
              </div>
            </div>
          ) : (
            /* NON-COFFEE WARNING BOX */
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1 max-w-xs mx-auto">
                <h4 className="font-bold text-sm text-slate-900">
                  QR Code Unavailable
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  QR code generation is strictly restricted to{" "}
                  <strong className="text-amber-700">Coffee</strong> product types.
                  Non-coffee items ({reward.productType}) do not generate QR codes.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardProductQrModal;
