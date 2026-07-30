"use client";

import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";
import CategoryModal from "@/components/modals/CategoryModal";
import {
  // Gallery
  useGetAllGalleryCategoryQuery,
  useCreateGalleryCategoryMutation,
  useCreateGallerySubCategoryMutation,
  useUpdateGalleryCategoryMutation,
  useUpdateGallerySubCategoryMutation,
  useDeleteGalleryCategoryMutation,
  useDeleteGallerySubCategoryMutation,

  // Video (ENG TV)
  useGetAllVideoCategoryQuery,
  useCreateVideoCategoryMutation,
  useCreateVideoSubCategoryMutation,
  useUpdateVideoCategoryMutation,
  useUpdateVideoSubCategoryMutation,
  useDeleteVideoCategoryMutation,
  useDeleteVideoSubCategoryMutation,

  // Venue
  useGetAllVenueCategoryQuery,
  useCreateVenueCategoryMutation,
  useCreateVenueSubCategoryMutation,
  useUpdateVenueCategoryMutation,
  useUpdateVenueSubCategoryMutation,
  useDeleteVenueCategoryMutation,
  useDeleteVenueSubCategoryMutation,

  // Time / Playtime
  useGetAllPlayTimeQuery,
  useCreatePlayTimeMutation,
  useUpdatePlayTimeMutation,
  useDeletePlayTimeMutation,

  // Age Group
  // Age Group
  useGetAllAgeGroupQuery,
  useCreateAgeGroupMutation,
  useUpdateAgeGroupMutation,
  useDeleteAgeGroupMutation,

  // News
  useGetAllNewsCategoryQuery,
  useCreateNewsCategoryMutation,
  useUpdateNewsCategoryMutation,
  useDeleteNewsCategoryMutation,
} from "@/features/categoryManagement/categoryApi";

import { TCategory, TSubCategory } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  FolderPlus,
  GitBranch,
  Plus,
  Loader2,
  Layers,
  Image as ImageIcon,
  Video,
  MapPin,
  Clock,
  Users,
  Newspaper,
} from "lucide-react";
import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FiEdit, FiTrash2 } from "react-icons/fi";

type CategoryDomainKey =
  | "gallery"
  | "video"
  | "venue"
  | "time"
  | "ageGroup"
  | "news";

interface DomainConfig {
  key: CategoryDomainKey;
  label: string;
  badgeLabel: string;
  icon: React.ElementType;
  allowSubcategory: boolean;
  color: {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    hoverBg: string;
    subBadgeBg: string;
    subBadgeText: string;
  };
}

const DOMAIN_CONFIGS: DomainConfig[] = [
  {
    key: "gallery",
    label: "Gallery Management",
    badgeLabel: "Gallery",
    icon: ImageIcon,
    allowSubcategory: true,
    color: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
      badgeBg: "bg-blue-100 text-blue-700",
      hoverBg: "hover:bg-blue-50/60",
      subBadgeBg: "bg-blue-50 text-blue-700 border-blue-100",
      subBadgeText: "text-blue-600",
    },
  },
  {
    key: "video",
    label: "Video Management (ENG TV)",
    badgeLabel: "ENG TV",
    icon: Video,
    allowSubcategory: true,
    color: {
      bg: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      badgeBg: "bg-rose-100 text-rose-700",
      hoverBg: "hover:bg-rose-50/60",
      subBadgeBg: "bg-rose-50 text-rose-700 border-rose-100",
      subBadgeText: "text-rose-600",
    },
  },
  {
    key: "venue",
    label: "Venue Management",
    badgeLabel: "Venue",
    icon: MapPin,
    allowSubcategory: true,
    color: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      badgeBg: "bg-emerald-100 text-emerald-700",
      hoverBg: "hover:bg-emerald-50/60",
      subBadgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
      subBadgeText: "text-emerald-600",
    },
  },
  {
    key: "time",
    label: "Time Management",
    badgeLabel: "Playtime",
    icon: Clock,
    allowSubcategory: false,
    color: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      badgeBg: "bg-amber-100 text-amber-700",
      hoverBg: "hover:bg-amber-50/60",
      subBadgeBg: "bg-amber-50 text-amber-700 border-amber-100",
      subBadgeText: "text-amber-600",
    },
  },
  {
    key: "ageGroup",
    label: "Age Group Management",
    badgeLabel: "Age Group",
    icon: Users,
    allowSubcategory: false,
    color: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
      badgeBg: "bg-purple-100 text-purple-700",
      hoverBg: "hover:bg-purple-50/60",
      subBadgeBg: "bg-purple-50 text-purple-700 border-purple-100",
      subBadgeText: "text-purple-600",
    },
  },
  {
    key: "news",
    label: "News Management",
    badgeLabel: "News",
    icon: Newspaper,
    allowSubcategory: false,
    color: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      badgeBg: "bg-indigo-100 text-indigo-700",
      hoverBg: "hover:bg-indigo-50/60",
      subBadgeBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
      subBadgeText: "text-indigo-600",
    },
  },
];

