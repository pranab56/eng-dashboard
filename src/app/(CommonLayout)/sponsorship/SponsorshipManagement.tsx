/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import SponsorshipModal from "@/components/modals/SponsorshipModal";
import CustomTable from "@/components/table/CustomTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSponsorshipMutation,
  useDeleteSponsorshipMutation,
  useGetAllSponsorshipQuery,
  useGetSponsorshipAnalyticsQuery,
  useToggleSponsorshipStatusMutation,
  useUpdateSponsorshipMutation,
} from "@/features/sponsorship/sponsorshipApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getSponsorshipColumns } from "@/tableColumns/sponsorshipColumns";
import { TSponsorship } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Plus,
  Search,
  X,
  RotateCcw,
  Briefcase,
  CheckCircle2,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SponsorshipManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Filter States
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TSponsorship | null>(null);

  // Delete Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Queries & Mutations
  const { data: sponsorshipData, isLoading } = useGetAllSponsorshipQuery({
    pageNumber: page,
    limit: 10,
    searchValue,
    type: selectedType,
    tier: selectedTier,
    status: selectedStatus,
  });

  const { data: analyticsData } = useGetSponsorshipAnalyticsQuery({});

  const [createSponsorship, { isLoading: isCreating }] =
    useCreateSponsorshipMutation();
  const [updateSponsorship, { isLoading: isUpdating }] =
    useUpdateSponsorshipMutation();
  const [deleteSponsorship, { isLoading: isDeleting }] =
    useDeleteSponsorshipMutation();
  const [toggleStatus] = useToggleSponsorshipStatusMutation();

  const sponsors: TSponsorship[] = sponsorshipData?.data || [];
  const pagination = sponsorshipData?.pagination || { total: 0, totalPage: 1 };
  const analytics = analyticsData?.data?.overview || {
    total: 0,
    active: 0,
    totalClicks: 0,
    totalImpressions: 0,
    clickThroughRate: "0%",
  };

  useEffect(() => {
    setHeaders({
      title: "Sponsors & Partners",
      des: "Manage commercial sponsors, platform partners, and showcase placements.",
    });
  }, [setHeaders]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TSponsorship) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleModalSubmit = async (formData: FormData) => {
    try {
      if (editingItem?._id) {
        const res = await updateSponsorship({
          id: editingItem._id,
          data: formData,
        }).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Sponsorship updated successfully");
          handleCloseModal();
        }
      } else {
        const res = await createSponsorship(formData).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Sponsorship created successfully");
          handleCloseModal();
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save sponsorship"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      const res = await deleteSponsorship(deleteId).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Sponsor deleted successfully");
        handleCloseDeleteModal();
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete sponsor"));
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await toggleStatus(id).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Status updated");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update status"));
    }
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setSelectedType("all");
    setSelectedTier("all");
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    searchValue.trim() !== "" ||
    selectedType !== "all" ||
    selectedTier !== "all" ||
    selectedStatus !== "all";

  const columns = getSponsorshipColumns(
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleToggleStatus
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Brands */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Brands
            </span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {analytics.total || 0}
            </span>
            <span className="text-xs text-slate-400 font-normal">registered</span>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Active Campaigns
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {analytics.active || 0}
            </span>
            <span className="text-xs text-emerald-600 font-medium">live</span>
          </div>
        </div>

        {/* Impressions */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Total Impressions
            </span>
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {(analytics.totalImpressions || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-normal">views</span>
          </div>
        </div>

        {/* Clicks & CTR */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              Clicks (CTR)
            </span>
            <MousePointerClick className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {(analytics.totalClicks || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({analytics.clickThroughRate || "0%"})
            </span>
          </div>
        </div>
      </div>

      {/* 2. Management Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Top Controls Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Segmented Type Tabs */}
            <div className="inline-flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200/60 w-fit">
              {[
                { id: "all", label: "All" },
                { id: "sponsor", label: "Sponsors" },
                { id: "partner", label: "Official Partners" },
                { id: "brand_collaboration", label: "Collaborations" },
              ].map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    selectedType === tab.id
                      ? "bg-white text-slate-900 shadow-xs border border-slate-200/50"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Sponsor / Partner</span>
            </button>
          </div>

          {/* Search & Custom Dropdown Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search by brand name or tagline..."
                className="w-full h-8 pl-8 pr-7 rounded-md border border-slate-200 text-xs font-normal text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors bg-white"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Custom Tier Dropdown */}
            <div className="w-full sm:w-44">
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300">
                  <SelectValue placeholder="All Tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Status Dropdown */}
            <div className="w-full sm:w-36">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-8 px-2.5 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-1 shrink-0 cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <CustomTable
          columns={columns}
          data={sponsors}
          isLoading={isLoading}
        />

        {/* Table Footer with Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-normal">
            Showing {sponsors.length} of {pagination.total || 0} sponsors & partners
          </div>
          <CustomPagination TOTAL_PAGES={pagination.totalPage || 1} qryName="page" />
        </div>
      </div>

      {/* Add / Edit Modal */}
      <SponsorshipModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Remove Sponsor / Partner"
        description="Are you sure you want to remove this sponsor? It will immediately stop appearing in the showcase section across mobile and web platforms."
        isLoading={isDeleting}
      />
    </div>
  );
}
