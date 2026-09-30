"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  MapPin,
  Calendar,
  Clock,
  X,
  CalendarDays,
  Send,
  Image as ImageIcon,
} from "lucide-react";

dayjs.extend(relativeTime);

interface EventViewModalProps {
  event: any;
  isOpen: boolean;
  onClose: () => void;
}

const EventViewModal: React.FC<EventViewModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  const isPublished = event.status?.toLowerCase() === "publish";
  const isDraft = event.status?.toLowerCase() === "draft";

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
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2 py-0.5 rounded text-[11px] font-medium tracking-wide uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Event
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase border ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                      : isDraft
                      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                  }`}
                >
                  {event.status || "Draft"}
                </span>
              </div>

              <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate">
                {event.title}
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
          {/* Cover Media Section */}
          <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            {event.image ? (
              <Image
                src={formatImagePath(event.image)}
                alt="event cover"
                fill
                quality={90}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 space-y-1">
                <ImageIcon className="w-8 h-8 stroke-1" />
                <span className="text-xs">No cover image attached</span>
              </div>
            )}
          </div>

          {/* Description Section */}
          {event.description && (
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Event Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location / Venue
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 text-right truncate max-w-[200px]">
                  {event.location || "N/A"}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Event Date
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {event.eventDate
                    ? dayjs(event.eventDate).format("DD MMM YYYY, h:mm A")
                    : "N/A"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-slate-400" /> Publish Release
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {event.publishDateTime
                    ? dayjs(event.publishDateTime).format("DD MMM YYYY, h:mm A")
                    : "Immediate"}
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Relative Time
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {event.eventDate ? dayjs(event.eventDate).fromNow() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono text-[11px]">
            ID: {event._id}
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

export default EventViewModal;
