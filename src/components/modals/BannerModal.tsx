/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { TBanner } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TBanner | null;
  isLoading: boolean;
}

const PREDEFINED_SECTIONS = [
  { label: "ENG FIXTURES", value: "ENG FIXTURES", defaultSubtitle: "CHECK WHO YOUR PLAYING EACH WEEK" },
  { label: "ENG TABLES", value: "ENG TABLES", defaultSubtitle: "FIND OUT WHERE YOUR TEAM IS PLACE EACH WEEK" },
  { label: "ENG STATS", value: "ENG STATS", defaultSubtitle: "CHECK YOUR PROGRESSION IN REAL TIME" },
  { label: "ENG TV", value: "ENG TV", defaultSubtitle: "WATCH YOUR MATCHES FROM THE COMFORT OF YOUR HOME" },
  { label: "ENG NEWS", value: "ENG NEWS", defaultSubtitle: "LATEST NEWS & UPDATES" },
  { label: "MATCH CENTER", value: "MATCH CENTER", defaultSubtitle: "LIVE MATCHES, SCORES & UPDATES" },
  { label: "HOME BANNER", value: "HOME", defaultSubtitle: "WELCOME TO ENG SPORTS" },
];

export default function BannerModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: BannerModalProps) {
  const [title, setTitle] = useState("");
  const [section, setSection] = useState("ENG FIXTURES");
  const [subtitle, setSubtitle] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [priority, setPriority] = useState<number>(0);
  const [link, setLink] = useState("");

  // Media
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setTitle(editingItem.title || editingItem.name || "");
      setSection(editingItem.section || "ENG FIXTURES");
      setSubtitle(editingItem.subtitle || "");
      setStatus(editingItem.status === "inactive" ? "inactive" : "active");
      setPriority(editingItem.priority || 0);
      setLink(editingItem.link || "");

      if (editingItem.image) {
        setImagePreview(formatImagePath(editingItem.image));
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      setTitle("ENG FIXTURES");
      setSection("ENG FIXTURES");
      setSubtitle("CHECK WHO YOUR PLAYING EACH WEEK");
      setStatus("active");
      setPriority(0);
      setLink("");
      setImageFile(null);
      setImagePreview(null);
    }
    setErrorMsg("");
  }, [isOpen, editingItem]);

  const handleSectionSelect = (val: string) => {
    setSection(val);
    const matched = PREDEFINED_SECTIONS.find((s) => s.value === val);
    if (!editingItem && matched) {
      if (!title || PREDEFINED_SECTIONS.some((p) => p.label === title)) {
        setTitle(matched.label);
      }
      if (matched.defaultSubtitle) {
        setSubtitle(matched.defaultSubtitle);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Banner title is required.");
      return;
    }

    if (!editingItem && !imageFile) {
      setErrorMsg("Please upload a banner image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("name", title.trim());
    formData.append("section", section.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("status", status);
    formData.append("priority", String(priority));
    if (link.trim()) {
      formData.append("link", link.trim());
    }

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save banner.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {editingItem ? "Edit Section Banner" : "Add New Section Banner"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload top banner images for app sections (Fixtures, Tables, Stats, TV, etc.)
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Target App Section <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Selected: {section}
              </span>
            </div>

            <Select value={section} onValueChange={handleSectionSelect}>
              <SelectTrigger className="w-full h-11 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-xs hover:border-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none flex items-center justify-between cursor-pointer">
                <SelectValue placeholder="Select target section" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_SECTIONS.map((sec) => (
                  <SelectItem key={sec.value} value={sec.value} className="text-xs py-2 cursor-pointer">
                    <span className="font-semibold text-slate-900">{sec.label}</span>
                    {sec.defaultSubtitle && (
                      <span className="text-slate-400 block text-[10px] mt-0.5 font-normal">{sec.defaultSubtitle}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Quick Section Selection Pills */}
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-medium mr-1">Quick Select:</span>
              {PREDEFINED_SECTIONS.map((sec) => (
                <button
                  key={sec.value}
                  type="button"
                  onClick={() => handleSectionSelect(sec.value)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition cursor-pointer ${
                    section === sec.value
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {sec.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Choose the exact mobile section/screen where this top banner should be displayed.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Banner Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ENG FIXTURES"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Subtitle / Tagline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Subtitle / Caption (Optional)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. CHECK WHO YOUR PLAYING EACH WEEK"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          {/* Image Upload with Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Banner Image <span className="text-red-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-4 hover:border-slate-400 transition bg-slate-50 flex flex-col items-center justify-center min-h-[170px] text-center">
              {imagePreview ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                    <label className="cursor-pointer px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-medium shadow hover:bg-slate-100">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-700">
                    Click to browse or drag and drop image
                  </span>
                  <span className="text-[11px] text-slate-400 mt-1">
                    Recommended: PNG, JPG, WEBP (Landscape banner format)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Row: Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(val: "active" | "inactive") => setStatus(val)}
              >
                <SelectTrigger className="w-full h-11 px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 shadow-xs hover:border-slate-400 focus:ring-2 focus:ring-slate-900 focus:outline-none flex items-center justify-between cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs py-2 cursor-pointer font-medium text-emerald-700">
                    Active (Visible in app)
                  </SelectItem>
                  <SelectItem value="inactive" className="text-xs py-2 cursor-pointer font-medium text-slate-600">
                    Inactive (Hidden from app)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Priority / Display Order
              </label>
              <input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Higher numbers appear first.
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition flex items-center gap-2 shadow"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingItem ? "Update Banner" : "Save Banner"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
