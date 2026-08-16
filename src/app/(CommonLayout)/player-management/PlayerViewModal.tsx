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
  AlertCircle,
  CreditCard,
  Edit3,
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useUpdateEngCoinBudgetMutation, useUpdatePlayerMutation } from '@/features/player/playerApi';
import { useGetAllTeamQuery } from '@/features/teamManagement/teamApi';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { TeamSelectDropdown } from '@/components/dropdowns/TeamSelectDropdown';

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

  // Team Selection States
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [selectedTeamIdInput, setSelectedTeamIdInput] = useState<string>('');
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const { data: teamData } = useGetAllTeamQuery({ limit: 1000 });
  const allTeams = teamData?.data?.result || teamData?.data || [];

  const [updatePlayer] = useUpdatePlayerMutation();
  const [updateEngCoinBudget] = useUpdateEngCoinBudgetMutation();
  const [isEditingEconomy, setIsEditingEconomy] = useState(false);
  const [editCoinsInput, setEditCoinsInput] = useState<number | string>("");
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);

  React.useEffect(() => {
    if (player) {
      setEditCoinsInput(Number((player as any).engCoine ?? (player as any).coin ?? 0));
      const curTeamId = (player as any).selectTeam?._id || (player as any).selectTeam || '';
      setSelectedTeamIdInput(typeof curTeamId === 'string' ? curTeamId : (curTeamId as any)?._id || '');
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

  const handleSaveTeam = async () => {
    if (!player) return;
    try {
      setIsSavingTeam(true);
      const playerId = (player as any)._id || (player as any).id;
      const res = await updatePlayer({
        id: playerId,
        data: { selectTeam: selectedTeamIdInput || null },
      }).unwrap();

      if (res.success) {
        toast.success("Player team updated successfully");
        setIsEditingTeam(false);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update player team"));
    } finally {
      setIsSavingTeam(false);
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
  const parentObj = typeof (player as any).parentId === 'object' && (player as any).parentId ? ((player as any).parentId as any) : null;
  const parentName = parentObj
    ? `${parentObj.firstName || ''} ${parentObj.lastName || ''}`.trim() || parentObj.userName || 'Parent Account Owner'
    : null;
  const parentEmail = parentObj?.email || null;
  const parentPhone = parentObj?.phone || null;

  const coins = Number((player as any).engCoine ?? (player as any).coin ?? 0);
  const marketValue = Number((player as any).marketValue) || (coins * 100);
  const rawSub = (player as any).subscription || (player as any).activeSubscription;
  const sub = rawSub ? {
    _id: rawSub._id,
    status: rawSub.status || 'Active',
    price: rawSub.price ?? rawSub.package?.price ?? 0,
    trxId: rawSub.trxId,
    subscriptionId: rawSub.subscriptionId,
    currentPeriodStart: rawSub.currentPeriodStart,
    currentPeriodEnd: rawSub.currentPeriodEnd,
    packageName: rawSub.packageName || rawSub.package?.title || rawSub.package?.packageName || rawSub.package?.name || 'ENG Plan',
    package: rawSub.package || rawSub.packageDetails || null,
  } : null;

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
                  {((player as any).verified ?? true) && (
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

            {/* Rejection Reason Alert Banner (if status is REJECTED) */}
            {currentStatus === 'REJECTED' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900 uppercase">Player Registration Rejected</h4>
                  <p className="text-xs text-rose-700 font-medium mt-0.5">
                    Reason: {(player as any).rejectionReason || 'Profile did not meet required verification criteria.'}
                  </p>
                </div>
              </div>
            )}

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

            {/* Subscription Details Card */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Active Subscription Plan
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sub ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                  {sub ? 'Active Subscription' : 'No Active Plan'}
                </span>
              </div>

              {sub ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Package</p>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {sub.packageName || 'ENG Plan'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Price Paid</p>
                    <p className="text-xs font-bold text-slate-900">£{sub.price}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Status</p>
                    <p className="text-xs font-bold text-emerald-700 uppercase">{sub.status || 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500">Valid Until</p>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      {sub.currentPeriodEnd ? dayjs(sub.currentPeriodEnd).format('DD MMM YYYY') : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium">Free registered profile / No active package</p>
              )}
            </div>

            {/* Primary Details Card */}
            <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-600" /> Player Profile Information
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500">First Name</p>
                  <p className="text-xs font-bold text-slate-900">{player.firstName || (player as any).userName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Last Name</p>
                  <p className="text-xs font-bold text-slate-900">{player.lastName || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Date of Birth</p>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    {player.dateOfBirth ? dayjs(player.dateOfBirth).format('DD MMM YYYY') : 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Age Group</p>
                  <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block">
                    {player.ageGroup || 'N/A'}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Position</p>
                  <p className="text-xs font-bold text-slate-900">{player.position || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Preferred Foot</p>
                  <p className="text-xs font-bold text-slate-900">{player.strongFoot || 'N/A'}</p>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-500">ENG Coin</p>
                    {!isEditingEconomy && (
                      <button
                        type="button"
                        onClick={() => setIsEditingEconomy(true)}
                        className="text-[10px] text-amber-600 hover:text-amber-700 font-bold underline cursor-pointer"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditingEconomy ? (
                    <div className="flex items-center gap-1.5 mt-1">
                      <input
                        type="number"
                        value={editCoinsInput}
                        onChange={(e) => setEditCoinsInput(e.target.value)}
                        className="w-20 px-2 py-1 text-xs font-bold border border-amber-300 rounded-lg bg-amber-50/50 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Coins"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleSaveEconomy}
                        disabled={isSavingEconomy}
                        className="px-2 py-1 bg-amber-500 text-white font-bold text-[10px] rounded-lg hover:bg-amber-600 disabled:opacity-50 cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        {isSavingEconomy && <Loader2 className="w-3 h-3 animate-spin" />}
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      {coins} Coins
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-slate-500">Market Value</p>
                  <p className="text-xs font-bold text-emerald-600">
                    £{isEditingEconomy ? ((Number(editCoinsInput) || 0) * 100).toLocaleString() : marketValue.toLocaleString()}
                  </p>
                </div>

                {player.previousClub && (
                  <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                    <p className="text-[11px] font-semibold text-slate-500">Previous Club / Team</p>
                    <p className="text-xs font-bold text-slate-900">{player.previousClub}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Club & Academy Credentials Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* Team Card with Admin Change Dropdown */}
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-600" /> Assigned Club / Team
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsEditingTeam(!isEditingTeam)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isEditingTeam ? "Cancel" : "Change Team"}
                  </button>
                </div>

                {isEditingTeam ? (
                    <div className="space-y-2 p-3 bg-white border border-indigo-200 rounded-xl shadow-xs">
                      <label className="text-[11px] font-bold text-slate-700 block">Select Team to Assign:</label>
                      <TeamSelectDropdown
                        teams={allTeams}
                        selectedTeamId={selectedTeamIdInput}
                        onChange={(teamId) => setSelectedTeamIdInput(teamId)}
                        placeholder="Search & choose a team..."
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingTeam(false)}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveTeam}
                          disabled={isSavingTeam}
                          className="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          {isSavingTeam && <Loader2 className="w-3 h-3 animate-spin" />}
                          Save Team
                        </button>
                      </div>
                    </div>
                ) : selectedTeam && (selectedTeam.teamName || selectedTeam.shortName) ? (
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
                        <Building2 className="w-5 h-5 text-slate-400" />
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
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Academy & Consent Status
                </h3>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-600">Plays for CAT 1-3 Academy?</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).playForAcademy ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                      {(player as any).playForAcademy ? `Yes (${(player as any).academyClubName || 'Club'})` : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-600">Development Player?</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).isDevelopmentPlayer ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500'}`}>
                      {(player as any).isDevelopmentPlayer ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-600">Filming & Media Consent?</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).mediaConsent ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                      {(player as any).mediaConsent ? 'Granted' : 'Not Granted'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts Card */}
            {((player as any).emergencyEmail || (player as any).emergencyPhone) && (
              <div className="bg-slate-50/60 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-rose-500" /> Emergency Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {(player as any).emergencyEmail && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">Emergency Email</p>
                      <p className="font-bold text-slate-800">{(player as any).emergencyEmail}</p>
                    </div>
                  )}

                  {(player as any).emergencyPhone && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">Emergency Phone</p>
                      <p className="font-bold text-slate-800">{(player as any).emergencyPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Documents Preview Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" /> Uploaded Player Documents
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  {documentList.length} {documentList.length === 1 ? 'file' : 'files'} attached
                </span>
              </div>

              {documentList.length === 0 ? (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-500">No documents uploaded for this player</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {documentList.map((docUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-video flex items-center justify-center shadow-xs"
                    >
                      <Image
                        src={docUrl}
                        alt={`Document ${idx + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewImage(docUrl)}
                          className="p-1.5 rounded-full bg-white/90 text-slate-800 hover:bg-white transition-colors cursor-pointer"
                          title="View Full Size"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Modal Footer */}
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

export default PlayerViewModal;
