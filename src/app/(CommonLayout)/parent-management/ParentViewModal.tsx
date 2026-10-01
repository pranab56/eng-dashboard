/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { TUserManagement } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Mail,
  User,
  ShieldCheck,
  Phone,
  X,
  Users,
  Check,
  Copy,
  Building2,
  Coins,
  MapPin,
  Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";

interface ParentViewModalProps {
  parent: TUserManagement | null;
  isOpen: boolean;
  onClose: () => void;
}

const ParentViewModal: React.FC<ParentViewModalProps> = ({
  parent,
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!parent) return null;

  const profileUrl = formatImagePath(parent.profile || (parent as any).profilePic);
  const fullName = parent.firstName
    ? `${parent.firstName} ${parent.lastName || ""}`.trim()
    : ((parent as any).userName || (parent as any).name || "Parent Account Owner");

  const initials = fullName.charAt(0).toUpperCase();
  const children = parent.myPlayers || (parent as any).children || [];

  const handleCopyText = async (text: string, label: string) => {
    if (!text) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-3xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-7 w-7 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="relative h-12 w-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-base font-semibold text-slate-600 uppercase select-none">
                  {initials}
                </span>
              )}
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5 truncate">
                {fullName}
                {parent.verified && (
                  <span title="Verified Account"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" /></span>
                )}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500">
                <span className="truncate">{parent.email || "No email on record"}</span>
                {parent.createdAt && (
                  <>
                    <span>•</span>
                    <span className="tabular-nums">
                      Joined {dayjs(parent.createdAt).format("MMM DD, YYYY")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-130px)] text-slate-800">
          {/* Primary Parent Contact Strip */}
          <div className="border border-slate-200 rounded-md p-3.5 bg-slate-50/50 space-y-2.5">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Parent Contact & Account Details
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">Username / Account</span>
                <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                  {(parent as any).userName || "N/A"}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Email Address</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 truncate">{parent.email || "N/A"}</span>
                  {parent.email && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(parent.email!, "Parent Email")}
                      className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === "Parent Email" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block">Contact Phone</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-800 tabular-nums truncate">
                    {parent.phone || "N/A"}
                  </span>
                  {parent.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(parent.phone!, "Parent Phone")}
                      className="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === "Parent Phone" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Linked Child Players Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Linked Child Players ({children.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                {children.filter((c: any) => Boolean(c.subscription || c.isPaid)).length} with active subscription
              </span>
            </div>

            {children.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-md bg-slate-50/50">
                <User className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">No Child Players Linked</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  This parent has not completed registration for any children yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {children.map((child: any, idx: number) => {
                  const childName = child.firstName
                    ? `${child.firstName} ${child.lastName || ""}`.trim()
                    : (child.userName || `Child Player ${idx + 1}`);
                  const childProfile = formatImagePath(child.profile || child.profilePic);
                  const childSub = child.subscription || child.activeSubscription;
                  const isPaid = Boolean(childSub || child.isPaid);

                  return (
                    <div
                      key={child._id || idx}
                      className="border border-slate-200 rounded-md p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Left: Player Identity */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {childProfile ? (
                            <Image
                              src={childProfile}
                              alt={childName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-slate-500 uppercase select-none">
                              {childName.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-xs truncate">
                              {childName}
                            </span>
                            {child.status && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                  child.status === "APPROVED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}
                              >
                                {child.status}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            {child.position && <span>{child.position}</span>}
                            {child.ageGroup && (
                              <>
                                <span>•</span>
                                <span className="font-medium text-slate-700">{child.ageGroup}</span>
                              </>
                            )}
                            {child.selectTeam?.teamName && (
                              <>
                                <span>•</span>
                                <span className="text-slate-700 font-medium">
                                  {child.selectTeam.teamName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Subscription & Coins */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        {/* Subscription Pill */}
                        {isPaid && childSub ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            {childSub.packageName || "ENG Subscription"} • £{childSub.price ?? 0}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            Free / No Plan
                          </span>
                        )}

                        {/* Coin Balance */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-700 text-[11px]">
                          <Coins className="w-3 h-3 text-slate-500" />
                          <span className="font-semibold tabular-nums">
                            {Number(child.engCoine ?? child.coin ?? 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentViewModal;
