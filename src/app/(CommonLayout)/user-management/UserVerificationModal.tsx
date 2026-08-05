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
  Shield
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

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

  if (!user) return null;

  const profileUrl = formatImagePath(user.profile || user.profilePic);
  const initials = (user.userName || user.name || 'U').charAt(0).toUpperCase();
  const currentStatus = (user.status || 'PENDING').toUpperCase();

  // Extract possible document paths
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
    pushDoc(user.tradeLicense);
    pushDoc(user.certificate);
    pushDoc(user.verificationDoc);
    pushDoc(user.idProof);

    return docs;
  };

  const documentList = getDocumentList();
  const selectedTeam = user.selectTeam;

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
        <DialogContent showCloseButton={false} className="sm:max-w-3xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

          {/* Header Banner */}
          <DialogHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative overflow-hidden">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-30 backdrop-blur-md border border-white/20"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Background Accent Gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                  {profileUrl ? (
                    <Image
                      src={profileUrl}
                      alt={user.userName || 'user'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-black text-white">{initials}</span>
                  )}
                </div>

                <div>
                  <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                    {user.userName || user.name || 'Unknown User'}
                    {user.verified && (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 fill-emerald-400/20 shrink-0" />
                    )}
                  </DialogTitle>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{user.email || 'No email provided'}</p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-200">
                      {user.role ? user.role.replace(/_/g, ' ') : 'USER'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${currentStatus === 'APPROVED'
                        ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                        : currentStatus === 'REJECTED'
                          ? 'bg-rose-500/20 border-rose-400/30 text-rose-300'
                          : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
                        }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Body Content */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

            {/* User Info Details Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" /> Member Information
              </h3>

              <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-2xl border border-gray-100">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400">Full Name</p>
                  <p className="text-sm font-bold text-gray-900">{user.userName || user.name || 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400">Role / Type</p>
                  <p className="text-sm font-bold text-gray-900 capitalize">{user.role ? user.role.toLowerCase().replace(/_/g, ' ') : 'N/A'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400">Email Address</p>
                  <p className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {user.email || 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-gray-400">Phone Number</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {user.phone || user.phoneNumber || 'N/A'}
                  </p>
                </div>

                {user.createdAt && (
                  <div className="space-y-1 col-span-2 pt-1 border-t border-gray-200/60">
                    <p className="text-[11px] font-semibold text-gray-400">Registration Date</p>
                    <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {dayjs(user.createdAt).format('MMMM DD, YYYY • hh:mm A')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Academy Info Section */}
            {user.role === 'PLAYER' && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-600" /> Academy & Registration Status
                </h3>
                <div className="p-4 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-100 rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                    <span>Plays for CAT 1-3 Academy?</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.playForAcademy ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.playForAcademy ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {user.playForAcademy && (
                    <div className="pt-2 border-t border-amber-200/40 flex justify-between items-center text-sm font-semibold text-gray-700">
                      <span>Club Name</span>
                      <span className="text-gray-900 font-bold">{user.academyClubName || 'N/A'}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-amber-200/40 flex justify-between items-center text-sm font-semibold text-gray-700">
                    <span>Development Player?</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.isDevelopmentPlayer ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
                      {user.isDevelopmentPlayer ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-amber-200/40 flex justify-between items-center text-sm font-semibold text-gray-700">
                    <span>Media Consent Provided?</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${user.mediaConsent ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                      {user.mediaConsent ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Selected Team Card Section */}
            {selectedTeam && (selectedTeam.teamName || selectedTeam.shortName) && (
              <div className="space-y-2">
                <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" /> Associated Team / Club
                </h3>

                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100 rounded-2xl shadow-sm">
                  <div className="relative w-12 h-12 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                    {selectedTeam.teamLogo ? (
                      <Image
                        src={formatImagePath(selectedTeam.teamLogo)}
                        alt={selectedTeam.teamName || 'team logo'}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <Shield className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-gray-900 truncate">
                        {selectedTeam.teamName || 'Team'}
                      </h4>
                      {selectedTeam.shortName && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">
                          {selectedTeam.shortName}
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* Verification Documents Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Submitted Verification Documents
                </h3>
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  {documentList.length} Attached
                </span>
              </div>

              {documentList.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {documentList.map((docUrl, idx) => {
                    const isPdf = docUrl.toLowerCase().endsWith('.pdf');

                    if (isPdf) {
                      return (
                        <div
                          key={idx}
                          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-black text-xs shrink-0">
                              PDF
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                Document {idx + 1}
                              </p>
                              <p className="text-[10px] text-gray-400 truncate">
                                {docUrl.split('/').pop() || 'file.pdf'}
                              </p>
                            </div>
                          </div>

                          <a
                            href={docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2 bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View / Download PDF
                          </a>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={idx}
                        className="group relative bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 transition-all shadow-sm"
                      >
                        <div className="relative h-40 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          <Image
                            src={docUrl}
                            alt={`Document ${idx + 1}`}
                            fill
                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => setPreviewImage(docUrl)}
                              className="p-2.5 bg-white/90 rounded-full text-gray-900 hover:bg-white transition-colors cursor-pointer shadow-lg flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
                              title="Zoom / View full image"
                            >
                              <ZoomIn className="w-4 h-4" /> View Image
                            </button>
                          </div>
                        </div>
                        <div className="p-2.5 bg-white border-t border-gray-100 text-center">
                          <p className="text-xs font-semibold text-gray-700 truncate">
                            Verification Document {idx + 1}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-6 bg-amber-50/60 border border-amber-200/80 rounded-2xl text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-500" />
                  <p className="text-sm font-extrabold text-amber-900">No Documents Uploaded</p>
                  <p className="text-xs text-amber-700/80 max-w-sm">
                    This user registered without attaching any identity or business verification documents.
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Action Footer */}
          <div className="p-4 px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRejectAction}
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject Verification
              </button>

              <button
                type="button"
                onClick={handleApproveAction}
                disabled={isUpdating}
                className="flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve Verification
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl bg-white rounded-3xl p-6 border border-gray-100 shadow-2xl animate-in zoom-in-95 duration-200 z-[100]">
          <DialogHeader className="pb-3 border-b border-gray-100">
            <DialogTitle className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Verification Document Preview
            </DialogTitle>
          </DialogHeader>

          {previewImage && (
            <div className="relative w-full h-[65vh] bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 mt-2 flex items-center justify-center p-2">
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
