/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { TAppModal } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { APP_ROUTES_CATEGORIES, ALL_APP_ROUTES } from "@/constants/appRoutesData";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Upload,
  Loader2,
  ExternalLink,
  Smartphone,
  ImageIcon,
  AlertCircle,
} from "lucide-react";
import dayjs from "dayjs";

interface AppPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TAppModal | null;
  isLoading: boolean;
}

export default function AppPopupModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: AppPopupModalProps) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("ENTER NOW");
  const [actionType, setActionType] = useState<"screen" | "external_url" | "dismiss_only">("screen");
  const [targetScreen, setTargetScreen] = useState("");
  const [screenName, setScreenName] = useState("");
  const [screenConstant, setScreenConstant] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [showFrequency, setShowFrequency] = useState<"once" | "once_per_day" | "always">("once");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [priority, setPriority] = useState<number>(0);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().add(60, "day").format("YYYY-MM-DD"));

  // Media
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingItem) {
      setTitle(editingItem.title || "");
      setSubtitle(editingItem.subtitle || "");
      setDescription(editingItem.description || "");
      setCtaText(editingItem.ctaText || "ENTER NOW");
      setActionType(editingItem.actionType || "screen");
      setTargetScreen(editingItem.targetScreen || "");
      setScreenName(editingItem.screenName || "");
      setScreenConstant(editingItem.screenConstant || "");
      setTargetUrl(editingItem.targetUrl || "");
      setShowFrequency(editingItem.showFrequency || "once");
      setStatus(editingItem.status === "inactive" ? "inactive" : "active");
      setPriority(editingItem.priority || 0);
      setStartDate(
        editingItem.startDate
          ? dayjs(editingItem.startDate).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD")
      );
      setEndDate(
        editingItem.endDate
          ? dayjs(editingItem.endDate).format("YYYY-MM-DD")
          : dayjs().add(60, "day").format("YYYY-MM-DD")
      );

      if (editingItem.image) {
        setImagePreview(formatImagePath(editingItem.image));
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    } else {
      setTitle("");
      setSubtitle("Powered by Passion.");
      setDescription("Win exclusive rewards and discover new features across competitions and matches.");
      setCtaText("ENTER NOW");
      setActionType("screen");
      setTargetScreen("/promotional_zone_screen");
      setScreenName("PromotionalZoneScreen");
      setScreenConstant("AppRoutes.promotionalZone");
      setTargetUrl("");
      setShowFrequency("once");
      setStatus("active");
      setPriority(0);
      setStartDate(dayjs().format("YYYY-MM-DD"));
      setEndDate(dayjs().add(60, "day").format("YYYY-MM-DD"));
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

  const handleScreenSelect = (routePath: string) => {
    setTargetScreen(routePath);
    const found = ALL_APP_ROUTES.find((r) => r.route === routePath);
    if (found) {
      setScreenName(found.screen);
      setScreenConstant(found.constant);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim()) {
      setErrorMsg("Please enter a popup title.");
      return;
    }

    if (!imageFile && !imagePreview) {
      setErrorMsg("Please upload a popup banner image.");
      return;
    }

    if (actionType === "external_url" && !targetUrl.trim()) {
      setErrorMsg("Please specify a target website URL.");
      return;
    }

    if (actionType === "screen" && !targetScreen.trim()) {
      setErrorMsg("Please select an in-app destination screen.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("subtitle", subtitle.trim());
    formData.append("description", description.trim());
    formData.append("ctaText", ctaText.trim() || "ENTER NOW");
    formData.append("actionType", actionType);
    formData.append("showFrequency", showFrequency);
    formData.append("status", status);
    formData.append("priority", String(priority || 0));

    if (actionType === "screen") {
      formData.append("targetScreen", targetScreen.trim());
      formData.append("screenName", screenName.trim());
      formData.append("screenConstant", screenConstant.trim());
    } else if (actionType === "external_url") {
      formData.append("targetUrl", targetUrl.trim());
    }

    if (startDate) formData.append("startDate", startDate);
    if (endDate) formData.append("endDate", endDate);

    if (imageFile) {
      formData.append("image", imageFile);
      formData.append("banner", imageFile);
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save popup.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      {/* Expanded Width Container: max-w-6xl (1152px) */}
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-6xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {editingItem ? "Edit App Open Popup" : "New App Open Popup"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure startup modal advertisement and destination routing.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Spacious Two Column Layout */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Form Left Side (7 Cols on desktop) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 p-6 sm:p-7 space-y-5">
            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Campaign Title & Subtitle */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Campaign Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. ASUS LAPTOP POWERED BY SNAPDRAGON GIVEAWAY"
                  className="w-full h-9 text-xs px-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tagline / Header Subtitle
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Powered by Passion. United by Snapdragon."
                  className="w-full h-9 text-xs px-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Body Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Win an exclusive ASUS Zenbook A16! Tap below to find out how you can win..."
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 resize-none"
                />
              </div>
            </div>

            {/* Image Banner Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Banner Graphic <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 cursor-pointer border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100/60 rounded-md p-3.5 transition-colors text-center flex flex-col items-center justify-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-medium text-slate-700">Choose banner asset</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP recommended</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="w-24 h-18 rounded border border-slate-200 bg-slate-100 shrink-0 relative overflow-hidden group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Button Text & Action Type (Custom Select) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  CTA Button Label
                </label>
                <input
                  type="text"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="ENTER NOW"
                  className="w-full h-9 text-xs px-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Destination Type
                </label>
                <Select
                  value={actionType}
                  onValueChange={(val: any) => setActionType(val)}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300 focus:ring-1 focus:ring-slate-900">
                    <SelectValue placeholder="Select destination type" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                    <SelectItem value="screen" className="text-xs py-2 cursor-pointer">
                      App Screen Navigation
                    </SelectItem>
                    <SelectItem value="external_url" className="text-xs py-2 cursor-pointer">
                      External Web Link
                    </SelectItem>
                    <SelectItem value="dismiss_only" className="text-xs py-2 cursor-pointer">
                      Dismiss Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Destination Specific Controls */}
            {actionType === "screen" && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                  <span>Target In-App Screen</span>
                </div>
                <Select
                  value={targetScreen}
                  onValueChange={(val: string) => handleScreenSelect(val)}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300 focus:ring-1 focus:ring-slate-900">
                    <SelectValue placeholder="Select destination screen route..." />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] max-h-80 bg-white border border-slate-200 shadow-lg">
                    {APP_ROUTES_CATEGORIES.map((catGroup) => (
                      <SelectGroup key={catGroup.category}>
                        <SelectLabel className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-1.5 bg-slate-50 border-y border-slate-100 first:border-t-0">
                          {catGroup.category}
                        </SelectLabel>
                        {catGroup.routes.map((r) => (
                          <SelectItem
                            key={r.route}
                            value={r.route}
                            className="text-xs py-2 cursor-pointer"
                          >
                            <span className="font-medium text-slate-900">{r.screen}</span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">
                              ({r.route})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
                {targetScreen && (
                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                    <span>
                      Screen: <strong className="text-slate-800">{screenName}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {screenConstant}
                    </span>
                  </div>
                )}
              </div>
            )}

            {actionType === "external_url" && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Website URL</span>
                </div>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com/promo"
                  className="w-full h-9 text-xs px-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            )}

            {/* Delivery Rules (Custom Selects) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Frequency
                </label>
                <Select
                  value={showFrequency}
                  onValueChange={(val: any) => setShowFrequency(val)}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300 focus:ring-1 focus:ring-slate-900">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                    <SelectItem value="once" className="text-xs py-2 cursor-pointer">
                      Once per user
                    </SelectItem>
                    <SelectItem value="once_per_day" className="text-xs py-2 cursor-pointer">
                      Once per day
                    </SelectItem>
                    <SelectItem value="always" className="text-xs py-2 cursor-pointer">
                      Every launch
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Status
                </label>
                <Select
                  value={status}
                  onValueChange={(val: any) => setStatus(val)}
                >
                  <SelectTrigger className="w-full h-9 px-3 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300 focus:ring-1 focus:ring-slate-900">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-md">
                    <SelectItem value="active" className="text-xs py-2 cursor-pointer">
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" className="text-xs py-2 cursor-pointer">
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <input
                  type="number"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full h-9 text-xs px-3 bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
                />
              </div>
            </div>

            {/* Schedule Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Start Date
                </label>
                <CustomDatePicker
                  value={startDate}
                  onChange={(d) => setStartDate(d)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  End Date
                </label>
                <CustomDatePicker
                  value={endDate}
                  onChange={(d) => setEndDate(d)}
                />
              </div>
            </div>

            {/* Dialog Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
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
                <span>{editingItem ? "Update Popup" : "Save Popup"}</span>
              </button>
            </div>
          </form>

          {/* Right Side: Clean Mobile Preview (5 Cols on desktop) */}
          <div className="lg:col-span-5 p-6 sm:p-7 bg-slate-50/70 flex flex-col items-center justify-center">
            <div className="text-center mb-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Mobile Preview
              </span>
            </div>

            {/* Clean Mobile Screen Mockup */}
            <div className="w-[270px] h-[490px] bg-slate-900 rounded-[28px] border-4 border-slate-300 shadow-md relative overflow-hidden flex flex-col">
              {/* Device Notch */}
              <div className="w-20 h-3.5 bg-slate-800 rounded-b-lg mx-auto absolute top-0 left-1/2 -translate-x-1/2 z-20" />

              {/* Background Mock Content */}
              <div className="absolute inset-0 bg-slate-900 p-3 pt-8 space-y-2.5 opacity-30 pointer-events-none">
                <div className="h-4 w-24 bg-slate-700 rounded" />
                <div className="h-20 w-full bg-slate-700 rounded-md" />
                <div className="h-10 w-full bg-slate-700 rounded-md" />
              </div>

              {/* Dark Modal Backdrop */}
              <div className="absolute inset-0 bg-slate-950/80 z-10 flex items-center justify-center p-3">
                {/* Popup Card */}
                <div className="w-full bg-[#8a0010] rounded-xl overflow-hidden shadow-xl border border-red-500/20 flex flex-col">
                  {/* Top Bar: Subtitle & Dismiss Button */}
                  <div className="px-3 py-2 flex items-start justify-between">
                    <p className="text-[11px] font-bold text-white leading-tight pr-2">
                      {subtitle || "Powered by Passion."}
                    </p>
                    <div className="w-4 h-4 rounded-full bg-black/20 flex items-center justify-center text-white/80 shrink-0">
                      <X className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Banner Image Area */}
                  <div className="w-full h-24 bg-[#6e000c] relative flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-white/50">
                        <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-60" />
                        <span className="text-[10px] font-medium tracking-wide">Image Banner</span>
                      </div>
                    )}
                  </div>

                  {/* White Info Section */}
                  <div className="bg-white p-3 text-slate-900 text-center">
                    <h3 className="text-[11px] font-bold uppercase tracking-tight text-slate-950 leading-snug">
                      {title || "CAMPAIGN HEADLINE"}
                    </h3>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal line-clamp-3">
                      {description || "Promotional description text will appear here for mobile users."}
                    </p>

                    {/* CTA Button */}
                    <button
                      type="button"
                      className="w-full mt-2.5 py-1.5 px-3 bg-[#c40018] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs"
                    >
                      {ctaText || "ENTER NOW"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3">
              Renders inside mobile app on launch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
