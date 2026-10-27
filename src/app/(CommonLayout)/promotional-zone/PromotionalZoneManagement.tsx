/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Megaphone,
  User,
  Shield,
  MessageSquare,
  Plus,
  Search,
  X,
  RotateCcw,
  Star,
  Filter,
  CheckCircle,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import PromotionalZoneModal from "@/components/modals/PromotionalZoneModal";
import PromotionalInquiriesModal from "@/components/modals/PromotionalInquiriesModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useGetAllPromotionsQuery,
  useToggleFeaturePromotionMutation,
  useUpdatePromotionMutation,
  useUpdatePromotionStatusMutation,
} from "@/features/promotionalZone/promotionalZoneApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getPromotionalZoneColumns } from "@/tableColumns/promotionalZoneColumns";
import { TPromotionalZone } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";

export default function PromotionalZoneManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TPromotionalZone | null>(null);
  const [inquiriesItem, setInquiriesItem] = useState<TPromotionalZone | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Promotional Ads & Banners",
      des: "Manage paid in-app advertising banners and external sponsor links",
    });
  }, []);

  // Fetch promotions
  const { data: apiResponse, isLoading, refetch } = useGetAllPromotionsQuery(
    {
      pageNumber: Number(page) || 1,
      limit: 10,
      searchValue: searchTerm,
      status: statusFilter,
      type: selectedType,
      city: selectedCity,
      isFeatured: featuredFilter,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createPromotion, { isLoading: isCreating }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdating }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] = useDeletePromotionMutation();
  const [updateStatus] = useUpdatePromotionStatusMutation();
  const [toggleFeature] = useToggleFeaturePromotionMutation();

  const rawPromotions: TPromotionalZone[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse?.data?.result)) return apiResponse.data.result;
    return [];
  }, [apiResponse]);

  const paginationMeta = apiResponse?.pagination ||
    apiResponse?.data?.meta || {
      total: rawPromotions.length,
      limit: 10,
      page: Number(page) || 1,
      totalPage: Math.ceil(rawPromotions.length / 10) || 1,
    };

  // Metrics calculation
  const metrics = useMemo(() => {
    let activeAds = 0;
    let totalViews = 0;
    let totalClicks = 0;
    let featuredAds = 0;

    let pendingReviews = 0;
    rawPromotions.forEach((p) => {
      if (p.status === "approved") activeAds += 1;
      if (p.status === "pending") pendingReviews += 1;
      if (p.isFeatured) featuredAds += 1;
      totalViews += p.viewsCount || 0;
      totalClicks += p.clicksCount || 0;
    });

    return {
      total: paginationMeta.total || rawPromotions.length,
      activeAds,
      totalViews,
      totalClicks,
      featuredAds,
      pendingReviews,
    };
  }, [rawPromotions, paginationMeta]);

  // Distinct cities list from current data
  const distinctCities = useMemo(() => {
    const set = new Set<string>();
    rawPromotions.forEach((p) => {
      if (p.city && p.city.trim()) set.add(p.city.trim());
    });
    return Array.from(set);
  }, [rawPromotions]);

  // Open Handlers
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TPromotionalZone) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenInquiriesModal = (item: TPromotionalZone) => {
    setInquiriesItem(item);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  // Toggle Featured Pin
  const handleToggleFeature = async (id: string) => {
    try {
      const res = await toggleFeature(id).unwrap();
      toast.success(res?.message || "Featured status updated successfully");
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Quick Status Change (Approve / Reject)
  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Promotion marked as ${status}`);
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Submit Promotion (Create / Update)
  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (editingItem) {
        const res = await updatePromotion({ id: editingItem._id, data: formData }).unwrap();
        toast.success(res?.message || "Promotional ad updated successfully");
      } else {
        const res = await createPromotion(formData).unwrap();
        toast.success(res?.message || "Promotional ad created successfully");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePromotion(deleteId).unwrap();
      toast.success("Promotion deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      await refetch();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedType("all");
    setSelectedCity("all");
    setFeaturedFilter("all");
  };

  const hasActiveFilters =
    searchTerm !== "" ||
    statusFilter !== "all" ||
    selectedType !== "all" ||
    selectedCity !== "all" ||
    featuredFilter !== "all";

  // Table Columns
  const columns = useMemo(
    () =>
      getPromotionalZoneColumns(
        handleOpenInquiriesModal,
        handleOpenEditModal,
        handleOpenDeleteModal,
        handleToggleFeature,
        handleStatusChange
      ),
    []
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-20">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Promotional Ads & Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage paid in-app advertising banners and external sponsor links
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-98 transition-all text-xs font-semibold shadow-2xs cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Ad Campaign</span>
        </button>
      </div>

      {/* Metrics Row (Flat, High Density, Full-Width) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Ad Campaigns
            </span>
            <Megaphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.total}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">All created promotional ads</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Ads Running
            </span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.activeAds}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Currently displaying in app</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Impressions
            </span>
            <Eye className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.totalViews}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Times ads viewed by users</div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Link Clicks
            </span>
            <MousePointerClick className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">{metrics.totalClicks}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Redirects to external sites</div>
        </div>
      </div>

      {/* Main Table Card (Full Width) */}
      <div className="w-full bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
        {/* Controls Bar: Tabs, Search & Filters */}
        <div className="p-3.5 border-b border-slate-200 space-y-3 bg-slate-50/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Segmented Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1 p-0.5 bg-slate-200/60 rounded-md">
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all");
                  setStatusFilter("all");
                  setFeaturedFilter("all");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                  selectedType === "all" && statusFilter === "all" && featuredFilter === "all"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All ({metrics.total})
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("COACH_SESSION");
                  setStatusFilter("all");
                  setFeaturedFilter("all");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                  selectedType === "COACH_SESSION"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Coach Sessions
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedType("TEAM_SHOWCASE");
                  setStatusFilter("all");
                  setFeaturedFilter("all");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer ${
                  selectedType === "TEAM_SHOWCASE"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Team Showcases
              </button>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("pending");
                  setSelectedType("all");
                  setFeaturedFilter("all");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === "pending"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>Pending Review</span>
                {metrics.pendingReviews > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {metrics.pendingReviews}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeaturedFilter("true");
                  setSelectedType("all");
                  setStatusFilter("all");
                }}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-all cursor-pointer flex items-center gap-1 ${
                  featuredFilter === "true"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Featured Only</span>
              </button>
            </div>

            {/* Search & Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Search Field */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="w-32">
                <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
                  <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter */}
              {distinctCities.length > 0 && (
                <div className="w-32">
                  <Select value={selectedCity} onValueChange={(val) => setSelectedCity(val)}>
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-200">
                      <SelectValue placeholder="All Cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {distinctCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium rounded-md transition-all cursor-pointer"
                  title="Reset all active filters"
                >
                  <RotateCcw className="w-3 h-3 text-slate-400" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Custom Data Table */}
        <CustomTable
          columns={columns}
          data={rawPromotions}
          isLoading={isLoading}
        />

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{rawPromotions.length}</span> of{" "}
            <span className="font-semibold text-slate-800">{paginationMeta.total}</span> total promotions
          </div>
          <CustomPagination TOTAL_PAGES={paginationMeta.totalPage} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <PromotionalZoneModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Inquiries / Applications Modal */}
      <PromotionalInquiriesModal
        isOpen={Boolean(inquiriesItem)}
        onClose={() => setInquiriesItem(null)}
        promotion={inquiriesItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteId(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Promotion"
        description="Are you sure you want to permanently delete this promotional post? All associated applicant inquiries will also be removed."
      />
    </div>
  );
}
