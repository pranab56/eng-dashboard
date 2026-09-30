/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Tv,
  Plus,
  Search,
  X,
  CheckCircle2,
  Clock,
  Star,
  GripVertical,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteVideoMutation,
  useGetAllVideoQuery,
  useRearrangeVideosMutation,
  useGetVideoAnalyticsQuery,
} from "@/features/engTVManagement/engApi";
import { useGetAllVideoCategoryQuery } from "@/features/categoryManagement/categoryApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getEngtvColumns } from "@/tableColumns/engtvColumns";
import { TEngtv } from "@/types/columnTypes";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import EngTvViewModal from "./EngTvViewModal";

type FilterTab = "all" | "publish" | "draft" | "highlight";

const EngtvManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("userPage") || "1";

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: videoData, isLoading } = useGetAllVideoQuery({
    page,
    category: selectedCategory,
  });
  const { data: analyticsData } = useGetVideoAnalyticsQuery(undefined);
  const { data: categoriesData } = useGetAllVideoCategoryQuery({});

  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();
  const [rearrangeVideos] = useRearrangeVideosMutation();

  const [localVideos, setLocalVideos] = useState<TEngtv[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TEngtv | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "ENG TV Management",
      des: "Manage video content, channel categories, and broadcast schedules.",
    });
  }, [setHeaders]);

  useEffect(() => {
    if (videoData?.data) {
      setLocalVideos(videoData.data);
    }
  }, [videoData]);

  // Compute statistics directly from backend DB aggregation
  const videoAnalytics = analyticsData?.data;
  const totalCount = videoAnalytics?.total ?? (videoData?.pagination?.total || localVideos.length);
  const publishedCount = videoAnalytics?.published ?? 0;
  const highlightsCount = videoAnalytics?.highlights ?? 0;
  const draftsCount = videoAnalytics?.drafts ?? 0;

  // Filtered list based on search and tab
  const displayedVideos = useMemo(() => {
    return localVideos.filter((video) => {
      // Tab filter
      if (activeTab === "publish" && video.status?.toLowerCase() !== "publish") {
        return false;
      }
      if (activeTab === "draft" && video.status?.toLowerCase() !== "draft") {
        return false;
      }
      if (activeTab === "highlight" && !video.isHighlight) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const titleMatch = video.title?.toLowerCase().includes(q);
        const catVal = video.category as any;
        const catName =
          typeof catVal === "object" && catVal
            ? catVal.name
            : typeof catVal === "string"
            ? catVal
            : "";
        const catMatch = catName.toLowerCase().includes(q);
        return titleMatch || catMatch;
      }

      return true;
    });
  }, [localVideos, activeTab, searchTerm]);

  const handleDragEnd = async (startIndex: number, endIndex: number) => {
    const updatedVideos = [...localVideos];
    const [removed] = updatedVideos.splice(startIndex, 1);
    updatedVideos.splice(endIndex, 0, removed);

    setLocalVideos(updatedVideos);

    const limit = videoData?.pagination?.limit || 10;
    const pageNum = Number(page) || 1;
    const offset = (pageNum - 1) * limit;

    const reorderedPayload = updatedVideos.map((video, index) => ({
      id: video._id,
      order: offset + index + 1,
      isHighlight: !!video.isHighlight,
    }));

    try {
      await rearrangeVideos({ videos: reorderedPayload }).unwrap();
      toast.success("Broadcast order updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to rearrange videos");
      if (videoData?.data) {
        setLocalVideos(videoData.data);
      }
    }
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteVideo(deletingId).unwrap();
      toast.success("Video deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete video");
    }
  };

  const handleView = (video: TEngtv) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const columns = getEngtvColumns(handleView, handleDelete);

  return (
    <div className="pt-6 px-6 sm:px-8 space-y-6 max-w-[1600px] mx-auto">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Videos */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Videos
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Tv className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mt-2">
            {totalCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across all categories
          </span>
        </div>

        {/* Published */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Published
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
            {publishedCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Publicly accessible
          </span>
        </div>

        {/* Highlights */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Featured Highlights
            </span>
            <div className="w-8 h-8 rounded-md bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-amber-600 dark:text-amber-400 mt-2">
            {highlightsCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pinned to top priority
          </span>
        </div>

        {/* Drafts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mt-2">
            {draftsCount}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Unpublished / In review
          </span>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search & Category Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[220px] max-w-sm flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or category..."
              className="w-full h-9 pl-9 pr-8 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="min-w-[180px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
            >
              <option value="">All Categories</option>
              {categoriesData?.data?.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "all"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publish")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "publish"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("draft")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "draft"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Drafts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("highlight")}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                activeTab === "highlight"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Highlights
            </button>
          </div>
        </div>

        {/* Right: Add Action */}
        <Link href="/engtv-management/create-video">
          <button
            type="button"
            className="h-9 px-3.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Video</span>
          </button>
        </Link>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col">
        {/* Table Subheader */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Video Registry ({displayedVideos.length} shown)
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <GripVertical className="w-3.5 h-3.5 text-slate-400" />
            Drag rows to reorder broadcast priority
          </span>
        </div>

        <div className="p-4 flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-48 text-xs text-slate-500">
              Loading broadcast videos...
            </div>
          ) : displayedVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tv className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-1" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                No videos found
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Try adjusting your search terms or category filter.
              </p>
            </div>
          ) : (
            <CustomTable<TEngtv>
              columns={columns}
              data={displayedVideos}
              isSortable={true}
              onDragEnd={handleDragEnd}
            />
          )}
        </div>

        {/* Pagination Container */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <CustomPagination
            TOTAL_PAGES={videoData?.pagination?.totalPage || 1}
            qryName="userPage"
          />
        </div>
      </div>

      {/* View Modal */}
      <EngTvViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        video={selectedVideo}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Video Deletion"
        description="Are you sure you want to remove this video from ENG TV? This action is permanent and cannot be reversed."
      />
    </div>
  );
};

export default EngtvManagement;
