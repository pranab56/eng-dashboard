/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import SocialMediaModal from "@/components/modals/SocialMediaModal";
import CustomTable from "@/components/table/CustomTable";
import {
  useCreateSocialMediaMutation,
  useDeleteSocialMediaMutation,
  useGetAllSocialMediaQuery,
  useUpdateSocialMediaMutation,
} from "@/features/social-media/socialApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getSocialColumns } from "@/tableColumns/socialColumns";
import { TSocialMedia } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Share2, Plus, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SocialMediaManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TSocialMedia | null>(null);

  // Delete Modal State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: socialData, isLoading } = useGetAllSocialMediaQuery({
    pageNumber: page,
  });

  const [createSocialMedia, { isLoading: isCreating }] =
    useCreateSocialMediaMutation();
  const [updateSocialMedia, { isLoading: isUpdating }] =
    useUpdateSocialMediaMutation();
  const [deleteSocialMedia, { isLoading: isDeleting }] =
    useDeleteSocialMediaMutation();

  const links: TSocialMedia[] = socialData?.data || [];
  const pagination = socialData?.pagination || { total: 0, totalPage: 1 };

  useEffect(() => {
    setHeaders({
      title: "Social Media Management",
      des: "Manage official social media links, public routing channels, and connected handles.",
    });
  }, [setHeaders]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: TSocialMedia) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (!isCreating && !isUpdating) {
      setIsModalOpen(false);
      setEditingItem(null);
    }
  };

  const handleModalSubmit = async (data: {
    platform: string;
    url: string;
    icon?: string;
    status: boolean;
    order: number;
  }) => {
    try {
      if (editingItem) {
        const res = await updateSocialMedia({
          id: editingItem._id,
          data,
        }).unwrap();
        if (res.success !== false) {
          toast.success(
            res.message || "Social media link updated successfully"
          );
          setIsModalOpen(false);
          setEditingItem(null);
        } else {
          toast.error(res.message || "Failed to update social media link");
        }
      } else {
        const res = await createSocialMedia(data).unwrap();
        if (res.success !== false) {
          toast.success(
            res.message || "Social media link created successfully"
          );
          setIsModalOpen(false);
          setEditingItem(null);
        } else {
          toast.error(res.message || "Failed to create social media link");
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Operation failed"));
    }
  };

  const handleOpenDeleteModal = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await deleteSocialMedia(deleteId).unwrap();
      if (res.success !== false) {
        toast.success(res.message || "Social media link deleted successfully");
        setIsDeleteModalOpen(false);
        setDeleteId(null);
      } else {
        toast.error(res.message || "Failed to delete link");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete link"));
    }
  };

  // Compute stat metrics
  const totalCount = pagination.total || links.length;
  const activeCount = links.filter((l) => l.status === true).length;
  const inactiveCount = links.filter((l) => l.status === false).length;

  const columns = getSocialColumns(handleOpenEditModal, handleOpenDeleteModal);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Executive Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Platforms */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Platforms
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {isLoading ? "—" : totalCount}
            </span>
            <span className="text-xs text-slate-400">channels</span>
          </div>
        </div>

        {/* Active Links */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Links
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {isLoading ? "—" : activeCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>

        {/* Inactive Links */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Inactive Links
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-700 tabular-nums">
              {isLoading ? "—" : inactiveCount}
            </span>
            <span className="text-xs text-slate-400">disabled</span>
          </div>
        </div>
      </div>

      {/* 2. Main Registry Table Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* Integrated Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">
                Official Social Channels
              </h2>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600">
                {totalCount} total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configured public handles routing to official social and messaging profiles.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-all shadow-2xs cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Social Link</span>
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <CustomTable<TSocialMedia>
            columns={columns}
            data={links}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="p-4 border-t border-slate-200/80">
            <CustomPagination TOTAL_PAGES={pagination.totalPage} />
          </div>
        )}
      </div>

      {/* Add / Edit Social Media Modal */}
      <SocialMediaModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Social Media Link"
        description="Are you sure you want to delete this social media channel? This will remove the link from public member profiles and the mobile app footer."
      />
    </div>
  );
};

export default SocialMediaManagement;
