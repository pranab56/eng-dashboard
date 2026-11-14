/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  RotateCcw,
  Eye,
  MousePointerClick,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import BookAScoutModal from "@/components/modals/BookAScoutModal";
import {
  useCreateBookAScoutMutation,
  useDeleteBookAScoutMutation,
  useGetAllBookAScoutQuery,
  useToggleBookAScoutFeaturedMutation,
  useToggleBookAScoutStatusMutation,
  useUpdateBookAScoutMutation,
} from "@/features/bookAScout/bookAScoutApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getBookAScoutColumns } from "@/tableColumns/bookAScoutColumns";
import { TBookAScout } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";

const STATUS_TABS = [
  { label: "All Cards", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export default function BookAScoutManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TBookAScout | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Book A Scout",
      des: "Manage Book A Scout showcase cards, image overlay badges, internal status, and redirect URLs.",
    });
  }, [setHeaders]);

  const { data: apiResponse, isLoading, refetch } = useGetAllBookAScoutQuery(
    {
      pageNumber: Number(page) || 1,
      limit: 10,
      searchValue: searchTerm,
      status: statusFilter,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createBookAScout, { isLoading: isCreating }] = useCreateBookAScoutMutation();
  const [updateBookAScout, { isLoading: isUpdating }] = useUpdateBookAScoutMutation();
  const [deleteBookAScout, { isLoading: isDeleting }] = useDeleteBookAScoutMutation();
  const [toggleStatus] = useToggleBookAScoutStatusMutation();
  const [toggleFeatured] = useToggleBookAScoutFeaturedMutation();

  const rawItems: TBookAScout[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse?.data?.result)) return apiResponse.data.result;
    return [];
  }, [apiResponse]);

  const paginationMeta = useMemo(() => {
    return {
      total: apiResponse?.pagination?.total || rawItems.length,
      limit: apiResponse?.pagination?.limit || 10,
      page: apiResponse?.pagination?.page || Number(page) || 1,
      totalPage: apiResponse?.pagination?.totalPage || 1,
    };
  }, [apiResponse, rawItems.length, page]);

  const metrics = useMemo(() => {
    const total = paginationMeta.total;
    const activeCount = rawItems.filter((m) => m.status === "active").length;
    const totalViews = rawItems.reduce((sum, m) => sum + (m.viewsCount || 0), 0);
    const totalClicks = rawItems.reduce((sum, m) => sum + (m.clicksCount || 0), 0);
    return { total, activeCount, totalViews, totalClicks };
  }, [rawItems, paginationMeta.total]);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: TBookAScout) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBookAScout(deleteId).unwrap();
      toast.success("Book A Scout card deleted successfully.");
      setIsDeleteModalOpen(false);
      setDeleteId(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await toggleStatus({ id, status: nextStatus }).unwrap();
      toast.success(
        `Card ${nextStatus === "active" ? "activated" : "set to inactive"} successfully.`
      );
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      await toggleFeatured(id).unwrap();
      toast.success("Featured status updated.");
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubmitModal = async (formData: FormData) => {
    try {
      if (editingItem?._id) {
        await updateBookAScout({ id: editingItem._id, data: formData }).unwrap();
        toast.success("Book A Scout card updated successfully.");
      } else {
        await createBookAScout(formData).unwrap();
        toast.success("Book A Scout card created successfully.");
      }
      setIsModalOpen(false);
      setEditingItem(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  const columns = useMemo(
    () =>
      getBookAScoutColumns(
        handleEdit,
        handleDeletePrompt,
        handleToggleStatus,
        handleToggleFeatured
      ),
    []
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Top Header & Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Book A Scout Section
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure the mobile app Book A Scout banner card, overlay badge, internal status, and redirect URL.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Scout Card</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Cards
            </span>
            <Compass className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {metrics.total}
            </span>
            <span className="text-xs text-slate-500">configured</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Book A Scout banners</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Active in App
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {metrics.activeCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">live cards</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Visible to app users</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Impressions
            </span>
            <Eye className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {metrics.totalViews.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">views</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Section renders recorded</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Book Now Clicks
            </span>
            <MousePointerClick className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {metrics.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">redirects</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">CTA button engagements</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Status Segmented Tabs */}
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      isActive
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, badge, description, or redirect URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>

            {(searchTerm || statusFilter !== "all") && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <CustomTable columns={columns} data={rawItems} isLoading={isLoading} />

        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">{rawItems.length}</span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {paginationMeta.total}
            </span>{" "}
            cards
          </p>
          <CustomPagination
            TOTAL_PAGES={paginationMeta.totalPage}
            showPageInfo={false}
          />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <BookAScoutModal
        key={editingItem?._id || (isModalOpen ? "create" : "closed")}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSubmitModal}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Book A Scout Card"
        description="Are you sure you want to delete this Book A Scout section card? Mobile users will no longer see it."
      />
    </div>
  );
}

