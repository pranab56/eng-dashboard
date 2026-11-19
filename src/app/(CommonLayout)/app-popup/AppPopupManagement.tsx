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
  Layers,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import AppPopupModal from "@/components/modals/AppPopupModal";
import {
  useCreateAppModalMutation,
  useDeleteAppModalMutation,
  useGetAllAppModalsQuery,
  useToggleAppModalStatusMutation,
  useUpdateAppModalMutation,
} from "@/features/appModal/appModalApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getAppModalColumns } from "@/tableColumns/appModalColumns";
import { TAppModal } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_TABS = [
  { label: "All Campaigns", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function AppPopupManagement() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TAppModal | null>(null);

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "App Open Popups",
      des: "Manage startup modal campaigns, promotional announcements, and mobile app screen routing.",
    });
  }, [setHeaders]);

  // Fetch modals
  const {
    data: apiResponse,
    isLoading,
    refetch,
  } = useGetAllAppModalsQuery(
    {
      pageNumber: Number(page) || 1,
      limit: 10,
      searchValue: searchTerm,
      status: statusFilter,
      actionType: actionTypeFilter,
    },
    { refetchOnMountOrArgChange: true }
  );

  const [createModal, { isLoading: isCreating }] = useCreateAppModalMutation();
  const [updateModal, { isLoading: isUpdating }] = useUpdateAppModalMutation();
  const [deleteModal, { isLoading: isDeleting }] = useDeleteAppModalMutation();
  const [toggleStatus] = useToggleAppModalStatusMutation();

  const rawModals: TAppModal[] = useMemo(() => {
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse?.data?.result)) return apiResponse.data.result;
    return [];
  }, [apiResponse]);

  const paginationMeta = useMemo(() => {
    return {
      total: apiResponse?.pagination?.total || rawModals.length,
      limit: apiResponse?.pagination?.limit || 10,
      page: apiResponse?.pagination?.page || Number(page) || 1,
      totalPage: apiResponse?.pagination?.totalPage || 1,
    };
  }, [apiResponse, rawModals.length, page]);

  // Metric computations
  const metrics = useMemo(() => {
    const total = paginationMeta.total;
    const activeCount = rawModals.filter((m) => m.status === "active").length;
    const totalViews = rawModals.reduce((sum, m) => sum + (m.viewsCount || 0), 0);
    const totalClicks = rawModals.reduce((sum, m) => sum + (m.clicksCount || 0), 0);
    return { total, activeCount, totalViews, totalClicks };
  }, [rawModals, paginationMeta.total]);

  // Handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: TAppModal) => {
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
      await deleteModal(deleteId).unwrap();
      toast.success("App popup deleted successfully.");
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
      toast.success(`Popup ${nextStatus === "active" ? "activated" : "deactivated"} successfully.`);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSubmitModal = async (formData: FormData) => {
    try {
      if (editingItem?._id) {
        await updateModal({ id: editingItem._id, data: formData }).unwrap();
        toast.success("App popup updated successfully.");
      } else {
        await createModal(formData).unwrap();
        toast.success("App popup created successfully.");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setActionTypeFilter("all");
  };

  const columns = useMemo(
    () => getAppModalColumns(handleEdit, handleDeletePrompt, handleToggleStatus),
    []
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-left">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            App Open Popups
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure promotional announcements and startup ads shown when users launch the mobile
            app.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Popup</span>
        </button>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Campaigns */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Campaigns
            </span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">{metrics.total}</span>
            <span className="text-xs text-slate-500">popups</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Configured in registry</p>
        </div>

        {/* Live Active */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Live in App
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-700">
              {metrics.activeCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">currently active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Available for app open trigger</p>
        </div>

        {/* Total Impressions */}
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
          <p className="text-[11px] text-slate-400 mt-1">Recorded app opens</p>
        </div>

        {/* Total Clicks */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              CTA Engagements
            </span>
            <MousePointerClick className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {metrics.totalClicks.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">clicks</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Direct destination navigations</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Status Tab Navigation & Search Bar */}
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

            {/* Destination Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Destination:
              </span>
              <Select value={actionTypeFilter} onValueChange={(val) => setActionTypeFilter(val)}>
                <SelectTrigger className="w-[180px] h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white hover:border-slate-300 focus:ring-1 focus:ring-slate-900">
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-slate-200 shadow-md">
                  <SelectItem value="all" className="text-xs py-2 cursor-pointer">
                    All Destinations
                  </SelectItem>
                  <SelectItem value="screen" className="text-xs py-2 cursor-pointer">
                    App Screen Navigation
                  </SelectItem>
                  <SelectItem value="external_url" className="text-xs py-2 cursor-pointer">
                    External Web URL
                  </SelectItem>
                  <SelectItem value="dismiss_only" className="text-xs py-2 cursor-pointer">
                    Dismiss Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Row */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search popup title, subtitle, or screen path..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-9 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-all"
              />
            </div>

            {(searchTerm || statusFilter !== "all" || actionTypeFilter !== "all") && (
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

        {/* Data Table */}
        <CustomTable columns={columns} data={rawModals} isLoading={isLoading} />

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-700">{rawModals.length}</span> of{" "}
            <span className="font-semibold text-slate-700">{paginationMeta.total}</span> popups
          </p>
          <CustomPagination TOTAL_PAGES={paginationMeta.totalPage} showPageInfo={false} />
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AppPopupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
        title="Delete App Popup"
        description="Are you sure you want to permanently delete this startup modal? Mobile users will no longer see this campaign."
      />
    </div>
  );
}
