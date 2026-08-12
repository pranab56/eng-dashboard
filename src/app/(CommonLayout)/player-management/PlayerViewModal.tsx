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
import { TPlayer } from '@/types/columnTypes';
import { formatImagePath } from '@/utils/formatImagePath';
import {
  FileText,
  Mail,
  User,
  ShieldCheck,
  Calendar,
  Phone,
  ZoomIn,
  X,
  Building2,
  Users,
  Coins,
  Sparkles,
  Check,
  Copy,
  MapPin,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useUpdateEngCoinBudgetMutation } from '@/features/player/playerApi';
import { getErrorMessage } from '@/utils/getErrorMessage';

interface PlayerViewModalProps {
  player: TPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerViewModal: React.FC<PlayerViewModalProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [updateEngCoinBudget] = useUpdateEngCoinBudgetMutation();
  const [isEditingEconomy, setIsEditingEconomy] = useState(false);
  const [editCoinsInput, setEditCoinsInput] = useState<number | string>("");
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  React.useEffect(() => {
    if (player) {
      setEditCoinsInput(Number((player as any).engCoine ?? (player as any).coin ?? 0));
    }
  }, [player]);

  const handleSaveEconomy = async () => {
    if (!player) return;
    try {
      setIsSavingEconomy(true);
      const newCoins = Number(editCoinsInput) || 0;
      const newMarketValue = newCoins * 100;
      const res = await updateEngCoinBudget({
        id: (player as any)._id || (player as any).id,
        data: { engCoine: newCoins, marketValue: newMarketValue },
      }).unwrap();

      if (res.success) {
        toast.success(res.message || "ENG Coins & Market Value updated successfully");
        setIsEditingEconomy(false);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update ENG Coins"));
    } finally {
      setIsSavingEconomy(false);
    }
  };

  if (!player) return null;

  const profileUrl = formatImagePath(player.profile || (player as any).profilePic);
  const fullName = player.firstName
    ? `${player.firstName} ${player.lastName || ''}`.trim()
    : ((player as any).userName || (player as any).name || 'Player Profile');

  const initials = fullName.charAt(0).toUpperCase();
  const currentStatus = ((player as any).status || 'APPROVED').toUpperCase();

  // Parent Info Extraction
  const parentObj = typeof player.parentId === 'object' && player.parentId ? (player.parentId as any) : null;
  const parentName = parentObj
    ? `${parentObj.firstName || ''} ${parentObj.lastName || ''}`.trim() || parentObj.userName || 'Parent Account Owner'
    : null;
  const parentEmail = parentObj?.email || null;
  const parentPhone = parentObj?.phone || null;

  const coins = Number((player as any).engCoine ?? (player as any).coin ?? 0);
  const marketValue = Number((player as any).marketValue) || (coins * 100);

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

    pushDoc((player as any).document);
    pushDoc((player as any).documents);
    pushDoc((player as any).nid);
    pushDoc((player as any).passport);
    pushDoc((player as any).idProof);

    return docs;
  };

  const documentList = getDocumentList();
  const selectedTeam = (player as any).selectTeam;

