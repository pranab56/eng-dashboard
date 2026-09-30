/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatImagePath } from "@/utils/formatImagePath";
import Image from "next/image";
import dayjs from "dayjs";
import {
  X,
  Users,
  Shield,
  Trophy,
  Coins,
  UserCheck,
  TrendingUp,
  Search,
  UserMinus,
  Hash,
  Edit3,
  Loader2,
  Upload,
} from "lucide-react";
import {
  useAssignTeamToUserMutation,
  useUpdateJerseyNumberMutation,
} from "@/features/userManagement/userApi";
import { toast } from "sonner";

interface TeamViewModalProps {
  team: any;
  isOpen: boolean;
  onClose: () => void;
}

const TeamViewModal: React.FC<TeamViewModalProps> = ({
  team,
  isOpen,
  onClose,
}) => {
  const [memberSearch, setMemberSearch] = useState("");
  const [removingPlayerId, setRemovingPlayerId] = useState<string | null>(null);

  const [editingJerseyPlayer, setEditingJerseyPlayer] = useState<any | null>(null);
  const [jerseyInput, setJerseyInput] = useState<string>("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isJerseyModalOpen, setIsJerseyModalOpen] = useState(false);

  const [assignTeamToUser] = useAssignTeamToUserMutation();
  const [updateJerseyNumber, { isLoading: isSavingJersey }] =
    useUpdateJerseyNumberMutation();

  if (!team) return null;
  const logoUrl = formatImagePath(team.teamLogo);
  const league = team.league;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveJerseyNumber = async () => {
    if (!editingJerseyPlayer?._id) return;
    try {
      if (selectedImageFile) {
        const formData = new FormData();
        formData.append("jerseyNumber", jerseyInput.trim());
        formData.append("profile", selectedImageFile);
        formData.append("image", selectedImageFile);

        await updateJerseyNumber({
          id: editingJerseyPlayer._id,
          data: formData,
        }).unwrap();
      } else {
        await updateJerseyNumber({
          id: editingJerseyPlayer._id,
          data: { jerseyNumber: jerseyInput.trim() },
        }).unwrap();
      }

      toast.success("Player details updated successfully");
      setIsJerseyModalOpen(false);
      setEditingJerseyPlayer(null);
      setJerseyInput("");
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update player details");
    }
  };

  const managersList = Array.isArray(team.managers)
    ? team.managers.map((m: any) => m.manager || m).filter(Boolean)
    : team.managers
    ? [team.managers.manager || team.managers]
    : [];

  const rawMembers = Array.isArray(team.members) ? team.members : [];
  const filteredMembers = rawMembers.filter((member: any) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    const name = `${member.firstName || ""} ${member.lastName || ""}`.toLowerCase();
    const uName = (member.userName || "").toLowerCase();
    const jNo = (member.jerseyNumber || member.jerseyNo || "").toString();
    return name.includes(q) || uName.includes(q) || jNo.includes(q);
  });

  const marketValue = typeof team.marketValue === "number" ? team.marketValue : 0;

  const handleRemoveMemberFromTeam = async (playerId: string) => {
    try {
      setRemovingPlayerId(playerId);
      await assignTeamToUser({
        id: playerId,
        data: { selectTeam: null },
      }).unwrap();
      toast.success("Player removed from team successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove player from team");
    } finally {
      setRemovingPlayerId(null);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-3xl md:max-w-4xl bg-white dark:bg-slate-900 rounded-lg p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-row items-center justify-between space-y-0 text-left">
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              <div className="relative w-12 h-12 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 p-1">
                {logoUrl ? (
                  <Image
                    src={logoUrl}
                    alt={team.teamName || "Team Logo"}
                    fill
                    className="object-contain p-0.5"
                  />
                ) : (
                  <Shield className="w-6 h-6 text-slate-400" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono">
                    {team.shortName || "CLUB"}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {team.teamType || "Football"}
                  </span>
                  {(league?.leagueName || team.leagueName) && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 truncate max-w-[200px]">
                      {league?.leagueName || team.leagueName}
                    </span>
                  )}
                </div>

                <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {team.teamName}
                </DialogTitle>

                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 truncate">
                  <span>{team.stadiumName || team.stadium || "Home Stadium N/A"}</span>
                  {(team.city || team.location) && (
                    <>
                      <span>•</span>
                      <span>
                        {team.city || team.location}
                        {team.country ? `, ${team.country}` : ""}
                      </span>
                    </>
                  )}
                  {team.createdAt && (
                    <>
                      <span>•</span>
                      <span>Registered {dayjs(team.createdAt).format("MMM DD, YYYY")}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>

          {/* Modal Body */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Squad Members</span>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {rawMembers.length || team.totalMembers || 0}{" "}
                  <span className="text-xs font-normal text-slate-400">Players</span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Coin Budget</span>
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {(team.coin || 0).toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-400">Coins</span>
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-md p-3">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Market Value</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  £{marketValue.toLocaleString()}
                </p>
              </div>
            </div>

            {/* League & Manager Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" /> Associated League
                </span>
                <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                  {league?.leagueName || league?.name || team.leagueName || "Independent / Unassigned"}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Ground: {team.stadiumName || team.stadium || "N/A"}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-1">
                <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Team Manager
                </span>
                {managersList.length === 0 ? (
                  <p className="text-slate-400 italic">No Manager Assigned</p>
                ) : (
                  <div className="space-y-0.5">
                    {managersList.map((m: any, idx: number) => {
                      const name = m.firstName
                        ? `${m.firstName} ${m.lastName || ""}`.trim()
                        : m.userName || `Manager ${idx + 1}`;
                      return (
                        <div key={m._id || idx}>
                          <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">
                            {name}
                          </p>
                          {m.email && <p className="text-slate-400 text-[11px]">{m.email}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Squad Members Section */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" /> Squad Members ({filteredMembers.length})
                </h3>

                {rawMembers.length > 0 && (
                  <div className="relative w-full sm:w-56">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search player or jersey #..."
                      className="w-full pl-8 pr-7 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
                    />
                    {memberSearch && (
                      <button
                        type="button"
                        onClick={() => setMemberSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {filteredMembers.length > 0 ? (
                <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {filteredMembers.map((member: any, index: number) => {
                    const name = member.firstName
                      ? `${member.firstName} ${member.lastName || ""}`.trim()
                      : member.userName || `Player ${index + 1}`;
                    const profileImg = formatImagePath(member.profile);
                    const jNo = member.jerseyNumber || member.jerseyNo;

                    return (
                      <div
                        key={member._id || index}
                        className="flex items-center gap-2.5 p-2 rounded border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <div className="relative w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shrink-0 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {profileImg ? (
                            <Image src={profileImg} alt={name} fill className="object-cover" />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                              {name}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingJerseyPlayer(member);
                                setJerseyInput(jNo ? jNo.toString() : "");
                                setIsJerseyModalOpen(true);
                              }}
                              className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors cursor-pointer flex items-center gap-0.5"
                              title="Edit Jersey Number"
                            >
                              <Hash className="w-2.5 h-2.5 text-slate-400" />
                              <span>{jNo || "--"}</span>
                              <Edit3 className="w-2 h-2 opacity-50 ml-0.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {member.position || member.role || "Squad Member"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMemberFromTeam(member._id)}
                          disabled={removingPlayerId === member._id}
                          className="h-7 w-7 rounded border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                          title="Remove from team"
                        >
                          {removingPlayerId === member._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  {rawMembers.length === 0
                    ? "No players currently assigned to this team squad."
                    : "No players match your search filter."}
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono text-[11px]">
              ID: {team._id}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Jersey & Profile Submodal */}
      <Dialog open={isJerseyModalOpen} onOpenChange={setIsJerseyModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-md bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <DialogTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Edit Player Details
            </DialogTitle>
            <button
              type="button"
              onClick={() => setIsJerseyModalOpen(false)}
              className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4 pt-3">
            {/* Player Info Card */}
            <div className="p-2.5 rounded border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-semibold">
                {imagePreviewUrl ? (
                  <Image src={imagePreviewUrl} alt="preview" fill className="object-cover" />
                ) : editingJerseyPlayer?.profile ? (
                  <Image
                    src={formatImagePath(editingJerseyPlayer.profile)}
                    alt="player"
                    fill
                    className="object-cover"
                  />
                ) : (
                  editingJerseyPlayer?.firstName?.charAt(0) || "P"
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {editingJerseyPlayer?.firstName} {editingJerseyPlayer?.lastName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {editingJerseyPlayer?.email || editingJerseyPlayer?.role || "Player"}
                </p>
              </div>
            </div>

            {/* Jersey Number Field */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Jersey Number
              </label>
              <input
                type="text"
                value={jerseyInput}
                onChange={(e) => setJerseyInput(e.target.value)}
                placeholder="e.g. 10"
                className="w-full h-9 px-3 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Profile Photo Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Update Player Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsJerseyModalOpen(false)}
              className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveJerseyNumber}
              disabled={isSavingJersey}
              className="px-4 py-1.5 text-xs font-medium rounded bg-slate-900 text-white hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSavingJersey && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Save Details</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TeamViewModal;
