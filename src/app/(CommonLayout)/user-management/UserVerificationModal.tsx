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
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  User,
  ShieldCheck,
  Calendar,
  Phone,
  ZoomIn,
  X,
  AlertCircle,
  Building2,
  ExternalLink,
  Shield,
  Users,
  Coins,
  Sparkles,
  Check,
  Copy
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

interface UserVerificationModalProps {
  user: TUserManagement | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  isUpdating?: boolean;
}

const UserVerificationModal: React.FC<UserVerificationModalProps> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isUpdating = false,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!user) return null;

  const profileUrl = formatImagePath(user.profile || user.profilePic);
  const fullName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : (user.userName || user.name || 'Member Profile');

  const initials = fullName.charAt(0).toUpperCase();
  const currentStatus = (user.status || 'PENDING').toUpperCase();
  const isPlayer = user.role === 'PLAYER';

  // Parent Info Extraction
  const parentObj = typeof user.parentId === 'object' && user.parentId ? (user.parentId as any) : null;
  const parentName = parentObj
    ? `${parentObj.firstName || ''} ${parentObj.lastName || ''}`.trim() || parentObj.userName || 'Parent Account Owner'
    : null;
  const parentEmail = parentObj?.email || null;
  const parentPhone = parentObj?.phone || null;

  const coins = Number((user as any).engCoine) || 0;
  const marketValue = Number((user as any).marketValue) || (coins * 100);

  // Extract Document List
  const getDocumentList = (): string[] => {
    const docs: string[] = [];
    const pushDoc = (val: any) => {
      if (typeof val === 'string' && val.trim()) {
        docs.push(formatImagePath(val));
      } else if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === 'string' && item.trim()) {
            docs.push(formatImagePath(item));
          }
        });
      }
    };

    pushDoc(user.document);
    pushDoc(user.documents);
    pushDoc(user.nid);
    pushDoc(user.passport);
    pushDoc(user.idProof);

    return docs;
  };

  const documentList = getDocumentList();
  const selectedTeam = user.selectTeam;

  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleApproveAction = async () => {
    await onApprove(user._id);
    onClose();
  };

  const handleRejectAction = async () => {
    await onReject(user._id);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent showCloseButton={false} className="sm:max-w-3xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col">

          {/* Clean Light Header Banner */}
          <DialogHeader className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                {profileUrl ? (
                  <Image
                    src={profileUrl}
                    alt={fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-700">{initials}</span>
                )}
              </div>

              <div>
                <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {fullName}
                  {user.verified && (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                  <span>{user.email || parentEmail || 'Managed Player Profile'}</span>
                  {user.createdAt && (
                    <>
                      <span>•</span>
                      <span>Registered {dayjs(user.createdAt).format('MMM DD, YYYY')}</span>
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {user.role ? user.role.replace(/_/g, ' ') : 'USER'}
                  </span>

                  {user.ageGroup && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {user.ageGroup}
                    </span>
                  )}

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                      currentStatus === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : currentStatus === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {currentStatus}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Body Container */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[68vh] hide-scrollbar text-slate-800">

            {/* Parent / Account Owner Details Card (If viewing a Player) */}
            {isPlayer && (parentName || parentEmail || parentPhone) && (
              <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" /> Parent / Account Owner Information
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                    Account Owner
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Parent Name</p>
                    <p className="text-xs font-bold text-slate-900">{parentName || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Parent Email</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {parentEmail || 'N/A'}
                      </p>
                      {parentEmail && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(parentEmail, 'Parent Email')}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy Email"
                        >
                          {copiedField === 'Parent Email' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Parent Contact Phone</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        {parentPhone || 'N/A'}
                      </p>
                      {parentPhone && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(parentPhone, 'Parent Phone')}
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy Phone"
                        >
                          {copiedField === 'Parent Phone' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Primary Details Card */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-600" /> Profile Information
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">First Name</p>
                  <p className="text-xs font-bold text-slate-900">{user.firstName || user.userName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Last Name</p>
                  <p className="text-xs font-bold text-slate-900">{user.lastName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Date of Birth</p>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {user.dateOfBirth ? dayjs(user.dateOfBirth).format('DD MMM YYYY') : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Age Group</p>
                  <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block">
                    {user.ageGroup || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Position</p>
                  <p className="text-xs font-bold text-slate-900">{user.position || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Strong Foot</p>
                  <p className="text-xs font-bold text-slate-900">{user.strongFoot || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">ENG Coins</p>
                  <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    {coins} Coins
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Market Value</p>
                  <p className="text-xs font-bold text-emerald-600">
                    £{marketValue.toLocaleString()}
                  </p>
                </div>

                {user.previousClub && (
                  <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                    <p className="text-[11px] font-semibold text-slate-500">Previous Club / Team</p>
                    <p className="text-xs font-bold text-slate-900">{user.previousClub}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Club & Academy Credentials Section */}
            {(isPlayer || selectedTeam) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* Team Card */}
                <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" /> Associated Team / Club
                  </h3>

                  {selectedTeam && (selectedTeam.teamName || selectedTeam.shortName) ? (
                    <div className="flex items-center gap-3 p-2.5 bg-white border border-slate-200 rounded-xl">
                      <div className="relative w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {selectedTeam.teamLogo ? (
                          <Image
                            src={formatImagePath(selectedTeam.teamLogo)}
                            alt={selectedTeam.teamName || 'team logo'}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <Shield className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {selectedTeam.teamName || 'Unassigned Team'}
                        </h4>
                        {selectedTeam.shortName && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200 uppercase">
                            {selectedTeam.shortName}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No associated club assigned yet</p>
                  )}
                </div>

                {/* Academy & Consent Status Card */}
                {isPlayer && (
                  <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Academy & Consent Status
                    </h3>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">Plays for CAT 1-3 Academy?</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${user.playForAcademy ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                          {user.playForAcademy ? `Yes (${user.academyClubName || 'Club'})` : 'No'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">Development Player?</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${user.isDevelopmentPlayer ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                          {user.isDevelopmentPlayer ? 'Yes' : 'No'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">Filming & Media Consent?</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${user.mediaConsent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                          {user.mediaConsent ? 'Granted' : 'Not Granted'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Verification Documents Section */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" /> Submitted Proof of Age / Identity Documents
                </h3>
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                  {documentList.length} File(s) Attached
                </span>
              </div>

              {documentList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {documentList.map((docUrl, idx) => {
                    const isPdf = docUrl.toLowerCase().endsWith('.pdf');

                    if (isPdf) {
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col justify-between space-y-2 shadow-xs hover:border-slate-300 transition-all"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                Document {idx + 1}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {docUrl.split('/').pop() || 'document.pdf'}
                              </p>
                            </div>
                          </div>

                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View PDF Document
                          </a>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
                      >
                        <div className="relative h-40 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          <Image
                            src={docUrl}
                            alt={`Document ${idx + 1}`}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(docUrl)}
                              className="px-3 py-1.5 bg-white text-slate-900 rounded-lg font-semibold text-xs shadow-md flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5 text-slate-700" /> Preview
                            </button>
                          </div>
                        </div>
                        <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                          <p className="text-xs font-semibold text-slate-700">
                            Proof Document {idx + 1}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-5 bg-white border border-amber-200 rounded-xl text-center space-y-1">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                  <p className="text-xs font-bold text-amber-800">No Documents Uploaded</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    This profile was submitted without attaching identity verification documents.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close Window
            </button>

            {currentStatus === 'PENDING' ? (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleRejectAction}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                  Reject Profile
                </button>

                <button
                  type="button"
                  onClick={handleApproveAction}
                  disabled={isUpdating}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  Approve Profile
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                    currentStatus === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  {currentStatus === 'APPROVED' ? 'Profile Approved' : 'Profile Rejected'}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full-Screen Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl bg-white rounded-3xl p-5 border-none shadow-2xl z-[100]">
          <DialogHeader className="pb-2 border-b border-slate-100">
            <DialogTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" /> Document Preview
            </DialogTitle>
          </DialogHeader>

          {previewImage && (
            <div className="relative w-full h-[65vh] bg-slate-50 rounded-xl overflow-hidden border border-slate-100 mt-2 flex items-center justify-center p-2">
              <Image
                src={previewImage}
                alt="Document Preview"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserVerificationModal;
