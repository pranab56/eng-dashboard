/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { TBookAScout } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Upload, Loader2, ExternalLink, ImageIcon, AlertCircle, Compass } from "lucide-react";
import dayjs from "dayjs";

interface BookAScoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TBookAScout | null;
  isLoading: boolean;
}

const getInitialStatus = (item: TBookAScout | null): "active" | "inactive" | "archived" => {
  const raw = String(item?.status || "active").toLowerCase();
  if (raw === "inactive" || raw === "archived" || raw === "active") {
    return raw;
  }
  return "active";
};

export default function BookAScoutModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: BookAScoutModalProps) {
  const [sectionTitle, setSectionTitle] = useState(
    () => editingItem?.sectionTitle || "Book A Scout"
  );
  const [badgeText, setBadgeText] = useState(
    () => editingItem?.badgeText || "Professional scouting"
  );
  const [title, setTitle] = useState(
    () => editingItem?.title || "Showcase Your Talent To The Pros"
  );
  const [description, setDescription] = useState(
    () =>
      editingItem?.description ||
      "Book a professional scout to watch you play and provide expert feedback. Take the next step in your football career today."
  );
  const [buttonText, setButtonText] = useState(() => editingItem?.buttonText || "Book Now");
  const [redirectUrl, setRedirectUrl] = useState(() => editingItem?.redirectUrl || "");
  const [status, setStatus] = useState<"active" | "inactive" | "archived">(() =>
    getInitialStatus(editingItem)
  );
  const [isFeatured, setIsFeatured] = useState<boolean>(() => Boolean(editingItem?.isFeatured));
  const [priority, setPriority] = useState<number>(() => editingItem?.priority ?? 0);
  const [startDate, setStartDate] = useState(() =>
    editingItem?.startDate
      ? dayjs(editingItem.startDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD")
  );
  const [endDate, setEndDate] = useState(() =>
    editingItem?.endDate ? dayjs(editingItem.endDate).format("YYYY-MM-DD") : ""
  );

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() =>
    editingItem?.image ? formatImagePath(editingItem.image) : null
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setSectionTitle(editingItem.sectionTitle || "Book A Scout");
      setBadgeText(editingItem.badgeText || "Professional scouting");
      setTitle(editingItem.title || "");
      setDescription(editingItem.description || "");
      setButtonText(editingItem.buttonText || "Book Now");
      setRedirectUrl(editingItem.redirectUrl || "");
      setStatus(getInitialStatus(editingItem));
      setIsFeatured(Boolean(editingItem.isFeatured));
      setPriority(editingItem.priority ?? 0);
      setStartDate(
        editingItem.startDate
          ? dayjs(editingItem.startDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
      setEndDate(editingItem.endDate ? dayjs(editingItem.endDate).format("YYYY-MM-DD") : "");
      setImagePreview(editingItem.image ? formatImagePath(editingItem.image) : null);
      setImageFile(null);
    } else {
      setSectionTitle("Book A Scout");
      setBadgeText("Professional scouting");
      setTitle("Showcase Your Talent To The Pros");
      setDescription(
        "Book a professional scout to watch you play and provide expert feedback. Take the next step in your football career today."
      );
      setButtonText("Book Now");
      setRedirectUrl("");
      setStatus("active");
      setIsFeatured(false);
      setPriority(0);
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate("");
      setImageFile(null);
      setImagePreview(null);
    }
    setErrorMsg("");
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Card headline title is required.");
      return;
    }

    if (!redirectUrl.trim()) {
      setErrorMsg("Redirect URL is required for the Book Now button.");
      return;
    }

    if (!imageFile && !imagePreview) {
      setErrorMsg("Please upload a showcase card image.");
      return;
    }

    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      setErrorMsg("End date must be after start date.");
      return;
    }

    const formData = new FormData();
    const payload: Record<string, any> = {
      sectionTitle: sectionTitle.trim() || "Book A Scout",
      badgeText: badgeText.trim(),
      title: title.trim(),
      description: description.trim(),
      buttonText: buttonText.trim() || "Book Now",
      redirectUrl: redirectUrl.trim(),
      isFeatured,
      priority: Number(priority) || 0,
      startDate: startDate || dayjs().format("YYYY-MM-DD"),
      endDate: endDate || null,
    };

    if (status) {
      payload.status = status;
    }

    formData.append("data", JSON.stringify(payload));
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save Book A Scout card.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-4xl my-8 overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingItem ? "Edit Book A Scout Card" : "New Book A Scout Card"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure image overlay badge, headline, description, internal status, and redirect
                URL.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
          {/* Left Side: Form Inputs */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-200"
          >
            {errorMsg && (
              <div className="p-3 rounded-md border border-rose-200 bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  placeholder="Book A Scout"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Image Overlay Badge
                </label>
                <input
                  type="text"
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. Professional scouting"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Headline Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Showcase Your Talent To The Pros"
                className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Book a professional scout to watch you play and provide expert feedback..."
                className="w-full p-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Button Label (CTA)
                </label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="Book Now"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Redirect URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://example.com/book-scout"
                    className="w-full h-9 pl-8 pr-3 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Internal Status
                </label>
                <Select
                  value={status || undefined}
                  onValueChange={(val: any) => {
                    if (val) setStatus(val);
                  }}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                    <SelectItem value="active" className="text-xs py-2 cursor-pointer">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="text-xs py-2 cursor-pointer">
                      Inactive
                    </SelectItem>
                    <SelectItem value="archived" className="text-xs py-2 cursor-pointer">
                      Archived
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Display Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none px-3 h-9 w-full rounded-md border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-xs font-medium text-slate-700">Pin Featured</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <CustomDatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(val) => setStartDate(val)}
                  placeholder="Select start date"
                />
              </div>
              <div>
                <CustomDatePicker
                  label="End Date (Optional)"
                  value={endDate}
                  onChange={(val) => setEndDate(val)}
                  placeholder="No expiry"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Background Card Image <span className="text-rose-500">*</span>
              </label>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 flex items-center gap-3 bg-slate-50/60">
                <div className="w-16 h-12 rounded-md border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Scout preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    <span>{imageFile || imagePreview ? "Replace Image" : "Upload Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recommended portrait or 4:5 football action image (JPG, PNG, WEBP).
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingItem ? "Update Section" : "Create Section"}</span>
              </button>
            </div>
          </form>

          {/* Right Side: Live Mobile App Card Preview matching reference UI */}
          <div className="lg:col-span-5 p-6 bg-slate-50/80 flex flex-col items-center justify-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
              App Section Preview
            </span>

            <div className="w-[275px] bg-[#0b0b0d] rounded-2xl p-3.5 shadow-xl border border-slate-800">
              <p className="text-sm font-serif text-white tracking-wide mb-2.5">
                {sectionTitle || "Book A Scout"}
              </p>

              <div className="relative h-[325px] rounded-2xl border border-amber-300/70 overflow-hidden bg-slate-900 flex flex-col justify-between">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Card Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                    <span className="text-[10px]">Upload image preview</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-black/20" />

                {/* Top-Left Image Badge */}
                <div className="relative z-10 p-3">
                  {badgeText && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/75 text-white border border-amber-300/75 backdrop-blur-xs">
                      {badgeText}
                    </span>
                  )}
                </div>

                {/* Bottom Overlay Title, Description & Book Now CTA */}
                <div className="relative z-10 p-3 space-y-2">
                  <div>
                    <h4 className="text-[15px] font-serif text-white leading-snug">
                      {title || "Showcase Your Talent To The Pros"}
                    </h4>
                    <p className="text-[10px] text-slate-200/90 mt-1 leading-relaxed line-clamp-3">
                      {description ||
                        "Book a professional scout to watch you play and provide expert feedback."}
                    </p>
                  </div>

                  <div className="w-full py-2 px-3 rounded-xl bg-black/80 border border-amber-300/75 text-center text-[11px] font-serif text-white tracking-wide">
                    {buttonText || "Book Now"}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3 max-w-[240px] truncate">
              {redirectUrl ? `Redirects → ${redirectUrl}` : "Enter redirect URL to link CTA button"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
