/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import TableHeader from "@/components/cui/TableHeader";
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
      des: "Manage official social media links and platforms.",
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
            res.message || "Social media link updated successfully!"
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
            res.message || "Social media link created successfully!"
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
        toast.success(res.message || "Social media link deleted successfully!");
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

  const tableHeaderPayload = {
    title: "Official Social Media Links",
    des: "List of active and inactive social links.",
    url: "",
  };

  const columns = getSocialColumns(handleOpenEditModal, handleOpenDeleteModal);

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Share2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Total Platforms
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "—" : totalCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Active Links
            </p>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? "—" : activeCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Inactive Links
            </p>
            <p className="text-2xl font-bold text-gray-600">
              {isLoading ? "—" : inactiveCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col min-h-[500px]">
        <div className="flex-1">
          {/* Header Bar with Title & Add Button */}
          <div className="px-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <TableHeader payload={tableHeaderPayload} />

            <div className="flex items-center gap-3 flex-wrap">
              {/* Add Button */}
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Social Link</span>
              </button>
            </div>
          </div>

          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<TSocialMedia>
              columns={columns}
              data={links}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="pt-4 border-t border-gray-100">
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
        description="Are you sure you want to delete this social media link? This action cannot be undone."
      />
    </div>
  );
};

export default SocialMediaManagement;
