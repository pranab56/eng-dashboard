/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import InputField from "@/components/form/InputField";
import ImageUploadField, { ImageChildrenComponent } from "@/components/form/ImageUploadField";
import SubmitButton from "@/components/buttons/SubmitButton";
import {
  useUpdatePlayerMutation,
  useGetPlayerStatsQuery,
  useEditPlayerStatsMutation,
  useAdjustPlayerCoinsMutation,
} from "@/features/player/playerApi";
import { TPlayer } from "@/types/columnTypes";
import { toast } from "sonner";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  User,
  Activity,
  Coins,
  FileText,
  Loader2,
  X,
} from "lucide-react";

const playerEditSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  position: z.string().min(1, "Position is required"),
  marketValue: z.number().min(0, "Market value must be non-negative"),
  image: z.any().optional(),
});

type PlayerEditFormValues = z.infer<typeof playerEditSchema>;

interface PlayerEditModalProps {
  player: TPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

const PlayerEditModal = ({ player, isOpen, onClose }: PlayerEditModalProps) => {
  const [activeTab, setActiveTab] = useState<"details" | "stats" | "coins">("details");

  const [updatePlayer, { isLoading: isUpdatingPlayer }] = useUpdatePlayerMutation();
  const [editPlayerStats, { isLoading: isUpdatingStats }] = useEditPlayerStatsMutation();
  const [adjustCoins, { isLoading: isAdjustingCoins }] = useAdjustPlayerCoinsMutation();

  const playerId = (player as any)?._id || (player as any)?.id;

  const { data: statsData, refetch: refetchStats } = useGetPlayerStatsQuery(playerId, {
    skip: !playerId || !isOpen,
  });
  const currentStats = statsData?.data;

  // Form for basic info
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PlayerEditFormValues>({
    resolver: zodResolver(playerEditSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      position: "",
      marketValue: 0,
      image: null,
    },
  });

  // State for stats editing
  const [goals, setGoals] = useState<number>(0);
  const [assists, setAssists] = useState<number>(0);
  const [cleanSheets, setCleanSheets] = useState<number>(0);
  const [yellowCards, setYellowCards] = useState<number>(0);
  const [redCards, setRedCards] = useState<number>(0);
  const [matchesPlayed, setMatchesPlayed] = useState<number>(0);
  const [playerOfTheDay, setPlayerOfTheDay] = useState<number>(0);
  const [statsReason, setStatsReason] = useState<string>("");

  // State for coin adjustment
  const [coinOp, setCoinOp] = useState<"ADD" | "DEDUCT">("ADD");
  const [coinAmount, setCoinAmount] = useState<string>("");
  const [coinReason, setCoinReason] = useState<string>("");

  const currentCoins = Number((player as any)?.engCoine ?? (player as any)?.coin ?? 0) || 0;
  const numCoinAmt = Math.max(0, parseInt(coinAmount) || 0);
  const netDelta = coinOp === "ADD" ? numCoinAmt : -numCoinAmt;
  const projectedBalance = Math.max(0, currentCoins + netDelta);

  useEffect(() => {
    if (player && isOpen) {
      reset({
        firstName: player.firstName || "",
        lastName: player.lastName || "",
        position: player.position || "",
        marketValue: player.marketValue || 0,
        image: player.profile ? formatImagePath(player.profile) : null,
      });

      setGoals(Number(currentStats?.goals ?? 0));
      setAssists(Number(currentStats?.assists ?? 0));
      setCleanSheets(Number(currentStats?.cleanSheets ?? 0));
      setYellowCards(Number(currentStats?.yellowCards ?? 0));
      setRedCards(Number(currentStats?.redCards ?? 0));
      setMatchesPlayed(Number(currentStats?.matchesPlayed ?? 0));
      setPlayerOfTheDay(Number(currentStats?.playerOfTheDay ?? 0));
      setStatsReason("");
      setCoinAmount("");
      setCoinReason("");
    }
  }, [player, currentStats, isOpen, reset]);

  const onSaveDetails = async (data: PlayerEditFormValues) => {
    if (!playerId) {
      toast.error("Player ID missing");
      return;
    }

    try {
      const formData = new FormData();
      const jsonData = {
        firstName: data.firstName,
        lastName: data.lastName,
        position: data.position,
        marketValue: Number(data.marketValue),
      };

      formData.append("data", JSON.stringify(jsonData));
      if (data.image && data.image instanceof File) {
        formData.append("image", data.image);
      }

      await updatePlayer({ id: playerId, data: formData }).unwrap();
      toast.success("Player details updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update player details");
    }
  };

  const onSaveStats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statsReason.trim()) {
      toast.error("Please enter a reason note for modifying stats");
      return;
    }

