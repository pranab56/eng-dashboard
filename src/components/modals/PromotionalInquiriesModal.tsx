/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X, User, Phone, Mail, FileText, Check, Clock, AlertCircle } from "lucide-react";
import {
  useGetPromotionInquiriesQuery,
  useUpdateInquiryStatusMutation,
} from "@/features/promotionalZone/promotionalZoneApi";
import { TPromotionalZone } from "@/types/columnTypes";
import dayjs from "dayjs";
import { toast } from "sonner";

interface PromotionalInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: TPromotionalZone | null;
}

export default function PromotionalInquiriesModal({
  isOpen,
  onClose,
  promotion,
}: PromotionalInquiriesModalProps) {
  const { data: resData, isLoading } = useGetPromotionInquiriesQuery(
    { id: promotion?._id },
    { skip: !isOpen || !promotion?._id }
  );
  const [updateStatus, { isLoading: isUpdating }] = useUpdateInquiryStatusMutation();

  if (!isOpen || !promotion) return null;

  const inquiries = resData?.data || [];

  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    try {
      await updateStatus({ inquiryId, status: newStatus }).unwrap();
      toast.success(`Inquiry status updated to ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Applications & Inquiries ({inquiries.length})
            </h2>
            <p className="text-xs text-slate-500 truncate max-w-md mt-0.5">
              For: <span className="font-medium text-slate-700">{promotion.title}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading inquiries...</div>
          ) : inquiries.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-1">
              <User className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No inquiries received yet.</p>
              <p className="text-[11px] text-slate-400">
                Interested players and parents will appear here when they register.
              </p>
            </div>
          ) : (
            inquiries.map((inq: any) => (
              <div
                key={inq._id}
                className="p-4 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{inq.applicantName}</h4>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                      {inq.age && <span>Age: {inq.age} yrs</span>}
                      {inq.playingPosition && (
                        <span>Position: <strong className="text-slate-700">{inq.playingPosition}</strong></span>
                      )}
                      <span>· {dayjs(inq.createdAt).format("MMM D, YYYY h:mm A")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold capitalize ${
                        inq.status === "enrolled"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : inq.status === "contacted"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : inq.status === "rejected"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {inq.status || "pending"}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-md border border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${inq.phone}`} className="hover:text-blue-600 font-medium">
                      {inq.phone}
                    </a>
                  </div>
                  {inq.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${inq.email}`} className="hover:text-blue-600">
                        {inq.email}
                      </a>
                    </div>
                  )}
                </div>

                {inq.notes && (
                  <div className="text-[11px] text-slate-600 bg-amber-50/40 p-2 rounded border border-amber-100/60 flex items-start gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>"{inq.notes}"</span>
                  </div>
                )}

                {/* Status Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 mr-auto">Mark status:</span>
                  <button
                    type="button"
                    disabled={isUpdating || inq.status === "contacted"}
                    onClick={() => handleStatusChange(inq._id, "contacted")}
                    className="px-2 py-0.8 text-[10px] font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer disabled:opacity-40"
                  >
                    Contacted
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating || inq.status === "enrolled"}
                    onClick={() => handleStatusChange(inq._id, "enrolled")}
                    className="px-2 py-0.8 text-[10px] font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer disabled:opacity-40"
                  >
                    Enrolled
                  </button>
                  <button
                    type="button"
                    disabled={isUpdating || inq.status === "rejected"}
                    onClick={() => handleStatusChange(inq._id, "rejected")}
                    className="px-2 py-0.8 text-[10px] font-semibold rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer disabled:opacity-40"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
