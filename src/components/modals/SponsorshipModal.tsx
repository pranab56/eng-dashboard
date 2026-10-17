/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TSponsorship } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Upload, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  editingItem: TSponsorship | null;
  isLoading: boolean;
}

const SPONSORSHIP_TYPES = [
  { value: "sponsor", label: "Sponsor" },
  { value: "partner", label: "Official Partner" },
  { value: "brand_collaboration", label: "Brand Collaboration" },
];

const SPONSORSHIP_TIERS = [
  { value: "title", label: "Title" },
  { value: "platinum", label: "Platinum" },
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "bronze", label: "Bronze" },
  { value: "official", label: "Official" },
  { value: "community", label: "Community" },
  { value: "media", label: "Media" },
  { value: "other", label: "Other" },
];

const PLACEMENT_OPTIONS = [
  { value: "home", label: "Home Page" },
  { value: "tournament", label: "Tournaments" },
  { value: "match", label: "Match & Fixtures" },
  { value: "team", label: "Team Hub" },
  { value: "footer", label: "Footer" },
  { value: "all", label: "Global / All" },
];

export default function SponsorshipModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: SponsorshipModalProps) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"sponsor" | "partner" | "brand_collaboration">("sponsor");
  const [tier, setTier] = useState("official");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [placements, setPlacements] = useState<string[]>(["home", "all"]);
  const [order, setOrder] = useState<number>(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Logo file state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Banner file state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name || "");
      setTitle(editingItem.title || "");
      setType(editingItem.type || "sponsor");
      setTier(editingItem.tier || "official");
      setWebsiteUrl(editingItem.websiteUrl || "");
      setDescription(editingItem.description || "");
      setPlacements(editingItem.placements && editingItem.placements.length > 0 ? editingItem.placements : ["home"]);
      setOrder(editingItem.order ?? 0);
      setStatus(editingItem.status || "active");
      setContactEmail(editingItem.contactEmail || "");
      setContactPhone(editingItem.contactPhone || "");
      setLogoPreview(formatImagePath(editingItem.logo));
      setBannerPreview(formatImagePath(editingItem.banner));
      setLogoFile(null);
      setBannerFile(null);
    } else {
      setName("");
      setTitle("");
      setType("sponsor");
      setTier("official");
      setWebsiteUrl("");
      setDescription("");
      setPlacements(["home", "all"]);
      setOrder(0);
      setStatus("active");
      setContactEmail("");
      setContactPhone("");
      setLogoFile(null);
      setLogoPreview(null);
      setBannerFile(null);
      setBannerPreview(null);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handlePlacementToggle = (val: string) => {
    if (placements.includes(val)) {
      setPlacements(placements.filter((p) => p !== val));
    } else {
      setPlacements([...placements, val]);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

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

    if (!name.trim()) {
      setErrorMsg("Brand name is required.");
      return;
    }

    if (!editingItem && !logoFile) {
      setErrorMsg("A brand logo is required.");
      return;
    }

    const formData = new FormData();
    const payloadData: Record<string, any> = {
      name: name.trim(),
      title: title.trim(),
      type,
      tier,
      websiteUrl: websiteUrl.trim(),
      description: description.trim(),
      placements: placements.length > 0 ? placements : ["home"],
      order: Number(order) || 0,
      status,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    };

    formData.append("data", JSON.stringify(payloadData));

    if (logoFile) {
      formData.append("image", logoFile);
    }
    if (bannerFile) {
      formData.append("image", bannerFile);
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {editingItem ? "Edit Sponsor / Partner" : "Add Sponsor / Partner"}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Configure brand details, tiers, and platform showcase placements.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Grid: Name & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Brand Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nike, Adidas"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tagline / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Official Apparel Partner"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
          </div>

          {/* Grid: Type & Tier (Custom Selects) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Type <span className="text-rose-500">*</span>
              </label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSORSHIP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tier <span className="text-rose-500">*</span>
              </label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  {SPONSORSHIP_TIERS.map((tr) => (
                    <SelectItem key={tr.value} value={tr.value}>
                      {tr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grid: Website & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Website URL
              </label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Display Order Sequence
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                min={0}
                placeholder="0"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description / Partnership Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief summary of the partnership..."
              className="w-full p-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white resize-none"
            />
          </div>

          {/* Media Uploads: Logo & Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Logo Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Brand Logo <span className="text-rose-500">*</span>
              </label>
              <div className="border border-dashed border-slate-300 rounded-md p-3 flex items-center gap-3 bg-slate-50/50">
                <div className="w-12 h-12 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">None</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>{logoFile || logoPreview ? "Replace Logo" : "Upload Logo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    Square PNG/SVG recommended
                  </p>
                </div>
              </div>
            </div>

            {/* Banner Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Banner Artwork <span className="text-slate-400 text-[11px]">(Optional)</span>
              </label>
              <div className="border border-dashed border-slate-300 rounded-md p-3 flex items-center gap-3 bg-slate-50/50">
                <div className="w-16 h-12 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                  {bannerPreview ? (
                    <img
                      src={bannerPreview}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] text-slate-400">None</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="w-3 h-3 text-slate-500" />
                    <span>{bannerFile || bannerPreview ? "Replace Banner" : "Upload Banner"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-400 mt-1 truncate">
                    1200x400 landscape banner
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placements */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Display Placements
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PLACEMENT_OPTIONS.map((opt) => {
                const isSelected = placements.includes(opt.value);
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => handlePlacementToggle(opt.value)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status (Custom Select) & Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status
              </label>
              <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-white hover:border-slate-300">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Visible)</SelectItem>
                  <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="partner@brand.com"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+44 7123 456789"
                className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-8 px-3 rounded-md border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-8 px-4 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingItem ? "Update Changes" : "Save Sponsor"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