    try {
      await editPlayerStats({
        playerId,
        data: {
          goals: Math.max(0, goals),
          assists: Math.max(0, assists),
          cleanSheets: Math.max(0, cleanSheets),
          yellowCards: Math.max(0, yellowCards),
          redCards: Math.max(0, redCards),
          matchesPlayed: Math.max(0, matchesPlayed),
          playerOfTheDay: Math.max(0, playerOfTheDay),
          reason: statsReason.trim(),
        },
      }).unwrap();

      toast.success("Player career stats updated & audit log saved!");
      refetchStats();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update stats");
    }
  };

  const onSaveCoinAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numCoinAmt <= 0) {
      toast.error("Please enter a valid coin amount greater than 0");
      return;
    }
    if (!coinReason.trim()) {
      toast.error("Please enter a reason note for the coin transaction");
      return;
    }

    try {
      await adjustCoins({
        playerId,
        data: {
          amount: netDelta,
          reason: coinReason.trim(),
        },
      }).unwrap();

      toast.success("Player ENG Coins adjusted successfully!");
      setCoinAmount("");
      setCoinReason("");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to adjust coins");
    }
  };

  if (!player) return null;

  const fullName = player ? `${player.firstName || ""} ${player.lastName || ""}`.trim() : "Player";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col text-slate-800"
      >
        {/* Clean Modal Header with Segmented Tabs */}
        <div className="px-6 py-5 border-b border-slate-200/80 bg-white shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold text-slate-900">
                  Edit Player Profile & Records
                </DialogTitle>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  Admin Control
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Editing records for <span className="font-semibold text-slate-800">{fullName}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Section Tabs - Clean SaaS Segmented Style */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/60 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "details"
                  ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stats")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "stats"
                  ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Career Stats & Audits
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coins")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "coins"
                  ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              Adjust ENG Coins
            </button>
          </div>
        </div>

        {/* Tab 1: Basic Info */}
        {activeTab === "details" && (
          <form onSubmit={handleSubmit(onSaveDetails)} className="p-6 space-y-4 bg-white animate-in fade-in">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                name="firstName"
                title="First Name"
                placeholder="e.g. Cristiano"
                register={register}
                error={errors.firstName}
              />
              <InputField
                name="lastName"
                title="Last Name"
                placeholder="e.g. Ronaldo"
                register={register}
                error={errors.lastName}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField
                name="position"
                title="Position"
                placeholder="e.g. Forward"
                register={register}
                error={errors.position}
              />
              <InputField
                name="marketValue"
                title="Market Value (£)"
                type="number"
                placeholder="e.g. 90000"
                register={register}
                error={errors.marketValue}
                registerOptions={{ valueAsNumber: true }}
              />
            </div>

            <ImageUploadField
              name="image"
              label="Player Profile Photo"
              control={control}
              error={errors.image as any}
            >
              <ImageChildrenComponent />
            </ImageUploadField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <SubmitButton
                title="Update Basic Details"
                isSubmitting={isUpdatingPlayer}
              />
            </div>
          </form>
        )}

        {/* Tab 2: Career Stats & Audit */}
        {activeTab === "stats" && (
          <form onSubmit={onSaveStats} className="p-6 space-y-4 bg-white animate-in fade-in">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
              Modify career stats directly. Every change is logged with your admin ID and timestamp into the audit trail.
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Goals</label>
                <input
                  type="number"
                  min="0"
                  value={goals}
                  onChange={(e) => setGoals(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Assists</label>
                <input
                  type="number"
                  min="0"
                  value={assists}
                  onChange={(e) => setAssists(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-emerald-800 block mb-1">Clean Sheets</label>
                <input
                  type="number"
                  min="0"
                  value={cleanSheets}
                  onChange={(e) => setCleanSheets(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Matches Played</label>
                <input
                  type="number"
                  min="0"
                  value={matchesPlayed}
                  onChange={(e) => setMatchesPlayed(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-amber-800 block mb-1">Yellow Cards</label>
                <input
                  type="number"
                  min="0"
                  value={yellowCards}
                  onChange={(e) => setYellowCards(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3">
                <label className="text-[11px] font-bold text-rose-800 block mb-1">Red Cards</label>
                <input
                  type="number"
                  min="0"
                  value={redCards}
                  onChange={(e) => setRedCards(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>

              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-3 col-span-2">
                <label className="text-[11px] font-bold text-purple-800 block mb-1">Player of the Day Awards</label>
                <input
                  type="number"
                  min="0"
                  value={playerOfTheDay}
                  onChange={(e) => setPlayerOfTheDay(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-base font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" />
                Reason for Stats Modification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={statsReason}
                onChange={(e) => setStatsReason(e.target.value)}
                placeholder="e.g. Score correction from referee report for match on 24th Sept"
                className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdatingStats || !statsReason.trim()}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isUpdatingStats && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Stats & Audit Log
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Adjust ENG Coins */}
        {activeTab === "coins" && (
          <form onSubmit={onSaveCoinAdjust} className="p-6 space-y-4 bg-white animate-in fade-in">
            {/* Operation Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setCoinOp("ADD")}
                className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  coinOp === "ADD" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Credit Coins (+)
              </button>
              <button
                type="button"
                onClick={() => setCoinOp("DEDUCT")}
                className={`py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  coinOp === "DEDUCT" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Debit Coins (-)
              </button>
            </div>

            {/* Coin Amount */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Amount</label>
              <input
                type="number"
                min="1"
                required
                value={coinAmount}
                onChange={(e) => setCoinAmount(e.target.value)}
                placeholder="e.g. 500"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white"
              />
            </div>

            {/* Balance Preview */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Current Balance</p>
                <p className="text-sm font-bold text-slate-900">{currentCoins.toLocaleString()} Coins</p>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <p className="text-[11px] font-semibold text-slate-500">Projected Balance</p>
                <p className={`text-sm font-bold ${coinOp === "ADD" ? "text-emerald-600" : "text-rose-600"}`}>
                  {projectedBalance.toLocaleString()} Coins
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-amber-600" />
                Reason for Adjustment <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={coinReason}
                onChange={(e) => setCoinReason(e.target.value)}
                placeholder="e.g. Manual tournament bonus"
                className="w-full p-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50 focus:bg-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAdjustingCoins || numCoinAmt <= 0 || !coinReason.trim()}
                className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 ${
                  coinOp === "ADD" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {isAdjustingCoins && <Loader2 className="w-4 h-4 animate-spin" />}
                {coinOp === "ADD" ? "Credit Coins" : "Debit Coins"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlayerEditModal;
