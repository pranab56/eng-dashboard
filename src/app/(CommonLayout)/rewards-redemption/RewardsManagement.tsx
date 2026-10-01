/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, QrCode, X, Package, Coffee, Gift, RefreshCw } from "lucide-react";
import CustomTable from "@/components/table/CustomTable";
import CustomPagination from "@/components/cui/CustomPagination";
import { getRewardsColumns } from "@/tableColumns/rewardsColumns";
import {
  useDeleteRewordMutation,
  useGetAllRewordQuery,
  useGetRewardOverviewQuery,
} from "@/features/rewordProduct/rewordApi";
import { useHeaders } from "@/hooks/useHeaders";
import { toast } from "sonner";
import RewardViewModal from "./RewardViewModal";
import RewardProductQrModal from "./RewardProductQrModal";
import RewardRedeemedHistoryModal from "./RewardRedeemedHistoryModal";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";

const RewardsManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("rewardPage") || "1";

  const {
    data: rewardData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllRewordQuery(page);
  const { data: overviewData, refetch: refetchOverview } = useGetRewardOverviewQuery(undefined);
  const [deleteReward, { isLoading: isDeleting }] = useDeleteRewordMutation();

  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [selectedQrReward, setSelectedQrReward] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [selectedHistoryReward, setSelectedHistoryReward] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | "MERCHANDISE" | "COFFEE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setHeaders({
      title: "Rewards & Redemption",
      des: "Manage the digital inventory of redeemable boutique items and partner rewards.",
    });
  }, []);

  const rawList: any[] = useMemo(() => {
    return rewardData?.data || [];
  }, [rewardData]);

  // Metrics directly from dedicated backend overview API (completely separate from pagination)
  const overview = overviewData?.data;
  const totalCount = overview?.totalItems ?? (rewardData?.pagination?.total || 0);
  const merchCount = overview?.merchandiseCount ?? 0;
  const coffeeCount = overview?.coffeeCount ?? 0;
  const totalClaims = overview?.totalClaims ?? 0;

  // Filtered dataset
  const filteredData = useMemo(() => {
    return rawList.filter((item) => {
      const isCoffee = item.productType === "Coffee";
      if (categoryFilter === "COFFEE" && !isCoffee) return false;
      if (categoryFilter === "MERCHANDISE" && isCoffee) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const brandMatch = (item.brand || "").toLowerCase().includes(q);
        const typeMatch = (item.productType || "").toLowerCase().includes(q);
        if (!brandMatch && !typeMatch) return false;
      }

      return true;
    });
  }, [rawList, categoryFilter, searchTerm]);

  const handleView = (reward: any) => {
    setSelectedReward(reward);
    setIsViewModalOpen(true);
  };

  const handleShowQr = (reward: any) => {
    setSelectedQrReward(reward);
    setIsQrModalOpen(true);
  };

  const handleShowHistory = (reward: any) => {
    setSelectedHistoryReward(reward);
    setIsHistoryModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteReward(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Reward deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete reward");
    }
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Rewards & Redemption
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {totalCount} items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure redeemable merchandise catalog, coin pricing, and instant QR redemptions.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { refetch(); refetchOverview(); }}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh items"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-slate-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link href="/rewards-redemption/create-reward">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Reward</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Metric Summary Strips (Powered 100% by Backend DB Aggregation) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Catalog Items
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalCount}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Gift className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Physical Merchandise
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {merchCount}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Package className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Instant QR / Coffee
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {coffeeCount}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-amber-200 bg-amber-50 flex items-center justify-center text-amber-700">
            <Coffee className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total QR Claims
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalClaims}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-emerald-200 bg-emerald-50 flex items-center justify-center text-emerald-700">
            <QrCode className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 py-1">
        {/* Category Segmented Tabs */}
        <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80 self-start">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              categoryFilter === "ALL"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Items ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("MERCHANDISE")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              categoryFilter === "MERCHANDISE"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Merchandise ({merchCount})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("COFFEE")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              categoryFilter === "COFFEE"
                ? "bg-white text-slate-900 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Coffee QR ({coffeeCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search items by brand..."
            className="w-full h-8 pl-8 pr-7 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <CustomTable<any>
          columns={getRewardsColumns(handleView, handleDelete, handleShowQr, handleShowHistory)}
          data={filteredData}
          isLoading={isLoading}
        />

        {/* Empty state if filtered data is empty but list is not */}
        {!isLoading && filteredData.length === 0 && (
          <div className="py-12 px-4 text-center">
            <p className="text-xs font-semibold text-slate-800">No items match your criteria</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Try adjusting your search terms or switching between category tabs.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {rewardData?.pagination?.totalPage || 1} ({totalCount} total items)
          </span>
          <CustomPagination
            TOTAL_PAGES={rewardData?.pagination?.totalPage || 1}
            qryName="rewardPage"
          />
        </div>
      </div>

      {/* Modals */}
      <RewardViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        reward={selectedReward}
      />

      <RewardProductQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        reward={selectedQrReward}
      />

      <RewardRedeemedHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        reward={selectedHistoryReward}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Reward Deletion"
        description="Are you sure you want to delete this reward item? It will be permanently removed from the player catalog."
      />
    </div>
  );
};

export default RewardsManagement;
