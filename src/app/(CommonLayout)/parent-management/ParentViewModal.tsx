/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { TUserManagement } from '@/types/columnTypes';
import { formatImagePath } from '@/utils/formatImagePath';
import {
  Mail,
  User,
  ShieldCheck,
  Phone,
  X,
  Users,
  Sparkles,
  Check,
  Copy,
  Building2,
  Coins,
} from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';

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
    ? `${parent.firstName} ${parent.lastName || ''}`.trim()
    : ((parent as any).userName || (parent as any).name || 'Parent Account Owner');

  const initials = fullName.charAt(0).toUpperCase();
  const children = parent.myPlayers || (parent as any).children || [];

  const handleCopyText = async (text: string, label: string) => {
    if (!text) return;
    let copied = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        textArea.style.top = '0';
        textArea.style.left = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copied = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      setCopiedField(label);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error(`Failed to copy ${label}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-3xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col">

        {/* Header Banner */}
        <DialogHeader className="bg-indigo-50/80 p-5 sm:p-6 border-b border-indigo-100 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30 shadow-xs"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl bg-white border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
              {profileUrl ? (
                <Image
                  src={profileUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-indigo-700">{initials}</span>
              )}
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {fullName}
                {parent.verified && (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>{parent.email || 'Parent Account Owner'}</span>
                {parent.createdAt && (
                  <>
                    <span>•</span>
                    <span>Member since {dayjs(parent.createdAt).format('MMM DD, YYYY')}</span>
                  </>
                )}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Parent Account Owner
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                  {children.length} {children.length === 1 ? 'Child Player' : 'Child Players'}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[68vh] hide-scrollbar text-slate-800">

          {/* Primary Parent Contact Card */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-600" /> Parent Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Full Name</p>
                <p className="text-xs font-bold text-slate-900">{fullName}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-500">Email Address</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {parent.email || 'N/A'}
                  </p>
                  {parent.email && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(parent.email!, 'Parent Email')}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy Email"
                    >
                      {copiedField === 'Parent Email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-slate-500">Contact Phone</p>
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    {parent.phone || 'N/A'}
                  </p>
                  {parent.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(parent.phone!, 'Parent Phone')}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy Phone"
                    >
                      {copiedField === 'Parent Phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Registered Child Players Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" /> Registered Child Players ({children.length})
              </h3>
            </div>

            {children.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">No child players added under this parent yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {children.map((child: any, idx: number) => {
                  const childName = child.firstName
                    ? `${child.firstName} ${child.lastName || ''}`.trim()
                    : (child.userName || `Player ${idx + 1}`);
                  const childPic = formatImagePath(child.profile || child.profilePic);
                  const childTeam = child.selectTeam;

                  return (
                    <div
                      key={child._id || idx}
                      className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs hover:border-indigo-200 transition-all space-y-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {childPic ? (
                            <Image
                              src={childPic}
                              alt={childName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold text-slate-600">{childName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{childName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {child.position && (
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded border border-indigo-200">
                                {child.position}
                              </span>
                            )}
                            {child.ageGroup && (
                              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.2 rounded border border-blue-200">
                                {child.ageGroup}
                              </span>
                            )}
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border shrink-0 ${
                          child.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {child.status || 'PENDING'}
                        </span>
                      </div>

                      {/* Individual Child Subscription Details */}
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          Plan:
                        </span>
                        {child.subscription ? (
                          <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                            {child.subscription.packageName || 'Active Plan'} • £{child.subscription.price}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                            Free / Unsubscribed
                          </span>
                        )}
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 font-medium text-[10px] block">Assigned Team</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                            <Building2 className="w-3 h-3 text-indigo-500 shrink-0" />
                            {childTeam?.teamName || childTeam?.shortName || 'Not Assigned'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 font-medium text-[10px] block">ENG Coins</span>
                          <span className="font-semibold text-amber-800 flex items-center gap-1">
                            <Coins className="w-3 h-3 text-amber-600 shrink-0" />
                            {Number(child.engCoine || child.coin || 0)} Coins
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

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentViewModal;
