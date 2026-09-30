/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  Plus,
  Newspaper,
  CheckCircle2,
  Clock,
  FileText,
  RotateCcw,
  MoveVertical,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteNewsMutation,
  useGetAllNewsQuery,
  useGetNewsAnalyticsQuery,
  useRearrangeNewsMutation,
} from "@/features/news/newsApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getNewsColumns } from "@/tableColumns/newsColumns";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import NewsViewModal from "./NewsViewModal";

type StatusTab = "all" | "publish" | "schedule" | "draft";

const NewsManagement = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = searchParams.get("newsPage") || "1";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusTab>("all");

  // 1. Backend-calculated analytics (accurate across all pages)
  const { data: analyticsData } = useGetNewsAnalyticsQuery(undefined);
  const backendStats = analyticsData?.data || {
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
  };

  // 2. Server-side paginated & filtered news query
  const { data: newsData, isLoading } = useGetAllNewsQuery({
    page: page,
    searchValue: searchTerm,
    status: statusFilter === "all" ? "" : statusFilter,
  });

  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();
  const [rearrangeNews] = useRearrangeNewsMutation();

  const [localNews, setLocalNews] = useState<any[]>([]);
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "News Management",
      des: "Distribute official club updates, announcements, and press releases across the digital network.",
    });
  }, []);

  // Sync local news state for drag-and-drop reordering
  useEffect(() => {
    const raw = Array.isArray(newsData?.data)
      ? newsData.data
      : Array.isArray(newsData?.data?.result)
      ? newsData.data.result
      : [];
    setLocalNews(raw);
  }, [newsData]);

  const handleTabChange = (tab: StatusTab) => {
    setStatusFilter(tab);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("newsPage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("newsPage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    if (page !== "1") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("newsPage", "1");
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  const handleDragEnd = async (startIndex: number, endIndex: number) => {
    const updatedNews = [...localNews];
    const [removed] = updatedNews.splice(startIndex, 1);
    updatedNews.splice(endIndex, 0, removed);

    setLocalNews(updatedNews);

    const limit = newsData?.pagination?.limit || 10;
    const pageNum = Number(page) || 1;
    const offset = (pageNum - 1) * limit;

    const reorderedPayload = updatedNews.map(
      (article: any, index: number) => ({
        id: article._id,
        order: offset + index + 1,
      })
    );

    try {
      await rearrangeNews({ news: reorderedPayload }).unwrap();
      toast.success("News articles reordered successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reorder news articles");
      if (newsData?.data) {
        setLocalNews(
          Array.isArray(newsData.data)
            ? newsData.data
            : newsData.data.result || []
        );
      }
    }
  };

  const handleView = (news: any) => {
    setSelectedNews(news);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteNews(deletingId).unwrap();
      if (res?.success || res?.statusCode === 200) {
        toast.success(res?.message || "News article deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete news article");
    }
  };

  const hasActiveFilters =
    statusFilter !== "all" || searchTerm.trim().length > 0;
  const isSortableEnabled = statusFilter === "all" && !searchTerm.trim();
  const totalPages = newsData?.pagination?.totalPage || 1;

  const totalCountForCurrentView =
    statusFilter === "all"
      ? backendStats.total
      : statusFilter === "publish"
      ? backendStats.published
      : statusFilter === "schedule"
      ? backendStats.scheduled
      : backendStats.draft;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto">
      {/* 1. Executive Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Articles */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Articles
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {backendStats.total}
            </span>
            <span className="text-xs text-slate-400">records</span>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Published
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {backendStats.published}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>

        {/* Scheduled */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Scheduled
            </span>
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-700 tabular-nums">
              {backendStats.scheduled}
            </span>
            <span className="text-xs text-slate-400">queued</span>
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Drafts
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-700 tabular-nums">
              {backendStats.draft}
            </span>
            <span className="text-xs text-slate-400">unpublished</span>
          </div>
        </div>
      </div>

      {/* 2. Main Editorial Registry Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* Integrated Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "all"
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span>All Articles</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "all"
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.total}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("publish")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "publish"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Published</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "publish"
                    ? "bg-emerald-800 text-emerald-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.published}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("schedule")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "schedule"
                  ? "bg-blue-700 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Scheduled</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "schedule"
                    ? "bg-blue-800 text-blue-100"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.scheduled}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange("draft")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                statusFilter === "draft"
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Drafts</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                  statusFilter === "draft"
                    ? "bg-slate-700 text-slate-200"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {backendStats.draft}
              </span>
            </button>
          </div>

          {/* Search Input + Action Button */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search headline, content..."
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50/60 border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Clear search"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <Link
              href="/news-management/create-news"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md hover:bg-slate-800 active:scale-98 transition-all text-xs font-semibold shadow-2xs border border-slate-900 cursor-pointer shrink-0 select-none"
            >
              <Plus className="w-3.5 h-3.5 text-slate-300" />
              <span>Create Article</span>
            </Link>
          </div>
        </div>

        {/* Active Filter Hint */}
        {hasActiveFilters && (
          <div className="px-5 py-2 bg-slate-50/60 border-b border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-700">Active filter:</span>
              {statusFilter !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium capitalize">
                  Status: {statusFilter}
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                  Search: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
              <span className="text-slate-400">
                ({newsData?.pagination?.total ?? localNews.length} total matching)
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 text-[11px] font-medium cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Drag Reorder Helper Notice */}
        {isSortableEnabled && localNews.length > 1 && (
          <div className="px-5 py-2 bg-slate-50/30 border-b border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <MoveVertical className="w-3 h-3 text-slate-400 shrink-0" />
            <span>
              Drag rows using the left handle to customize the public article
              display priority.
            </span>
          </div>
        )}

        {/* Table View */}
        <div className="overflow-x-auto">
          <CustomTable<any>
            columns={getNewsColumns(handleView, handleDelete)}
            data={localNews}
            isLoading={isLoading}
            isSortable={isSortableEnabled}
            onDragEnd={handleDragEnd}
          />
        </div>

        {/* Empty State */}
        {!isLoading && localNews.length === 0 && (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Newspaper className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No news articles found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? "No articles match your selected filters or search query. Try resetting filters."
                : "No news articles have been created yet. Click 'Create Article' to write your first press release."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            ) : (
              <Link
                href="/news-management/create-news"
                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-300" />
                <span>Create First Article</span>
              </Link>
            )}
          </div>
        )}

        {/* Integrated Pagination Footer */}
        <div className="px-5 py-3.5 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/40">
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-800">{localNews.length}</span>{" "}
            on this page of{" "}
            <span className="font-semibold text-slate-800">
              {newsData?.pagination?.total ?? totalCountForCurrentView}
            </span>{" "}
            total {statusFilter !== "all" ? `${statusFilter} ` : ""}articles
          </div>
          <CustomPagination TOTAL_PAGES={totalPages} qryName="newsPage" />
        </div>
      </div>

      {/* View Modal */}
      <NewsViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        news={selectedNews}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete News Article"
        description="Are you sure you want to permanently delete this news article? This action cannot be undone and the article will be removed from all public media feeds."
      />
    </div>
  );
};

export default NewsManagement;
