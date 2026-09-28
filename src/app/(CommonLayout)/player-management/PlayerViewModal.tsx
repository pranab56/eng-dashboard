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
import { TPlayer } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
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
  Activity,
  History,
  Shield,
  PlusCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Receipt,
  Loader2,
} from "lucide-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  useUpdateEngCoinBudgetMutation,
  useUpdatePlayerMutation,
  useGetPlayerStatsQuery,
  useGetPlayerStatsAuditLogsQuery,
  useGetPlayerCoinHistoryQuery,
} from "@/features/player/playerApi";
import { useGetAllTeamQuery } from "@/features/teamManagement/teamApi";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { TeamSelectDropdown } from "@/components/dropdowns/TeamSelectDropdown";
import { EditPlayerStatsModal } from "@/components/modals/EditPlayerStatsModal";
import { AdjustCoinModal } from "@/components/modals/AdjustCoinModal";

interface PlayerViewModalProps {
  player: TPlayer | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatTransactionCategory = (cat: string) => {
  switch (cat) {
    case "MATCH_GOAL":
    case "GOAL":
      return { label: "Goal Scored", icon: "⚽", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    case "MATCH_ASSIST":
    case "ASSIST":
      return { label: "Goal Assist", icon: "👟", bg: "bg-blue-50 text-blue-700 border-blue-200" };
    case "MATCH_CLEAN_SHEET":
    case "CLEAN_SHEET":
      return { label: "Clean Sheet", icon: "🛡️", bg: "bg-teal-50 text-teal-700 border-teal-200" };
    case "MATCH_POTD":
    case "PLAYER_OF_THE_DAY":
      return { label: "Player of Day", icon: "⭐", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    case "PLAYING_MATCH":
    case "ATTEND_MATCH":
      return { label: "Match Appearance", icon: "🏟️", bg: "bg-sky-50 text-sky-700 border-sky-200" };
    case "MATCH_RATING":
      return { label: "Match Rating", icon: "🌟", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    case "YELLOW_CARD_PENALTY":
      return { label: "Yellow Card", icon: "🟨", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    case "RED_CARD_PENALTY":
    case "PENALTY_CARD":
      return { label: "Red Card", icon: "🟥", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case "FOUL_PENALTY":
      return { label: "Foul Penalty", icon: "⚠️", bg: "bg-orange-50 text-orange-700 border-orange-200" };
    case "SIN_BIN_PENALTY":
      return { label: "Sin Bin", icon: "⏱️", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    case "DISRESPECT_TO_REFEREE":
      return { label: "Referee Dispute", icon: "🚫", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case "GROSS_MISCONDUCT":
      return { label: "Gross Misconduct", icon: "🛑", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case "SUBSCRIPTION_BONUS":
      return { label: "Plan Bonus", icon: "🎁", bg: "bg-purple-50 text-purple-700 border-purple-200" };
    case "PRODUCT_PURCHASE":
      return { label: "Reward Order", icon: "🛍️", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    case "ADMIN_ADJUSTMENT":
      return { label: "Admin Adjustment", icon: "⚖️", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" };
    case "REFEREE_REVIEW":
      return { label: "Manager Review", icon: "📋", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    case "ROLLBACK":
      return { label: "Rollback Reversal", icon: "🔄", bg: "bg-slate-50 text-slate-700 border-slate-200" };
    default:
      return { label: cat ? cat.replace(/_/g, " ") : "Transaction", icon: "🪙", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  }
};

const PlayerViewModal: React.FC<PlayerViewModalProps> = ({
  player,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "stats" | "ledger">("profile");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Modals state
  const [isEditStatsOpen, setIsEditStatsOpen] = useState(false);
  const [isAdjustCoinOpen, setIsAdjustCoinOpen] = useState(false);

  // Pagination for coin history
  const [coinPage, setCoinPage] = useState<number>(1);

  // Team Selection States
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [selectedTeamIdInput, setSelectedTeamIdInput] = useState<string>("");
  const [isSavingTeam, setIsSavingTeam] = useState(false);

  const { data: teamData } = useGetAllTeamQuery({ limit: 1000 });
  const allTeams = teamData?.data?.result || teamData?.data || [];

  const [updatePlayer] = useUpdatePlayerMutation();
  const [updateEngCoinBudget] = useUpdateEngCoinBudgetMutation();
  const [isEditingEconomy, setIsEditingEconomy] = useState(false);
  const [editCoinsInput, setEditCoinsInput] = useState<number | string>("");
  const [isSavingEconomy, setIsSavingEconomy] = useState(false);
  const [currentCoins, setCurrentCoins] = useState<number>(0);
  const [currentMarketValue, setCurrentMarketValue] = useState<number>(0);

  const playerId = (player as any)?._id || (player as any)?.id;

  // Real-time queries for stats, audit logs, and coin history
  const {
    data: playerStatsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetPlayerStatsQuery(playerId, {
    skip: !playerId || !isOpen,
  });

  const {
    data: auditLogsData,
    isLoading: isLoadingAudit,
    refetch: refetchAudit,
  } = useGetPlayerStatsAuditLogsQuery(playerId, {
    skip: !playerId || !isOpen,
  });

  const {
    data: coinHistoryData,
    isLoading: isLoadingCoins,
    refetch: refetchCoins,
  } = useGetPlayerCoinHistoryQuery(
    { playerId, page: coinPage, limit: 10 },
    {
      skip: !playerId || !isOpen,
    }
  );

  const statsObj = playerStatsData?.data || {};
  const auditLogs: any[] = Array.isArray(auditLogsData?.data?.data)
    ? auditLogsData.data.data
    : Array.isArray(auditLogsData?.data)
    ? auditLogsData.data
    : Array.isArray(auditLogsData?.data?.result)
    ? auditLogsData.data.result
    : [];
  const coinTransactions: any[] = Array.isArray(coinHistoryData?.data?.data)
    ? coinHistoryData.data.data
    : Array.isArray(coinHistoryData?.data?.transactions)
    ? coinHistoryData.data.transactions
    : Array.isArray(coinHistoryData?.data)
    ? coinHistoryData.data
    : [];
  const coinMeta = coinHistoryData?.data?.meta || { total: 0, totalPages: 1 };

  React.useEffect(() => {
    if (player) {
      const initialCoins =
        Number((player as any).engCoine ?? (player as any).coin ?? 0) || 0;
      const initialMarketValue =
        Number((player as any).marketValue) || initialCoins * 100;

      setCurrentCoins(initialCoins);
      setCurrentMarketValue(initialMarketValue);
      setEditCoinsInput(initialCoins);

      const curTeamId =
        (player as any).selectTeam?._id || (player as any).selectTeam || "";
      setSelectedTeamIdInput(
        typeof curTeamId === "string"
          ? curTeamId
          : (curTeamId as any)?._id || "",
      );
      setIsEditingEconomy(false);
      setCoinPage(1);
    }
  }, [player]);

  const handleSaveEconomy = async () => {
    if (!player) return;
    try {
      setIsSavingEconomy(true);
      const newCoins = Math.max(0, Number(editCoinsInput) || 0);
      const newMarketValue = newCoins * 100;
      const res = await updateEngCoinBudget({
        id: playerId,
        data: { engCoine: newCoins, marketValue: newMarketValue },
      }).unwrap();

      if (res.success) {
        toast.success(
          res.message || "ENG Coins & Market Value updated successfully",
        );
        const updatedCoins =
          res?.data?.engCoine !== undefined
            ? Number(res.data.engCoine)
            : newCoins;
        const updatedMarketValue =
          res?.data?.marketValue !== undefined
            ? Number(res.data.marketValue)
            : newMarketValue;

        setCurrentCoins(updatedCoins);
        setCurrentMarketValue(updatedMarketValue);
        setEditCoinsInput(updatedCoins);
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

  const profileUrl = formatImagePath(
    player.profile || (player as any).profilePic,
  );
  const fullName = player.firstName
    ? `${player.firstName} ${player.lastName || ""}`.trim()
    : (player as any).userName || (player as any).name || "Player Profile";

  const initials = fullName.charAt(0).toUpperCase();
  const currentStatus = ((player as any).status || "APPROVED").toUpperCase();

  // Parent Info Extraction
  const parentObj =
    typeof (player as any).parentId === "object" && (player as any).parentId
      ? ((player as any).parentId as any)
      : null;
  const parentName = parentObj
    ? `${parentObj.firstName || ""} ${parentObj.lastName || ""}`.trim() ||
      parentObj.userName ||
      "Parent Account Owner"
    : null;
  const parentEmail = parentObj?.email || null;
  const parentPhone = parentObj?.phone || null;

  const rawSub =
    (player as any).subscription || (player as any).activeSubscription;
  const sub = rawSub
    ? {
        _id: rawSub._id,
        status: rawSub.status || "Active",
        price: rawSub.price ?? rawSub.package?.price ?? 0,
        trxId: rawSub.trxId,
        subscriptionId: rawSub.subscriptionId,
        currentPeriodStart: rawSub.currentPeriodStart,
        currentPeriodEnd: rawSub.currentPeriodEnd,
        packageName:
          rawSub.packageName ||
          rawSub.package?.title ||
          rawSub.package?.packageName ||
          rawSub.package?.name ||
          "ENG Plan",
        package: rawSub.package || rawSub.packageDetails || null,
      }
    : null;

  // Extract Document List
  const getDocumentList = (): string[] => {
    const docs: string[] = [];
    const pushDoc = (val: any) => {
      if (typeof val === "string" && val.trim()) {
        docs.push(formatImagePath(val));
      } else if (Array.isArray(val)) {
        val.forEach((item) => {
          if (typeof item === "string" && item.trim()) {
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
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
        copied = true;
      }
    } catch {
      copied = false;
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
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-4xl w-full bg-white rounded-2xl p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col text-slate-800"
        >
          {/* Clean Modal Header */}
          <div className="px-6 py-5 border-b border-slate-200/80 bg-white shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {profileUrl ? (
                    <Image
                      src={profileUrl}
                      alt={fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-slate-600">
                      {initials}
                    </span>
                  )}
                </div>

                <div>
                  <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    {fullName}
                    {((player as any).verified ?? true) && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </DialogTitle>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>
                      {(player as any).email ||
                        parentEmail ||
                        "Managed Player Profile"}
                    </span>
                    {(player as any).createdAt && (
                      <>
                        <span>•</span>
                        <span>
                          Joined{" "}
                          {dayjs((player as any).createdAt).format(
                            "MMM DD, YYYY",
                          )}
                        </span>
                      </>
                    )}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-medium uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {(player as any).role
                        ? (player as any).role.replace(/_/g, " ")
                        : "PLAYER"}
                    </span>

                    {(player as any).ageGroup && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium uppercase bg-blue-50 text-blue-700 border border-blue-200">
                        {(player as any).ageGroup}
                      </span>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase border ${
                        currentStatus === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : currentStatus === "REJECTED"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {currentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Live Coin Wallet & Close Button */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center border border-amber-200">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      ENG Coins
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {currentCoins.toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs - Clean SaaS Segmented Style */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200/60 mt-4">
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Profile & Credentials
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("stats")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Stats & Audit Trail
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ledger")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activeTab === "ledger"
                    ? "bg-white text-slate-900 font-semibold shadow-2xs border border-slate-200/50"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Coin Ledger & History
              </button>
            </div>
          </div>

          {/* Modal Body Container */}
          <div className="p-6 space-y-5 overflow-y-auto max-h-[64vh] text-slate-800 bg-slate-50/40">
            {/* TAB 1: PROFILE & CREDENTIALS */}
            {activeTab === "profile" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Rejection Reason Alert Banner */}
                {currentStatus === "REJECTED" && (
                  <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 uppercase">
                        Player Registration Rejected
                      </h4>
                      <p className="text-xs text-rose-700 font-medium mt-0.5">
                        Reason:{" "}
                        {(player as any).rejectionReason ||
                          "Profile did not meet required verification criteria."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Parent / Account Owner Details Card */}
                {(parentName || parentEmail || parentPhone) && (
                  <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" /> Parent /
                        Account Owner Information
                      </h3>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        Account Owner
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Parent Name
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          {parentName || "N/A"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Parent Email
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {parentEmail || "N/A"}
                          </p>
                          {parentEmail && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(parentEmail, "Parent Email")
                              }
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                        <p className="text-[11px] font-semibold text-slate-500">
                          Parent Contact Phone
                        </p>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            {parentPhone || "N/A"}
                          </p>
                          {parentPhone && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyText(parentPhone, "Parent Phone")
                              }
                              className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                )}

                {/* Subscription Details Card */}
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-emerald-600" /> Active
                      Subscription Plan
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${sub ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-slate-100 text-slate-600 border-slate-200"}`}
                    >
                      {sub ? "Active Subscription" : "No Active Plan"}
                    </span>
                  </div>

                  {sub ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Package
                        </p>
                        <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          {sub.packageName || "ENG Plan"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Price Paid
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          £{sub.price}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Status
                        </p>
                        <p className="text-xs font-bold text-emerald-700 uppercase">
                          {sub.status || "Active"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500">
                          Valid Until
                        </p>
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          {sub.currentPeriodEnd
                            ? dayjs(sub.currentPeriodEnd).format("DD MMM YYYY")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium">
                      Free registered profile / No active package
                    </p>
                  )}
                </div>

                {/* Primary Details Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-3 shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-600" /> Player Profile
                    Information
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        First Name
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {player.firstName || (player as any).userName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Last Name
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {player.lastName || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Date of Birth
                      </p>
                      <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {player.dateOfBirth
                          ? dayjs(player.dateOfBirth).format("DD MMM YYYY")
                          : "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Age Group
                      </p>
                      <p className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 inline-block">
                        {player.ageGroup || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Position
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {player.position || "N/A"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Preferred Foot
                      </p>
                      <p className="text-xs font-bold text-slate-900">
                        {player.strongFoot || "N/A"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-semibold text-slate-500">
                          ENG Coin
                        </p>
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
                            {isSavingEconomy && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditCoinsInput(currentCoins);
                              setIsEditingEconomy(false);
                            }}
                            disabled={isSavingEconomy}
                            className="px-2 py-1 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg hover:bg-slate-300 disabled:opacity-50 cursor-pointer shadow-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          {currentCoins} Coins
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-slate-500">
                        Market Value
                      </p>
                      <p className="text-xs font-bold text-emerald-600">
                        £
                        {isEditingEconomy
                          ? (
                              Math.max(0, Number(editCoinsInput) || 0) * 100
                            ).toLocaleString()
                          : currentMarketValue.toLocaleString()}
                      </p>
                    </div>

                    {player.previousClub && (
                      <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
                        <p className="text-[11px] font-semibold text-slate-500">
                          Previous Club / Team
                        </p>
                        <p className="text-xs font-bold text-slate-900">
                          {player.previousClub}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Club & Academy Credentials Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Team Card with Admin Change Dropdown */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-600" /> Assigned
                        Club / Team
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
                      <div className="space-y-2 p-3 bg-slate-50 border border-indigo-200 rounded-xl shadow-xs">
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Select Team to Assign:
                        </label>
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
                            {isSavingTeam && (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            )}
                            Save Team
                          </button>
                        </div>
                      </div>
                    ) : selectedTeam &&
                      (selectedTeam.teamName || selectedTeam.shortName) ? (
                      <div className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                        <div className="relative w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {selectedTeam.teamLogo ? (
                            <Image
                              src={formatImagePath(selectedTeam.teamLogo)}
                              alt={selectedTeam.teamName || "team logo"}
                              fill
                              className="object-contain p-1"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {selectedTeam.teamName || "Unassigned Team"}
                          </h4>
                          {selectedTeam.shortName && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200 uppercase">
                              {selectedTeam.shortName}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No associated club assigned yet
                      </p>
                    )}
                  </div>

                  {/* Academy & Consent Status Card */}
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" /> Academy &
                      Consent Status
                    </h3>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">
                          Plays for CAT 1-3 Academy?
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).playForAcademy ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-500"}`}
                        >
                          {(player as any).playForAcademy
                            ? `Yes (${(player as any).academyClubName || "Club"})`
                            : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">
                          Development Player?
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).isDevelopmentPlayer ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-500"}`}
                        >
                          {(player as any).isDevelopmentPlayer ? "Yes" : "No"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-medium text-slate-600">
                          Filming & Media Consent?
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${(player as any).mediaConsent ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}
                        >
                          {(player as any).mediaConsent ? "Granted" : "Not Granted"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contacts Card */}
                {((player as any).emergencyEmail ||
                  (player as any).emergencyPhone) && (
                  <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 shadow-xs">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-rose-500" /> Emergency Contact
                      Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {(player as any).emergencyEmail && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500">
                            Emergency Email
                          </p>
                          <p className="font-bold text-slate-800">
                            {(player as any).emergencyEmail}
                          </p>
                        </div>
                      )}

                      {(player as any).emergencyPhone && (
                        <div>
                          <p className="text-[11px] font-semibold text-slate-500">
                            Emergency Phone
                          </p>
                          <p className="font-bold text-slate-800">
                            {(player as any).emergencyPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Uploaded Documents Preview Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-slate-600" /> Uploaded
                      Player Documents
                    </h3>
                    <span className="text-xs font-semibold text-slate-500">
                      {documentList.length}{" "}
                      {documentList.length === 1 ? "file" : "files"} attached
                    </span>
                  </div>

                  {documentList.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-2xl border border-slate-200">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                      <p className="text-xs font-semibold text-slate-500">
                        No documents uploaded for this player
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {documentList.map((docUrl, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-slate-200 overflow-hidden bg-white aspect-video flex items-center justify-center shadow-xs"
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
            )}

            {/* TAB 2: STATS & AUDIT TRAIL */}
            {activeTab === "stats" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Stats Performance Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      Career Performance Metrics
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Synced with official match summaries, clean sheet automation, and admin adjustments.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditStatsOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Modify Player Stats
                  </button>
                </div>

                {/* KPI Metrics Cards */}
                {isLoadingStats ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-600" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">⚽</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Goals</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{statsObj.goals ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">👟</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Assists</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{statsObj.assists ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">🛡️</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Clean Sheets</p>
                      <p className="text-xl font-bold text-emerald-700 mt-0.5">{statsObj.cleanSheets ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">🏟️</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Matches</p>
                      <p className="text-xl font-bold text-slate-900 mt-0.5">{statsObj.matchesPlayed ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">🟨</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Yellow Cards</p>
                      <p className="text-xl font-bold text-amber-700 mt-0.5">{statsObj.yellowCards ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">🟥</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Red Cards</p>
                      <p className="text-xl font-bold text-rose-700 mt-0.5">{statsObj.redCards ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">⭐</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">POTD Awards</p>
                      <p className="text-xl font-bold text-purple-700 mt-0.5">{statsObj.playerOfTheDay ?? 0}</p>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-3.5 text-center shadow-2xs">
                      <span className="text-xl mb-1 block">🏆</span>
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Points</p>
                      <p className="text-xl font-bold text-blue-700 mt-0.5">{statsObj.points ?? 0}</p>
                    </div>
                  </div>
                )}

                {/* Stats Audit Trail History Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-slate-600" />
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                        Stats Modification Audit Trail
                      </h4>
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">
                      {Array.isArray(auditLogs) ? auditLogs.length : 0} adjustments logged
                    </span>
                  </div>

                  {isLoadingAudit ? (
                    <div className="p-8 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-600" />
                    </div>
                  ) : !Array.isArray(auditLogs) || auditLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium">No manual stat adjustments logged yet.</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Edits made via the admin panel will automatically appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                          <tr>
                            <th className="py-2.5 px-4">Date & Time</th>
                            <th className="py-2.5 px-4">Metric</th>
                            <th className="py-2.5 px-4">Change Value</th>
                            <th className="py-2.5 px-4">Modified By</th>
                            <th className="py-2.5 px-4">Reason / Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {auditLogs.map((log: any, idx: number) => {
                            const adminName = log.modifiedBy
                              ? `${log.modifiedBy.firstName || ""} ${log.modifiedBy.lastName || ""}`.trim() || log.modifiedBy.email || "Admin"
                              : "System Admin";

                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                                  {log.createdAt ? dayjs(log.createdAt).format("DD MMM YYYY, HH:mm") : "N/A"}
                                </td>
                                <td className="py-2.5 px-4 font-semibold text-slate-900 capitalize">
                                  {log.field}
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1.5 font-semibold">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                                      {log.previousValue ?? 0}
                                    </span>
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-200 text-xs">
                                      {log.newValue ?? 0}
                                    </span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-slate-700">
                                  {adminName}
                                </td>
                                <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={log.reason}>
                                  {log.reason || "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: COIN LEDGER & FINANCIAL HISTORY */}
            {activeTab === "ledger" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                {/* Ledger Header & Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4.5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                      <Coins className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                        Current Player Balance
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                          {currentCoins.toLocaleString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">ENG Coins</span>
                        <span className="text-xs font-semibold text-slate-500 ml-2">
                          (Market Value: £{currentMarketValue.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAdjustCoinOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Adjust Coins (+ / -)
                  </button>
                </div>

                {/* Coin Transactions Ledger Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Coin Ledger & Activity Log
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {coinMeta.total || 0} total events
                    </span>
                  </div>

                  {isLoadingCoins ? (
                    <div className="p-8 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-amber-600" />
                    </div>
                  ) : coinTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                      <Coins className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-medium">No coin transactions recorded for this player yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                          <tr>
                            <th className="py-2.5 px-4">Date & Time</th>
                            <th className="py-2.5 px-4">Event Type</th>
                            <th className="py-2.5 px-4">Amount</th>
                            <th className="py-2.5 px-4">Balance Flow</th>
                            <th className="py-2.5 px-4">Description / Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {coinTransactions.map((tx: any, idx: number) => {
                            const isCredit = tx.type === "CREDIT";
                            const badge = formatTransactionCategory(tx.category);

                            return (
                              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                                  {dayjs(tx.createdAt).format("DD MMM YYYY, HH:mm")}
                                </td>
                                <td className="py-2.5 px-4">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                                  >
                                    <span>{badge.icon}</span>
                                    <span>{badge.label}</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span
                                    className={`font-black text-xs px-2 py-0.5 rounded ${
                                      isCredit
                                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                        : "text-rose-700 bg-rose-50 border border-rose-200"
                                    }`}
                                  >
                                    {isCredit ? "+" : "-"}
                                    {tx.amount.toLocaleString()}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 whitespace-nowrap text-slate-500">
                                  <span className="text-[11px] font-semibold">
                                    {tx.balanceBefore ?? "-"} ➔{" "}
                                    <strong className="text-slate-800 font-bold">
                                      {tx.balanceAfter}
                                    </strong>
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-slate-700 max-w-sm">
                                  <p className="font-semibold text-xs text-slate-900 truncate">
                                    {tx.title || tx.description}
                                  </p>
                                  {tx.description && tx.title !== tx.description && (
                                    <p className="text-[11px] text-slate-400 truncate">
                                      {tx.description}
                                    </p>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {coinMeta.totalPages > 1 && (
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        disabled={coinPage <= 1}
                        onClick={() => setCoinPage((p) => Math.max(1, p - 1))}
                        className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-slate-500 font-semibold">
                        Page {coinPage} of {coinMeta.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={coinPage >= coinMeta.totalPages}
                        onClick={() => setCoinPage((p) => Math.min(coinMeta.totalPages, p + 1))}
                        className="px-3 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
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
        <DialogContent className="sm:max-w-2xl bg-white rounded-2xl p-5 border border-slate-200 shadow-xl z-[100]">
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

      {/* Edit Stats Modal */}
      <EditPlayerStatsModal
        isOpen={isEditStatsOpen}
        onClose={() => setIsEditStatsOpen(false)}
        player={player}
        currentStats={statsObj}
        onSuccess={() => {
          refetchStats();
          refetchAudit();
        }}
      />

      {/* Adjust Coin Modal */}
      <AdjustCoinModal
        isOpen={isAdjustCoinOpen}
        onClose={() => setIsAdjustCoinOpen(false)}
        player={player}
        currentCoins={currentCoins}
        onSuccess={() => {
          refetchCoins();
        }}
      />
    </>
  );
};

export default PlayerViewModal;