export default function CategoryManagement() {
  // Active Domain Tab ("all" or one of CategoryDomainKey)
  const [activeTab, setActiveTab] = useState<"all" | CategoryDomainKey>("all");

  // 1. Gallery API Hooks
  const { data: galleryRes, isLoading: isGalleryLoading } =
    useGetAllGalleryCategoryQuery({});
  const [createGalleryCategory, { isLoading: isCreatingGalleryCat }] =
    useCreateGalleryCategoryMutation();
  const [createGallerySubCategory, { isLoading: isCreatingGallerySub }] =
    useCreateGallerySubCategoryMutation();
  const [updateGalleryCategory, { isLoading: isUpdatingGalleryCat }] =
    useUpdateGalleryCategoryMutation();
  const [updateGallerySubCategory, { isLoading: isUpdatingGallerySub }] =
    useUpdateGallerySubCategoryMutation();
  const [deleteGalleryCategory, { isLoading: isDeletingGalleryCat }] =
    useDeleteGalleryCategoryMutation();
  const [deleteGallerySubCategory, { isLoading: isDeletingGallerySub }] =
    useDeleteGallerySubCategoryMutation();

  // 2. Video (ENG TV) API Hooks
  const { data: videoRes, isLoading: isVideoLoading } =
    useGetAllVideoCategoryQuery({});
  const [createVideoCategory, { isLoading: isCreatingVideoCat }] =
    useCreateVideoCategoryMutation();
  const [createVideoSubCategory, { isLoading: isCreatingVideoSub }] =
    useCreateVideoSubCategoryMutation();
  const [updateVideoCategory, { isLoading: isUpdatingVideoCat }] =
    useUpdateVideoCategoryMutation();
  const [updateVideoSubCategory, { isLoading: isUpdatingVideoSub }] =
    useUpdateVideoSubCategoryMutation();
  const [deleteVideoCategory, { isLoading: isDeletingVideoCat }] =
    useDeleteVideoCategoryMutation();
  const [deleteVideoSubCategory, { isLoading: isDeletingVideoSub }] =
    useDeleteVideoSubCategoryMutation();

  // 3. Venue API Hooks
  const { data: venueRes, isLoading: isVenueLoading } =
    useGetAllVenueCategoryQuery({});
  const [createVenueCategory, { isLoading: isCreatingVenueCat }] =
    useCreateVenueCategoryMutation();
  const [createVenueSubCategory, { isLoading: isCreatingVenueSub }] =
    useCreateVenueSubCategoryMutation();
  const [updateVenueCategory, { isLoading: isUpdatingVenueCat }] =
    useUpdateVenueCategoryMutation();
  const [updateVenueSubCategory, { isLoading: isUpdatingVenueSub }] =
    useUpdateVenueSubCategoryMutation();
  const [deleteVenueCategory, { isLoading: isDeletingVenueCat }] =
    useDeleteVenueCategoryMutation();
  const [deleteVenueSubCategory, { isLoading: isDeletingVenueSub }] =
    useDeleteVenueSubCategoryMutation();

  // 4. Time Management API Hooks
  const { data: timeRes, isLoading: isTimeLoading } = useGetAllPlayTimeQuery(
    {}
  );
  const [createPlayTime, { isLoading: isCreatingTimeCat }] =
    useCreatePlayTimeMutation();
  const [updatePlayTime, { isLoading: isUpdatingTimeCat }] =
    useUpdatePlayTimeMutation();
  const [deletePlayTime, { isLoading: isDeletingTimeCat }] =
    useDeletePlayTimeMutation();

  // 5. Age Group API Hooks
  const { data: ageGroupRes, isLoading: isAgeGroupLoading } =
    useGetAllAgeGroupQuery({});
  const [createAgeGroup, { isLoading: isCreatingAgeGroupCat }] =
    useCreateAgeGroupMutation();
  const [updateAgeGroup, { isLoading: isUpdatingAgeGroupCat }] =
    useUpdateAgeGroupMutation();
  const [deleteAgeGroup, { isLoading: isDeletingAgeGroupCat }] =
    useDeleteAgeGroupMutation();

  // 6. News API Hooks
  const { data: newsRes, isLoading: isNewsLoading } =
    useGetAllNewsCategoryQuery({});
  const [createNewsCategory, { isLoading: isCreatingNewsCat }] =
    useCreateNewsCategoryMutation();
  const [updateNewsCategory, { isLoading: isUpdatingNewsCat }] =
    useUpdateNewsCategoryMutation();
  const [deleteNewsCategory, { isLoading: isDeletingNewsCat }] =
    useDeleteNewsCategoryMutation();

  // Category Lists
  const galleryCategories: TCategory[] = useMemo(
    () => galleryRes?.data || [],
    [galleryRes]
  );
  const videoCategories: TCategory[] = useMemo(
    () => videoRes?.data || [],
    [videoRes]
  );
  const venueCategories: TCategory[] = useMemo(
    () => venueRes?.data || [],
    [venueRes]
  );
  const timeCategories: TCategory[] = useMemo(
    () => timeRes?.data || [],
    [timeRes]
  );
  const ageGroupCategories: TCategory[] = useMemo(
    () => ageGroupRes?.data || [],
    [ageGroupRes]
  );
  const newsCategories: TCategory[] = useMemo(
    () => newsRes?.data || [],
    [newsRes]
  );

  // Map category data by domain key
  const domainDataMap: Record<CategoryDomainKey, TCategory[]> = useMemo(
    () => ({
      gallery: galleryCategories,
      video: videoCategories,
      venue: venueCategories,
      time: timeCategories,
      ageGroup: ageGroupCategories,
      news: newsCategories,
    }),
    [
      galleryCategories,
      videoCategories,
      venueCategories,
      timeCategories,
      ageGroupCategories,
      newsCategories,
    ]
  );

  // Loading map
  const domainLoadingMap: Record<CategoryDomainKey, boolean> = {
    gallery: isGalleryLoading,
    video: isVideoLoading,
    venue: isVenueLoading,
    time: isTimeLoading,
    ageGroup: isAgeGroupLoading,
    news: isNewsLoading,
  };

  // Modal Control States
  const [modalTargetDomain, setModalTargetDomain] =
    useState<CategoryDomainKey>("gallery");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TCategory | null>(
    null
  );
  const [parentCategoryIdForSub, setParentCategoryIdForSub] = useState<
    string | null
  >(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    isSub: boolean;
    domain: CategoryDomainKey;
  } | null>(null);



  // Open Modal Handlers
  const handleOpenAddCategoryModal = (domainKey: CategoryDomainKey) => {
    setModalTargetDomain(domainKey);
    setEditingCategory(null);
    setParentCategoryIdForSub(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenAddSubCategoryModal = (
    domainKey: CategoryDomainKey,
    parentId: string
  ) => {
    setModalTargetDomain(domainKey);
    setEditingCategory(null);
    setParentCategoryIdForSub(parentId);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategoryModal = (
    domainKey: CategoryDomainKey,
    cat: TCategory
  ) => {
    setModalTargetDomain(domainKey);
    setEditingCategory(cat);
    setParentCategoryIdForSub(null);
    setIsCategoryModalOpen(true);
  };

  // Submit Modal Action
  const handleCategoryModalSubmit = async (data: {
    name: string;
    order?: number;
    parentCategory?: string | null;
    id?: string;
  }) => {
    try {
      const isSub = Boolean(data.parentCategory);
      const isEdit = Boolean(data.id);

      const catBody: any = { name: data.name };
      if (data.order !== undefined && !isNaN(data.order)) {
        catBody.order = data.order;
      }

      const subBody: any = {
        name: data.name,
        parentCategory: data.parentCategory!,
      };

      if (modalTargetDomain === "gallery") {
        if (isEdit) {
          if (isSub) {
            const res = await updateGallerySubCategory({
              id: data.id!,
              data: subBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Subcategory updated");
          } else {
            const res = await updateGalleryCategory({
              id: data.id!,
              data: catBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Category updated");
          }
        } else if (isSub) {
          const res = await createGallerySubCategory(subBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Subcategory created");
        } else {
          const res = await createGalleryCategory(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Category created");
        }
      } else if (modalTargetDomain === "video") {
        if (isEdit) {
          if (isSub) {
            const res = await updateVideoSubCategory({
              id: data.id!,
              data: subBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Subcategory updated");
          } else {
            const res = await updateVideoCategory({
              id: data.id!,
              data: catBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Category updated");
          }
        } else if (isSub) {
          const res = await createVideoSubCategory(subBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Subcategory created");
        } else {
          const res = await createVideoCategory(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Category created");
        }
      } else if (modalTargetDomain === "venue") {
        if (isEdit) {
          if (isSub) {
            const res = await updateVenueSubCategory({
              id: data.id!,
              data: subBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Subcategory updated");
          } else {
            const res = await updateVenueCategory({
              id: data.id!,
              data: catBody,
            }).unwrap();
            if (res.success !== false) toast.success(res.message || "Category updated");
          }
        } else if (isSub) {
          const res = await createVenueSubCategory(subBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Subcategory created");
        } else {
          const res = await createVenueCategory(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Category created");
        }
      } else if (modalTargetDomain === "time") {
        if (isEdit) {
          const res = await updatePlayTime({
            id: data.id!,
            data: catBody,
          }).unwrap();
          if (res.success !== false) toast.success(res.message || "Time category updated");
        } else {
          const res = await createPlayTime(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Time category created");
        }
      } else if (modalTargetDomain === "ageGroup") {
        if (isEdit) {
          const res = await updateAgeGroup({
            id: data.id!,
            data: catBody,
          }).unwrap();
          if (res.success !== false) toast.success(res.message || "Age group updated");
        } else {
          const res = await createAgeGroup(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "Age group created");
        }
      } else if (modalTargetDomain === "news") {
        if (isEdit) {
          const res = await updateNewsCategory({
            id: data.id!,
            data: catBody,
          }).unwrap();
          if (res.success !== false) toast.success(res.message || "News category updated");
        } else {
          const res = await createNewsCategory(catBody).unwrap();
          if (res.success !== false) toast.success(res.message || "News category created");
        }
      }

      setIsCategoryModalOpen(false);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Operation failed"));
    }
  };

  // Delete Action Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { id, isSub, domain } = deleteTarget;

      if (domain === "gallery") {
        if (isSub) await deleteGallerySubCategory(id).unwrap();
        else await deleteGalleryCategory(id).unwrap();
      } else if (domain === "video") {
        if (isSub) await deleteVideoSubCategory(id).unwrap();
        else await deleteVideoCategory(id).unwrap();
      } else if (domain === "venue") {
        if (isSub) await deleteVenueSubCategory(id).unwrap();
        else await deleteVenueCategory(id).unwrap();
      } else if (domain === "time") {
        await deletePlayTime(id).unwrap();
      } else if (domain === "ageGroup") {
        await deleteAgeGroup(id).unwrap();
      } else if (domain === "news") {
        await deleteNewsCategory(id).unwrap();
      }

      toast.success(
        `${isSub ? "Subcategory" : "Category"} deleted successfully!`
      );
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete category"));
    } finally {
      setDeleteTarget(null);
    }
  };

  // Active domains to display based on activeTab
  const activeDomainsToRender = useMemo(() => {
    if (activeTab === "all") return DOMAIN_CONFIGS;
    return DOMAIN_CONFIGS.filter((cfg) => cfg.key === activeTab);
  }, [activeTab]);

  // Is any mutation loading
  const isAnyMutationLoading =
    isCreatingGalleryCat ||
    isCreatingGallerySub ||
    isUpdatingGalleryCat ||
    isUpdatingGallerySub ||
    isDeletingGalleryCat ||
    isDeletingGallerySub ||
    isCreatingVideoCat ||
    isCreatingVideoSub ||
    isUpdatingVideoCat ||
    isUpdatingVideoSub ||
    isDeletingVideoCat ||
    isDeletingVideoSub ||
    isCreatingVenueCat ||
    isCreatingVenueSub ||
    isUpdatingVenueCat ||
    isUpdatingVenueSub ||
    isDeletingVenueCat ||
    isDeletingVenueSub ||
    isCreatingTimeCat ||
    isUpdatingTimeCat ||
    isDeletingTimeCat ||
    isCreatingAgeGroupCat ||
    isUpdatingAgeGroupCat ||
    isDeletingAgeGroupCat ||
    isCreatingNewsCat ||
    isUpdatingNewsCat ||
    isDeletingNewsCat;

  const currentDomainConfig = DOMAIN_CONFIGS.find(
    (cfg) => cfg.key === modalTargetDomain
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 bg-gray-50/40 min-h-screen">
      {/* Executive Header Banner */}
      <div className="bg-white p-6 md:p-7 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-black to-gray-800 text-white flex items-center justify-center shadow-md">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 tracking-tight">
              Category Management
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Centralized administration for Gallery, ENG TV, Venue, Time, and Age Group categories
            </p>
          </div>
        </div>
      </div>



      {/* Module Selector Navigation Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === "all"
            ? "bg-black text-white shadow-sm"
            : "text-gray-600 hover:bg-gray-100"
            }`}
        >
          <Layers className="w-4 h-4" />
          <span>
            All Overview (
            {Object.values(domainDataMap).reduce(
              (acc, list) => acc + (list?.length || 0),
              0
            )}
            )
          </span>
        </button>

        {DOMAIN_CONFIGS.map((cfg) => {
          const Icon = cfg.icon;
          const isActive = activeTab === cfg.key;
          const catCount = (domainDataMap[cfg.key] || []).length;

          return (
            <button
              key={cfg.key}
              type="button"
              onClick={() => setActiveTab(cfg.key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer shrink-0 ${isActive
                ? "bg-black text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-white" : cfg.color.text}`} />
              <span>{cfg.badgeLabel} ({catCount})</span>
            </button>
          );
        })}
      </div>

      {/* Domain Category Grid Sections */}
      <div className="space-y-10">
        {activeDomainsToRender.map((config) => {
          const rawCategories = domainDataMap[config.key] || [];
          const isLoading = domainLoadingMap[config.key];
          const Icon = config.icon;

          const filteredCategories = rawCategories;

          return (
            <div key={config.key} className="space-y-5">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${config.color.bg} ${config.color.text} flex items-center justify-center font-medium shrink-0`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <span>{config.label}</span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.color.badgeBg}`}>
                        {filteredCategories.length} Categories
                      </span>
                    </h2>
                    <p className="text-xs text-gray-500">
                      {config.allowSubcategory
                        ? "Supports parent categories and nested subcategories"
                        : "Direct single-tier categories"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAddCategoryModal(config.key)}
                  className={`px-3.5 py-1.5 rounded-xl border ${config.color.border} ${config.color.bg} ${config.color.text} hover:opacity-80 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add {config.badgeLabel} Category</span>
                </button>
              </div>

              {/* 4-Grid Style Cards Section */}
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />
                  <p className="text-xs font-semibold text-gray-500">
                    Loading {config.label}...
                  </p>
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center flex flex-col items-center justify-center gap-2">
                  <div className={`w-10 h-10 rounded-full ${config.color.bg} ${config.color.text} flex items-center justify-center`}>
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-medium text-gray-800">
                    No Categories Found in {config.badgeLabel}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Click below to create your first {config.badgeLabel} category.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenAddCategoryModal(config.key)}
                    className="mt-2 px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    + Add Category
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredCategories.map((cat) => {
                    const catId = cat._id || cat.id || "";
                    const subCats: TSubCategory[] = cat.subCategories || [];

                    return (
                      <div
                        key={catId}
                        className={`bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden`}
                      >
                        {/* Top Decorative Indicator */}
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 ${config.color.bg}`}
                        />

                        {/* Category Card Header */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-9 h-9 rounded-xl ${config.color.bg} ${config.color.text} flex items-center justify-center font-medium shrink-0`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-medium text-gray-900 text-sm leading-snug truncate flex items-center gap-1.5">
                                  <span>{cat.name}</span>
                                  {cat.order !== undefined && cat.order !== null && (
                                    <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-bold border border-blue-100">
                                      Order: {cat.order}
                                    </span>
                                  )}
                                </h3>
                                {cat.slug && (
                                  <div className="mt-0.5">
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-mono truncate max-w-[120px] inline-block">
                                      /{cat.slug}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Category Actions */}
                            <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenEditCategoryModal(config.key, cat)
                                }
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="Edit Category"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: catId,
                                    name: cat.name,
                                    isSub: false,
                                    domain: config.key,
                                  })
                                }
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete Category"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Subcategories Section (Only if supported by domain) */}
                        {config.allowSubcategory && (
                          <div className="space-y-2 pt-3 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                <GitBranch className="w-3 h-3 text-purple-500" />
                                Subcategories ({subCats.length})
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenAddSubCategoryModal(
                                    config.key,
                                    catId
                                  )
                                }
                                className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                              >
                                + Add Sub
                              </button>
                            </div>

                            {subCats.length === 0 ? (
                              <p className="text-[11px] text-gray-400 italic bg-gray-50/80 p-2 rounded-xl text-center">
                                No subcategories
                              </p>
                            ) : (
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {subCats.map((sub) => {
                                  const subId = sub._id || sub.id || "";
                                  return (
                                    <div
                                      key={subId}
                                      className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 transition-colors group/sub"
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                        <span className="text-xs font-medium text-gray-700 truncate">
                                          {sub.name}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover/sub:opacity-100 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            handleOpenEditCategoryModal(
                                              config.key,
                                              sub as unknown as TCategory
                                            )
                                          }
                                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                          title="Edit Subcategory"
                                        >
                                          <FiEdit className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setDeleteTarget({
                                              id: subId,
                                              name: sub.name,
                                              isSub: true,
                                              domain: config.key,
                                            })
                                          }
                                          className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                          title="Delete Subcategory"
                                        >
                                          <FiTrash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Universal Category & Subcategory Creation / Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleCategoryModalSubmit}
        categories={domainDataMap[modalTargetDomain] || []}
        editingCategory={editingCategory}
        parentCategoryIdForSub={parentCategoryIdForSub}
        isLoading={isAnyMutationLoading}
        allowSubcategory={currentDomainConfig?.allowSubcategory ?? true}
        domainName={currentDomainConfig?.badgeLabel || "Category"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.isSub ? "Subcategory" : "Category"
          }`}
        description={`Are you sure you want to delete "${deleteTarget?.name}" from ${DOMAIN_CONFIGS.find((c) => c.key === deleteTarget?.domain)?.label ||
          "Category"
          }? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />
    </div>
  );
}