  const handleCopyText = async (text: string, label: string) => {
    if (!text) return;
    let copied = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch (e) {
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
      } catch (err) {
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
                  {(player as any).verified && (
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </DialogTitle>
                <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                  <span>{(player as any).email || parentEmail || 'Managed Player Profile'}</span>
                  {(player as any).createdAt && (
                    <>
                      <span>•</span>
                      <span>Registered {dayjs((player as any).createdAt).format('MMM DD, YYYY')}</span>
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                    {(player as any).role ? (player as any).role.replace(/_/g, ' ') : 'PLAYER'}
                  </span>

                  {(player as any).ageGroup && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                      {(player as any).ageGroup}
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

            {/* Parent / Account Owner Details Card */}
            {(parentName || parentEmail || parentPhone) && (
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
                          className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
            )}

            {/* Primary Details Card */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-600" /> Player Profile Information
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">First Name</p>
                  <p className="text-xs font-bold text-slate-900">{player.firstName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Last Name</p>
                  <p className="text-xs font-bold text-slate-900">{player.lastName || 'N/A'}</p>
                </div>

                {(player as any).email && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Email Address</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{(player as any).email}</p>
                  </div>
                )}

                {(player as any).phone && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Phone Number</p>
                    <p className="text-xs font-bold text-slate-900">{(player as any).phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Date of Birth</p>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {(player as any).dateOfBirth ? dayjs((player as any).dateOfBirth).format('DD MMM YYYY') : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Position</p>
                  <p className="text-xs font-bold text-slate-900">{player.position || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Strong Foot</p>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {(player as any).strongFoot || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Location / City</p>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {(player as any).location || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Previous Club</p>
                  <p className="text-xs font-bold text-slate-900">{(player as any).previousClub || 'None'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Academy Player</p>
                  <p className="text-xs font-bold text-slate-900">
                    {(player as any).playForAcademy ? `Yes (${(player as any).academyClubName || 'Academy'})` : 'No'}
                  </p>
                </div>

                {(player as any).emergencyEmail && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Emergency Email</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{(player as any).emergencyEmail}</p>
                  </div>
                )}

                {(player as any).emergencyPhone && (
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Emergency Phone</p>
                    <p className="text-xs font-bold text-slate-900">{(player as any).emergencyPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Assigned Team Card */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" /> Assigned Club / Team
              </h3>

              {selectedTeam || player.teamName ? (
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="relative w-11 h-11 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {selectedTeam?.teamLogo || player.teamLogo ? (
                      <Image
                        src={formatImagePath(selectedTeam?.teamLogo || player.teamLogo)}
                        alt={selectedTeam?.teamName || player.teamName || 'Team'}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{selectedTeam?.teamName || player.teamName}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {selectedTeam?.shortName || player.shortName ? `Tag: ${selectedTeam?.shortName || player.shortName}` : 'Registered Team'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-medium text-slate-500 italic">No club or team currently assigned (Free Agent).</p>
              )}
            </div>

            {/* Economy Card */}
            <div className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" /> Player Economy & ENG Coins
                </h3>
                {!isEditingEconomy ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingEconomy(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200/80 rounded-lg transition-colors cursor-pointer"
                  >
                    Edit Coins
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingEconomy(false)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-200/80 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!isEditingEconomy ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                    <p className="text-[11px] font-semibold text-slate-500">ENG Coin Balance</p>
                    <p className="text-base font-bold text-amber-900 flex items-center gap-1.5 mt-0.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> {coins.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs">
                    <p className="text-[11px] font-semibold text-slate-500">Market Value</p>
                    <p className="text-base font-bold text-emerald-700 mt-0.5">
                      £{marketValue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-3.5 rounded-xl border border-amber-300 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Update ENG Coin Amount
                    </label>
                    <input
                      type="number"
                      value={editCoinsInput}
                      onChange={(e) => setEditCoinsInput(e.target.value)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="Enter new coins value..."
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Market Value will automatically update to: £{((Number(editCoinsInput) || 0) * 100).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSavingEconomy}
                      onClick={handleSaveEconomy}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {isSavingEconomy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Save Economy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Uploaded Documents & ID Proofs */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-600" /> Uploaded ID & Verification Documents ({documentList.length})
              </h3>

              {documentList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {documentList.map((docUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setPreviewImage(docUrl)}
                      className="group relative h-28 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex items-center justify-center"
                    >
                      <Image
                        src={docUrl}
                        alt={`Document ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 text-xs font-semibold backdrop-blur-[1px]">
                        <ZoomIn className="w-4 h-4" /> View
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400 bg-white p-3 rounded-xl border border-slate-200">
                  <AlertCircle className="w-4 h-4 text-slate-400 shrink-0" />
                  No verification documents or ID proof uploaded for this player profile.
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              Player ID: <span className="font-mono text-[11px] text-slate-700">{player._id || (player as any).id}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Close Details
            </button>
          </div>

        </DialogContent>
      </Dialog>

      {/* Full-Screen Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-transparent rounded-2xl overflow-hidden flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-[85vw] max-w-3xl h-[80vh]">
              <Image
                src={previewImage}
                alt="Document Full Preview"
                fill
                className="object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerViewModal;
