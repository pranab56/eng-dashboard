/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import TableHeader from "@/components/cui/TableHeader";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import GalleryModal from "@/components/modals/GalleryModal";
import CustomTable from "@/components/table/CustomTable";
import {
  useCreateGalleryMutation,
  useDeleteGalleryMutation,
  useGetAllGalleryQuery,
  useUpdateGalleryMutation,
} from "@/features/gallery/galleryApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getGalleryColumns } from "@/tableColumns/galleryColumns";
import { TGallery } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import dayjs from "dayjs";
import {
  Image as ImageIcon,
  Plus,
  CheckCircle2,
  LayoutGrid,
  List,
  Trash2,
  Edit,
} from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const GalleryManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // Gallery View State
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<TGallery | null>(null);

  // Delete Confirm Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // RTK Query Queries
  const { data: galleryData, isLoading: isGalleryLoading } = useGetAllGalleryQuery({
    pageNumber: page,
  });

  // RTK Query Mutations
  const [createGallery, { isLoading: isCreatingGallery }] = useCreateGalleryMutation();
  const [updateGallery, { isLoading: isUpdatingGallery }] = useUpdateGalleryMutation();
  const [deleteGallery, { isLoading: isDeletingGallery }] = useDeleteGalleryMutation();

  const galleryItems: TGallery[] = galleryData?.data || [];
  const pagination = galleryData?.pagination || { total: 0, totalPage: 1 };

  useEffect(() => {
    setHeaders({
      title: "Gallery Management",
      des: "Manage photos and media items in the gallery.",
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

  // Compute stats
  const totalGalleryItems = pagination.total || galleryItems.length;
  const activeGalleryCount = galleryItems.filter(
    (i) => (i.status || "").toLowerCase() === "active"
  ).length;

  const tableHeaderPayload = {
    title: "Gallery Media List",
    des: "All photo media items in the gallery.",
    url: "",
  };

  const columns = getGalleryColumns(
    handleOpenEditGalleryModal,
    handleOpenDeleteGalleryModal
  );

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Total Images
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isGalleryLoading ? "—" : totalGalleryItems}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Active Images
            </p>
            <p className="text-2xl font-bold text-green-600">
              {isGalleryLoading ? "—" : activeGalleryCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col">
        <div className="flex-1">
          {/* Header Bar */}
          <div className="px-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <TableHeader payload={tableHeaderPayload} />

            <div className="flex items-center gap-3 flex-wrap">
              {/* Grid / Table Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-white text-gray-900 shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                  title="Table View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Image Button */}
              <button
                type="button"
                onClick={handleOpenAddGalleryModal}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Image</span>
              </button>
            </div>
          </div>

          {/* MEDIA GALLERY CONTENT */}
          <div className="pt-4 px-6">
            {isGalleryLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-center text-gray-400">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading gallery images...</p>
              </div>
            ) : galleryItems.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <p className="text-gray-600 font-semibold text-lg">
                  No gallery items found
                </p>
                <p className="text-gray-400 text-sm max-w-sm">
                  Click the &quot;Add Image&quot; button above to upload photos to the gallery.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-2">
                {galleryItems.map((item) => {
                  const imgUrl = formatImagePath(item.image);
                  const isActive =
                    (item.status || "active").toLowerCase() === "active";

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
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative"
                    >
                      {/* Image Preview Container */}
                      <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                        {imgUrl ? (
                          <Image
                            src={imgUrl}
                            alt={catName || "Gallery"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-8 h-8" />
                          </div>
                        )}

                        {/* Status Badge Over Image */}
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm border ${
                              isActive
                                ? "bg-green-500/90 text-white border-green-400"
                                : "bg-gray-500/90 text-white border-gray-400"
                            }`}
                          >
                            {item.status || "active"}
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                                {catName || "General"}
                              </span>
                              {subName && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {subName}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">
                              {item.createdAt
                                ? dayjs(item.createdAt).format("MMM DD, YYYY")
                                : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGalleryModal(item)}
                            className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteGalleryModal(item._id)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View */
              <CustomTable<TGallery>
                columns={columns}
                data={galleryItems}
                isLoading={isGalleryLoading}
              />
            )}
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="pt-4 border-t border-gray-100">
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
        title="Delete Gallery Item"
        description="Are you sure you want to delete this gallery image? This action cannot be undone."
      />
    </div>
  );
};

export default GalleryManagement;
