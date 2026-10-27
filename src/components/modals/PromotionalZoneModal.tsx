/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { TPromotionalZone } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  X,
  Upload,
  Loader2,
  ExternalLink,
  Globe,
  Star,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";

interface PromotionalZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TPromotionalZone | null;
  isLoading: boolean;
}

export default function PromotionalZoneModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: PromotionalZoneModalProps) {
  const [title, setTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(30, "day").format("YYYY-MM-DD"));
  const [status, setStatus] = useState<"approved" | "pending" | "rejected" | "expired">("approved");
  const [isFeatured, setIsFeatured] = useState(false);

  // Media
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setTitle(editingItem.title || "");
      setWebsiteUrl(editingItem.websiteUrl || editingItem.contactInfo?.registrationLink || "");
      setDescription(editingItem.description || "");
      setStartDate(
        editingItem.startDate
          ? dayjs(editingItem.startDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
      setEndDate(
        editingItem.endDate
          ? dayjs(editingItem.endDate).format("YYYY-MM-DD")
          : dayjs().add(30, "day").format("YYYY-MM-DD")
      );
      setStatus(editingItem.status || "approved");
      setIsFeatured(Boolean(editingItem.isFeatured));

      if (editingItem.banner) {
        setBannerPreview(formatImagePath(editingItem.banner));
      } else {
        setBannerPreview(null);
      }
      setBannerFile(null);
    } else {
      // Default new ad
      setTitle("");
      setWebsiteUrl("");
      setDescription("");
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(30, "day").format("YYYY-MM-DD"));
      setStatus("approved");
      setIsFeatured(false);
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter an ad / campaign title.");
      return;
    }

    if (!websiteUrl.trim()) {
      setErrorMsg("Please enter the external website URL to redirect users when clicked.");
      return;
    }

    // Ensure valid URL prefix
    let finalUrl = websiteUrl.trim();
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }

    if (!editingItem && !bannerFile && !bannerPreview) {
      setErrorMsg("Please upload a promotional ad banner image.");
      return;
    }

    const formData = new FormData();
    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    const payload: any = {
      title: title.trim(),
      websiteUrl: finalUrl,
      externalUrl: finalUrl,
      type: "PROMOTIONAL_AD",
      description: description.trim(),
      status,
      isFeatured,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    };

    formData.append("data", JSON.stringify(payload));
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 block">
              {editingItem ? "Edit Promotional Ad" : "Create Promotional Ad"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure banner creative, destination website URL, and campaign schedule.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Ad Title */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ad / Campaign Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nike Football Boots 20% Off"
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* External Website URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">
                Destination Website URL <span className="text-rose-500">*</span>
              </label>
              {websiteUrl.trim() && (
                <a
                  href={websiteUrl.startsWith("http") ? websiteUrl : "https://" + websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  Test Destination Link
                </a>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://brand.com/special-offer"
                className="w-full h-8 pl-8 pr-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Tapping the banner in the mobile app redirects the user to this external URL.
            </p>
          </div>

          {/* Banner Upload */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Ad Banner Creative <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              {bannerPreview && (
                <div className="w-24 h-14 rounded-md overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                  <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-200 rounded-md hover:border-slate-300 bg-slate-50/50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">Click to upload ad banner</span>
                <span className="text-[10px] text-slate-400">Recommended: 16:9 or 1200x630px (PNG, JPG, WEBP)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sponsor Description / Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Official Summer campaign sponsored by Nike."
              className="w-full p-2.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none"
            />
          </div>

          {/* Dates: Campaign Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign Start Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={startDate}
                onChange={(val) => setStartDate(val)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Campaign End Date <span className="text-rose-500">*</span>
              </label>
              <CustomDatePicker
                value={endDate}
                onChange={(val) => setEndDate(val)}
              />
            </div>
          </div>

          {/* Status & Featured Controls */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-md border border-slate-200/60">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Publication Status
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus("approved")}
                  className={`h-7 px-2.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    status === "approved"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Active / Running
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("pending")}
                  className={`h-7 px-2.5 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    status === "pending"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  Paused / Draft
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-800 select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-slate-900 rounded border-slate-300 focus:ring-0 cursor-pointer"
              />
              <span className="flex items-center gap-1">
                <Star className={`w-3.5 h-3.5 ${isFeatured ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
                Featured (Top Home Banner)
              </span>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 px-3 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="h-8 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{editingItem ? "Update Changes" : "Create & Launch Ad"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
