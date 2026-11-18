/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2,
  Layers,
  LayoutGrid,
  List,
  RefreshCw,
  Edit2,
  Trash2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import BannerModal from "@/components/modals/BannerModal";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetAllBannersQuery,
  useToggleBannerStatusMutation,
  useUpdateBannerMutation,
} from "@/features/banner/bannerApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getBannerColumns } from "@/tableColumns/bannerColumns";
import { TBanner } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";

const SECTION_OPTIONS = [
  { label: "All Sections", value: "all" },
  { label: "ENG FIXTURES", value: "ENG FIXTURES" },
  { label: "ENG TABLES", value: "ENG TABLES" },
  { label: "ENG STATS", value: "ENG STATS" },
  { label: "ENG TV", value: "ENG TV" },
  { label: "ENG NEWS", value: "ENG NEWS" },
  { label: "MATCH CENTER", value: "MATCH CENTER" },
  { label: "HOME", value: "HOME" },
];

export default function SectionBannerManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // View mode: Grid or Table
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TBanner | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Section Banners",
      des: "Manage top banner images for mobile app sections (Fixtures, Tables, Stats, TV, etc.). Add, edit, or remove banners dynamically.",
    });
  }, [setHeaders]);

  // Fetch banners
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBannersQuery(
    {
      pageNumber: Number(page) || 1,
      limit: 12,
      searchValue: searchTerm,
      section: sectionFilter,
      status: statusFilter,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();
  const [toggleStatus] = useToggleBannerStatusMutation();

  const rawBanners: TBanner[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse?.data?.result)) return apiResponse.data.result;
    return [];
  }, [apiResponse]);

  const paginationMeta = useMemo(() => {
    return {
      total: apiResponse?.pagination?.total || rawBanners.length,
      limit: apiResponse?.pagination?.limit || 12,
      page: apiResponse?.pagination?.page || Number(page) || 1,
      totalPage: apiResponse?.pagination?.totalPage || 1,
    };
  }, [apiResponse, rawBanners, page]);

  // Statistics counts
  const stats = useMemo(() => {
    const total = paginationMeta.total;
    const active = rawBanners.filter((b) => b.status === "active").length;
    const inactive = rawBanners.filter((b) => b.status === "inactive").length;
    const sectionsCount = new Set(rawBanners.map((b) => b.section || "ENG FIXTURES")).size;
    return { total, active, inactive, sectionsCount };
  }, [rawBanners, paginationMeta.total]);

  // Handle Create / Update Submit
  const handleFormSubmit = async (formData: FormData) => {
    try {
      if (editingItem) {
        const id = editingItem._id || editingItem.id;
        await updateBanner({ id, data: formData }).unwrap();
        toast.success("Section banner updated successfully!");
      } else {
        await createBanner(formData).unwrap();
        toast.success("Section banner created successfully!");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save banner."));
    }
  };

  // Handle Edit Action
  const handleEdit = (item: TBanner) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBanner(deleteId).unwrap();
      toast.success("Banner deleted successfully!");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete banner."));
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await toggleStatus({ id, status: nextStatus }).unwrap();
      toast.success(`Banner is now ${nextStatus}!`);
      refetch();
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to update status."));
    }
  };

  const columns = useMemo(
    () => getBannerColumns(handleEdit, handleDeleteClick, handleToggleStatus),
    []
  );

  const hasActiveFilters =
    searchTerm !== "" || sectionFilter !== "all" || statusFilter !== "all";

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Section Banners
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage top banner images for mobile app sections (Fixtures, Tables, Stats, TV, etc.).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Grid / Table View Mode Toggle */}
          <div className="inline-flex items-center p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh banner items"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Banner Button */}
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Banner</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Banners
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500">banners</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all app sections</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Active (Visible)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {stats.active}
            </span>
            <span className="text-xs text-slate-500">live</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Currently shown in mobile app</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Inactive
            </span>
            <ImageIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {stats.inactive}
            </span>
            <span className="text-xs text-slate-500">hidden</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Draft or hidden banners</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Target Sections
            </span>
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-indigo-700">
              {stats.sectionsCount}
            </span>
            <span className="text-xs text-slate-500">sections</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Configured app screens</div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs p-4 space-y-3">
        {/* Section Segmented Pill Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
            Section:
          </span>
          {SECTION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSectionFilter(opt.value)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer shrink-0 ${
                sectionFilter === opt.value
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search & Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search banner title, section, or caption..."
                className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSectionFilter("all");
                  setStatusFilter("all");
                }}
                className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer shrink-0"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Segmented Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === "all"
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === "active"
                  ? "bg-white text-emerald-700 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-white text-slate-800 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl">
            <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500 mt-3">
              Loading section banners...
            </p>
          </div>
        ) : rawBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl text-center px-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No Section Banners Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {hasActiveFilters
                ? "No banners matched your active filters. Try resetting the filters or search term."
                : "No banners uploaded yet. Click 'Upload Banner' above to add your first app banner."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSectionFilter("all");
                    setStatusFilter("all");
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Banner
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid Card View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {rawBanners.map((item) => {
                const imgUrl = item.image ? formatImagePath(item.image) : "";
                const isActive = item.status === "active";
                const bannerId = item._id || item.id || "";

                return (
                  <div
                    key={bannerId}
                    className="group bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
                  >
                    {/* Banner Image Container (Wide Banner Ratio) */}
                    <div className="relative w-full aspect-[16/8] bg-slate-900 overflow-hidden">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.title || "Section Banner"}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-8 h-8 text-slate-600" />
                        </div>
                      )}

                      {/* Top-Right Status Pill Toggle */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(bannerId, item.status)}
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border shadow-2xs transition cursor-pointer ${
                            isActive
                              ? "bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600"
                              : "bg-slate-800/90 text-white border-slate-700 hover:bg-slate-700"
                          }`}
                          title="Click to toggle status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-white" : "bg-slate-400"
                            }`}
                          />
                          <span className="capitalize">{item.status}</span>
                        </button>
                      </div>

                      {/* Top-Left Target Section Badge */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/75 text-white backdrop-blur-xs border border-white/20">
                          {item.section || "GENERAL"}
                        </span>
                      </div>
                    </div>

                    {/* Banner Card Details */}
                    <div className="p-4 flex items-center justify-between gap-3 border-t border-slate-100 bg-white">
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-bold text-slate-900 truncate"
                          title={item.title || item.name}
                        >
                          {item.title || item.name || "Untitled Banner"}
                        </h4>
                        {item.subtitle ? (
                          <p
                            className="text-xs text-slate-500 truncate mt-0.5"
                            title={item.subtitle}
                          >
                            {item.subtitle}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">No caption</p>
                        )}
                        {item.priority && item.priority > 0 ? (
                          <span className="inline-block mt-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Priority: {item.priority}
                          </span>
                        ) : null}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(bannerId)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Footer */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{rawBanners.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{paginationMeta.total}</span> banners
              </p>
              <CustomPagination
                TOTAL_PAGES={paginationMeta.totalPage}
                showPageInfo={false}
              />
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <CustomTable
              columns={columns}
              data={rawBanners}
              isLoading={isLoading}
            />
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{rawBanners.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{paginationMeta.total}</span> banners
              </p>
              <CustomPagination
                TOTAL_PAGES={paginationMeta.totalPage}
                showPageInfo={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <BannerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
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
        title="Delete Section Banner"
        description="Are you sure you want to delete this section banner? This action will permanently remove the banner and its image file from the system."
      />
    </div>
  );
}
