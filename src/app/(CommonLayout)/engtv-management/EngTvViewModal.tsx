/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { TEngtv } from '@/types/columnTypes';
import { getYouTubeEmbedUrl } from '@/utils/getYouTubeEmbedUrl';
import { baseURL } from '@/utils/BaseURL';
import {
  X,
  Tv,
  Calendar,
  Clock,
  Tag,
  Sparkles,
  Film,
  CheckCircle2,
} from 'lucide-react';

dayjs.extend(relativeTime);

interface EngTvViewModalProps {
  video: TEngtv | null;
  isOpen: boolean;
  onClose: () => void;
}

const EngTvViewModal: React.FC<EngTvViewModalProps> = ({ video, isOpen, onClose }) => {
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

  const isPublished = (video.status || '').toLowerCase() === 'publish' || (video.status || '').toLowerCase() === 'published';

  const posterUrl = video.thumbnail
    ? video.thumbnail.startsWith('http')
      ? video.thumbnail
      : baseURL + video.thumbnail
    : undefined;

  const youtubeEmbed = video.videoUrl ? getYouTubeEmbedUrl(video.videoUrl) : null;
  const videoSrc = video.videoUrl
    ? video.videoUrl.startsWith('http')
      ? video.videoUrl
      : baseURL + video.videoUrl
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl max-h-[92vh] flex flex-col">
        {/* Clean Light Header Banner (Matches User Management Style) */}
        <DialogHeader className="bg-slate-50/80 p-5 sm:p-6 border-b border-slate-100 relative text-left">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all cursor-pointer z-30"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {/* Header TV Icon Box */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 overflow-hidden flex items-center justify-center shrink-0 shadow-xs text-red-600">
              <Tv className="w-6 h-6" />
            </div>

            <div className="flex-1 pr-6 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                  ENG TV Network
                </span>

                {catName && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {catName}
                  </span>
                )}

                {subName && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                    {subName}
                  </span>
                )}

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${
                  isPublished
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {video.status || 'Draft'}
                </span>
              </div>

              <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 mt-1 truncate">
                {video.title}
              </DialogTitle>

              <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-2">
                <span>Created {video.createdAt ? dayjs(video.createdAt).format('MMM DD, YYYY') : 'N/A'}</span>
                {video.publishDateTime && (
                  <>
                    <span>•</span>
                    <span>Scheduled {dayjs(video.publishDateTime).fromNow()}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body Container */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-slate-800">
          {/* Video Stream Container */}
          <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden shadow-md border border-slate-800 relative group">
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
                <Film className="w-10 h-10 stroke-1" />
                <span className="text-xs font-medium">No video stream URL provided</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <Sparkles className="w-4 h-4 text-red-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Video Overview & Synopsis
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {video.description || 'No video description provided.'}
            </p>
          </div>

          {/* Broadcast & Channel Specifications */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
              <Film className="w-4 h-4 text-red-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Broadcast & Channel Details
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-red-500" /> Created Date
                </span>
                <p className="font-bold text-slate-800">
                  {video.createdAt ? dayjs(video.createdAt).format("DD MMMM YYYY, h:mm A") : "N/A"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-red-500" /> Publish Date
                </span>
                <p className="font-bold text-slate-800">
                  {video.publishDateTime ? dayjs(video.publishDateTime).format("DD MMMM YYYY, h:mm A") : "Immediate Publication"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-red-500" /> Primary Category
                </span>
                <p className="font-bold text-slate-800">
                  {catName || "General Broadcast"}
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200/60 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5 text-red-500" /> Network Channel
                </span>
                <p className="font-bold text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ENG Official TV Stream
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Matches User Management Style) */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <Tv className="w-3.5 h-3.5 text-slate-400" /> Official ENG Broadcast
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EngTvViewModal;
