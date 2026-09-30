"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { baseURL } from "@/utils/BaseURL";
import { formatImagePath } from "@/utils/formatImagePath";
import { getYouTubeEmbedUrl } from "@/utils/getYouTubeEmbedUrl";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  X,
  Tv,
  Calendar,
  Clock,
  Tag,
  Star,
  Film,
  Hash,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { TEngtv } from "@/types/columnTypes";

dayjs.extend(relativeTime);

interface EngTvViewModalProps {
  video: TEngtv | null;
  isOpen: boolean;
  onClose: () => void;
}

const EngTvViewModal: React.FC<EngTvViewModalProps> = ({
  video,
  isOpen,
  onClose,
}) => {
  if (!video) return null;

  const catVal = video.category as any;
  const catName =
    typeof catVal === "object" && catVal
      ? catVal.name
      : typeof catVal === "string"
      ? catVal
      : "";

  const subVal = (video as any).subCategory;
  const subName =
    typeof subVal === "object" && subVal
      ? subVal.name
      : typeof subVal === "string"
      ? subVal
      : "";

  const youtubeEmbed = getYouTubeEmbedUrl(video.videoUrl);
  const posterUrl = video.thumbnail ? formatImagePath(video.thumbnail) : "";

  const videoSrc = video.videoUrl
    ? video.videoUrl.startsWith("http")
      ? video.videoUrl
      : baseURL + video.videoUrl
    : "";

  const isPublished = video.status?.toLowerCase() === "publish";
  const isDraft = video.status?.toLowerCase() === "draft";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-2xl bg-white dark:bg-slate-900 rounded-lg p-0 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-row items-center justify-between space-y-0 text-left">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-md bg-slate-200 dark:bg-slate-700/60 flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-200">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ENG TV
                </span>

                {catName && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {catName}
                  </span>
                )}

                {subName && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {subName}
                  </span>
                )}

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : isDraft
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                  }`}
                >
                  {video.status || "Draft"}
                </span>

                {video.isHighlight && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    Highlight
                  </span>
                )}
              </div>

              <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {video.title}
              </DialogTitle>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </DialogHeader>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
          {/* Video Stream Container */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 relative">
            {youtubeEmbed ? (
              <iframe
                src={youtubeEmbed}
                title={video.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : videoSrc ? (
              <video
                src={videoSrc}
                poster={posterUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Film className="w-8 h-8 stroke-1 text-slate-400" />
                <span className="text-xs">No video stream URL provided</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          {video.description && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Description & Synopsis
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Created Date
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {video.createdAt
                    ? dayjs(video.createdAt).format("DD MMM YYYY, h:mm A")
                    : "N/A"}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Publish Schedule
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {video.publishDateTime
                    ? dayjs(video.publishDateTime).format("DD MMM YYYY, h:mm A")
                    : "Immediate"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-slate-400" /> Category
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {catName || "General Broadcast"}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-slate-400" /> Display Order
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {typeof video.order === "number" ? video.order : 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            ID: {video._id}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EngTvViewModal;
