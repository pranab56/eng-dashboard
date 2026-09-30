/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  X,
  Newspaper,
  Tag,
  Globe,
  Copy,
  Check,
  BookOpen,
} from "lucide-react";
import { FiEdit } from "react-icons/fi";
import { toast } from "sonner";
import { formatImagePath } from "@/utils/formatImagePath";

dayjs.extend(relativeTime);

interface NewsViewModalProps {
  news: any;
  isOpen: boolean;
  onClose: () => void;
}

const NewsViewModal: React.FC<NewsViewModalProps> = ({
  news,
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  if (!news) return null;

  const rawStatus = (news.status || "").toLowerCase();
  const isPublished = rawStatus === "publish" || rawStatus === "published";
  const isScheduled = rawStatus === "schedule" || rawStatus === "scheduled";

  let statusBadge = {
    label: "Draft",
    dot: "bg-slate-400",
    classes: "bg-slate-100 text-slate-700 border-slate-200",
  };
  if (isPublished) {
    statusBadge = {
      label: "Published",
      dot: "bg-emerald-500",
      classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  } else if (isScheduled) {
    statusBadge = {
      label: "Scheduled",
      dot: "bg-blue-500",
      classes: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  const categoryName = (() => {
    if (!news.category) return null;
    if (typeof news.category === "object" && news.category?.name) {
      return news.category.name;
    }
    if (typeof news.category === "string") {
      if (/^[0-9a-fA-F]{24}$/.test(news.category)) return null;
      return news.category;
    }
    return null;
  })();

  const readTime = (() => {
    const text = (news.description || "").replace(/<[^>]*>/g, "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  })();

  const handleCopyId = () => {
    if (!news._id) return;
    navigator.clipboard.writeText(news._id);
    setCopiedId(true);
    toast.success("Article ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white rounded-lg p-0 overflow-hidden border border-slate-200 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Clean Enterprise Header */}
        <DialogHeader className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 text-left relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 flex-wrap pr-8">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
              {statusBadge.label}
            </span>

            {categoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <Tag className="w-3 h-3 text-slate-400" />
                {categoryName}
              </span>
            )}

            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <BookOpen className="w-3 h-3 text-slate-400" />
              {readTime}
            </span>
          </div>

          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 mt-2 line-clamp-2">
            {news.title}
          </DialogTitle>

          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>
              {news.publishDateTime
                ? `Published ${dayjs(news.publishDateTime).format("DD MMM, YYYY · hh:mm A")}`
                : "Draft / Unscheduled"}
            </span>
          </p>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar text-slate-800">
          {/* Cover Media */}
          {news.image && (
            <div className="relative w-full h-48 sm:h-56 rounded-md overflow-hidden border border-slate-200 bg-slate-900">
              <Image
                src={formatImagePath(news.image)}
                alt={news.title || "Cover"}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Article Text Content */}
          <div className="bg-white rounded-md border border-slate-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Article Content
            </h4>
            <div
              className="text-xs sm:text-sm font-normal text-slate-700 leading-relaxed max-h-64 overflow-y-auto custom-scrollbar prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{
                __html: news.description || "<p>No content provided.</p>",
              }}
            />
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50/80 rounded-md border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Publication Date
              </span>
              <p className="font-semibold text-slate-800">
                {news.publishDateTime
                  ? dayjs(news.publishDateTime).format("DD MMM YYYY, h:mm A")
                  : "Not set"}
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-md border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Timeline Status
              </span>
              <p className="font-semibold text-slate-800">
                {news.publishDateTime
                  ? dayjs(news.publishDateTime).fromNow()
                  : "Draft mode"}
              </p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-md border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                Channel
              </span>
              <p className="font-semibold text-slate-800">ENG Official Media</p>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-md border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Newspaper className="w-3.5 h-3.5 text-slate-500" />
                Article ID
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-700 truncate mr-2">
                  {news._id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <Link
            href={`/news-management/create-news?id=${news._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <FiEdit className="w-3.5 h-3.5 text-slate-500" />
            <span>Edit Article</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsViewModal;
