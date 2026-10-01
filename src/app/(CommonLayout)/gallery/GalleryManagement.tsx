/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import CustomPagination from "@/components/cui/CustomPagination";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import GalleryModal from "@/components/modals/GalleryModal";
import CustomTable from "@/components/table/CustomTable";
import {
  useCreateGalleryMutation,
  useDeleteGalleryMutation,
  useGetAllGalleryQuery,
  useGetAllCategoryQuery,
  useGetGalleryOverviewQuery,
  useUpdateGalleryMutation,
} from "@/features/gallery/galleryApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getGalleryColumns } from "@/tableColumns/galleryColumns";
import { TGallery, TCategory } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import dayjs from "dayjs";
import {
  Image as ImageIcon,
  Plus,
  LayoutGrid,
  List,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  CheckCircle2,
  Folder,
  Layers,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const GalleryManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Gallery View State
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<TGallery | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Delete Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // RTK Query Queries
  const { 
    data: galleryData, 
    isLoading: isGalleryLoading, 
    isFetching: isGalleryFetching,
    refetch: refetchGallery 
  } = useGetAllGalleryQuery({
    pageNumber: page,
  });

  // Backend Overview Statistics (computed on MongoDB server)
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetGalleryOverviewQuery(
    selectedCategoryFilter !== "ALL" ? { category: selectedCategoryFilter } : {}
  );
  const overview = overviewRes?.data;

  const { data: categoryData } = useGetAllCategoryQuery({});
  const categoriesList: TCategory[] = categoryData?.data || [];

  // RTK Query Mutations
  const [createGallery, { isLoading: isCreatingGallery }] = useCreateGalleryMutation();
  const [updateGallery, { isLoading: isUpdatingGallery }] = useUpdateGalleryMutation();
  const [deleteGallery, { isLoading: isDeletingGallery }] = useDeleteGalleryMutation();

  const galleryItems: TGallery[] = useMemo(() => {
    return galleryData?.data || [];
  }, [galleryData]);

  const pagination = galleryData?.pagination || { total: 0, totalPage: 1 };

  useEffect(() => {
    setHeaders({
      title: "Gallery Management",
      des: "Manage photos, tournament captures, and media assets.",
    });
  }, [setHeaders]);

  // Gallery Modal Handlers
  const handleOpenAddGalleryModal = () => {
    setEditingGalleryItem(null);
    setIsGalleryModalOpen(true);
  };

  const handleOpenEditGalleryModal = (item: TGallery) => {
    setEditingGalleryItem(item);
    setIsGalleryModalOpen(true);
  };

  const handleCloseGalleryModal = () => {
    if (!isCreatingGallery && !isUpdatingGallery) {
      setIsGalleryModalOpen(false);
      setEditingGalleryItem(null);
    }
  };

  const handleGalleryModalSubmit = async (data: {
    category: string;
    subCategory?: string;
    status: string;
    file: File | null;
  }) => {
    try {
      const formData = new FormData();
      if (data.file) {
        formData.append("image", data.file);
      }
      const payloadData: any = {
        category: data.category,
        status: data.status,
      };
      if (data.subCategory) {
        payloadData.subCategory = data.subCategory;
      }

      formData.append("data", JSON.stringify(payloadData));

      if (editingGalleryItem) {
        const res = await updateGallery({
          id: editingGalleryItem._id,
          data: formData,
        }).unwrap();
        if (res.success !== false) {
          toast.success(res.message || "Gallery item updated successfully!");
          setIsGalleryModalOpen(false);
          setEditingGalleryItem(null);
        } else {
          toast.error(res.message || "Failed to update item");
        }
      } else {
        const res = await createGallery(formData).unwrap();
        if (res.success !== false) {
          toast.success(res.message || "Gallery item created successfully!");
          setIsGalleryModalOpen(false);
          setEditingGalleryItem(null);
        } else {
          toast.error(res.message || "Failed to create item");
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Operation failed"));
    }
  };

  // Delete Action Handlers
  const handleOpenDeleteGalleryModal = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const res = await deleteGallery(deleteTargetId).unwrap();
      if (res.success !== false) {
        toast.success(res.message || "Gallery item deleted successfully!");
      } else {
        toast.error(res.message || "Failed to delete item");
      }
      setDeleteTargetId(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete item"));
    }
  };

  // Filtered gallery items for Grid and Table view
  const filteredGalleryItems = useMemo(() => {
    return galleryItems.filter((item) => {
      // Category filter
      if (selectedCategoryFilter !== "ALL") {
        const catObj = item.category as any;
        const catId = typeof catObj === "object" && catObj ? catObj._id || catObj.id : catObj;
        if (catId !== selectedCategoryFilter) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        const itemStatus = (item.status || "active").toLowerCase();
        if (itemStatus !== statusFilter.toLowerCase()) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const catObj = item.category as any;
        const subObj = item.subCategory as any;
        const catName = typeof catObj === "object" && catObj ? catObj.name || "" : String(catObj || "");
        const subName = typeof subObj === "object" && subObj ? subObj.name || "" : String(subObj || "");
        const statusStr = item.status || "";
        const matchesCat = catName.toLowerCase().includes(q);
        const matchesSub = subName.toLowerCase().includes(q);
        const matchesStatus = statusStr.toLowerCase().includes(q);
        return matchesCat || matchesSub || matchesStatus;
      }

      return true;
    });
  }, [galleryItems, selectedCategoryFilter, statusFilter, searchTerm]);

  // Backend-driven overview stats (calculated on MongoDB backend)
  const totalGalleryItems = overview?.totalPhotos ?? pagination.total ?? 0;
  const activeGalleryCount = overview?.activePhotos ?? 0;
  const inactiveGalleryCount = overview?.inactivePhotos ?? 0;
  const totalCategoriesCount = overview?.totalCategories ?? categoriesList.length;

  const columns = getGalleryColumns(
    handleOpenEditGalleryModal,
    handleOpenDeleteGalleryModal
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Gallery Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize photography albums, tournament matchday captures, and assets.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* View Toggle */}
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
            onClick={() => { refetchGallery(); refetchOverview(); }}
            disabled={isGalleryFetching || isOverviewFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh gallery items"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isGalleryFetching || isOverviewFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Add Image Button */}
          <button
            type="button"
            onClick={handleOpenAddGalleryModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Photos</span>
            <ImageIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : totalGalleryItems.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">media assets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across all albums & categories
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Assets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {isOverviewLoading ? "—" : activeGalleryCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">live photos</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Visible on client apps & portal
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Draft / Inactive</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : inactiveGalleryCount.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">hidden assets</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Unpublished from public feed
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Albums Configured</span>
            <Folder className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {totalCategoriesCount}
            </span>
            <span className="text-xs text-slate-500">categories</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            League & Tournament albums
          </div>
        </div>
      </div>

      {/* Control Strip: Category Filter, Status Filter, Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
        {/* Left: Album Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategoryFilter("ALL")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategoryFilter === "ALL"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            All Albums
          </button>
          {categoriesList.map((cat) => {
            const catId = cat._id || cat.id || "";
            const isSelected = selectedCategoryFilter === catId;
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setSelectedCategoryFilter(catId)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Right: Status Switch & Search */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Segmented Control */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "ALL"
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
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
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-white text-slate-800 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search album, tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {isGalleryLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl">
            <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500 mt-3">
              Loading gallery media...
            </p>
          </div>
        ) : filteredGalleryItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl text-center px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No Gallery Photos Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm || selectedCategoryFilter !== "ALL" || statusFilter !== "ALL"
                ? "No media items matched your active filters. Try resetting the search or album category."
                : "No photography assets have been uploaded to the gallery yet."}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {(searchTerm || selectedCategoryFilter !== "ALL" || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategoryFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
              <button
                type="button"
                onClick={handleOpenAddGalleryModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Photo
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGalleryItems.map((item) => {
              const imgUrl = formatImagePath(item.image);
              const isActive = (item.status || "active").toLowerCase() === "active";

              const catObj = item.category as any;
              const subObj = item.subCategory as any;
              const catName =
                typeof catObj === "object" && catObj
                  ? catObj.name
                  : typeof catObj === "string"
                    ? catObj
                    : "";
              const subName =
                typeof subObj === "object" && subObj
                  ? subObj.name
                  : typeof subObj === "string"
                    ? subObj
                    : "";

              return (
                <div
                  key={item._id}
                  className="group bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Photo Container */}
                  <div className="relative w-full aspect-[4/3] bg-slate-100 overflow-hidden">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={catName || "Gallery Image"}
                        fill
                        className="object-cover group-hover:scale-102 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      </div>
                    )}

                    {/* Status Pill on top-right */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shadow-2xs ${
                          isActive
                            ? "bg-emerald-500/90 text-white border-emerald-400"
                            : "bg-slate-700/90 text-white border-slate-600"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isActive ? "bg-white" : "bg-slate-300"
                          }`}
                        />
                        <span className="capitalize">{item.status || "active"}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Details */}
                  <div className="p-3.5 space-y-2.5">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 truncate max-w-[200px]">
                          {catName || "General"}
                        </span>
                        {subName && (
                          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 truncate max-w-[150px]">
                            {subName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {item.createdAt
                            ? dayjs(item.createdAt).format("MMM DD, YYYY")
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditGalleryModal(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDeleteGalleryModal(item._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3 h-3 text-rose-500" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <CustomTable<TGallery>
              columns={columns}
              data={filteredGalleryItems}
              isLoading={isGalleryLoading}
            />
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="pt-6">
            <CustomPagination TOTAL_PAGES={pagination.totalPage} />
          </div>
        )}
      </div>

      {/* Gallery Image Upload / Edit Modal */}
      <GalleryModal
        isOpen={isGalleryModalOpen}
        onClose={handleCloseGalleryModal}
        onSubmit={handleGalleryModalSubmit}
        editingItem={editingGalleryItem}
        isLoading={isCreatingGallery || isUpdatingGallery}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeletingGallery}
        title="Delete Gallery Photo"
        description="Are you sure you want to permanently delete this photo from the gallery? This action cannot be undone."
      />
    </div>
  );
};

export default GalleryManagement;
