/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { formatImagePath } from '@/utils/formatImagePath';
import { X, Calendar, Newspaper, Clock } from 'lucide-react';

dayjs.extend(relativeTime);

interface NewsViewModalProps {
  news: any;
  isOpen: boolean;
  onClose: () => void;
}

const NewsViewModal = ({ news, isOpen, onClose }: NewsViewModalProps) => {
  if (!news) return null;

  const categoryName = (() => {
    const catVal = news.category;
    const rawName =
      typeof catVal === "object" && catVal
        ? catVal.name
        : typeof catVal === "string"
          ? catVal
          : "";
    const isHexId = Boolean(rawName && /^[0-9a-fA-F]{24}$/.test(rawName));
    return isHexId ? null : rawName;
  })();

  const isPublished = (news.status || '').toLowerCase() === 'publish' || (news.status || '').toLowerCase() === 'published';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-2xl bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Cover Image Header */}
        <div className="relative h-64 w-full bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer z-20 backdrop-blur-md border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>

          {news.image ? (
            <Image src={formatImagePath(news.image)} alt="news cover" fill quality={100} className="object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
              <Newspaper className="w-10 h-10 text-slate-500" />
              <span className="text-xs font-medium . tracking-widest text-slate-400">No Image Provided</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Title & Category Badges */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              {categoryName && (
                <span className="px-3 py-0.5 bg-blue-600/90 text-white rounded-full text-[10px] font-extrabold . tracking-widest backdrop-blur-md shadow-sm border border-blue-400/30">
                  {categoryName}
                </span>
              )}
              <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold . tracking-widest border backdrop-blur-md shadow-sm ${isPublished ? 'bg-emerald-500/90 text-white border-emerald-400/30' : 'bg-amber-500/90 text-white border-amber-400/30'
                }`}>
                {news.status || 'Draft'}
              </span>
            </div>

            <DialogTitle className="text-2xl font-black text-white leading-snug tracking-tight">
              {news.title}
            </DialogTitle>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Article Body */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-extrabold text-blue-600 . tracking-widest flex items-center gap-1.5">
              <Newspaper className="w-3.5 h-3.5" /> Article Overview
            </h4>
            <div
              className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100/80 text-sm font-medium text-gray-700 leading-relaxed max-h-60 overflow-y-auto prose max-w-none"
              dangerouslySetInnerHTML={{ __html: news.description || 'No article content provided.' }}
            />
          </div>

          {/* Metadata Footer */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-md">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span>Published: {news.publishDateTime ? dayjs(news.publishDateTime).format("DD MMMM YYYY") : "N/A"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 . tracking-wider">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{news.publishDateTime ? dayjs(news.publishDateTime).fromNow() : ""}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsViewModal;
