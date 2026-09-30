"use client";

import ComboBox from "@/components/cui/ComboBox";
import { TSocialMedia } from "@/types/columnTypes";
import { X, Share2, Loader2, Check } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SocialMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    platform: string;
    url: string;
    icon?: string;
    status: boolean;
    order: number;
  }) => Promise<void>;
  editingItem: TSocialMedia | null;
  isLoading: boolean;
}

const POPULAR_PLATFORMS = [
  "Facebook",
  "Instagram",
  "Twitter / X",
  "LinkedIn",
  "YouTube",
  "TikTok",
  "GitHub",
  "WhatsApp",
  "Telegram",
];

export default function SocialMediaModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: SocialMediaModalProps) {
  const [platform, setPlatform] = useState("Facebook");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [status, setStatus] = useState<boolean>(true);
  const [order, setOrder] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingItem) {
      setPlatform(editingItem.platform || "Facebook");
      setUrl(editingItem.url || "");
      setIcon(editingItem.icon || "");
      setStatus(editingItem.status ?? true);
      setOrder(editingItem.order ?? 1);
    } else {
      setPlatform("Facebook");
      setUrl("");
      setIcon("");
      setStatus(true);
      setOrder(1);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalPlatform = platform.trim();

    if (!finalPlatform) {
      setErrorMsg("Platform name is required");
      return;
    }

    if (!url.trim()) {
      setErrorMsg("URL is required");
      return;
    }

    await onSubmit({
      platform: finalPlatform,
      url: url.trim(),
      icon: icon.trim() || undefined,
      status,
      order: Number(order) || 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {editingItem ? "Edit Social Media Link" : "Add Social Media Link"}
              </h3>
              <p className="text-xs text-slate-500">
                Configure platform, URL link, display order, and routing status.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Platform ComboBox */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Platform Name <span className="text-rose-500">*</span>
            </label>
            <ComboBox
              value={platform}
              onChange={setPlatform}
              options={POPULAR_PLATFORMS}
              placeholder="Select or type platform..."
              searchPlaceholder="Search or type platform..."
              disabled={isLoading}
            />
          </div>

          {/* URL Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Profile / Channel URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/yourpage"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors font-medium text-slate-900"
            />
          </div>

          {/* Icon URL Field (Optional) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Custom Icon URL <span className="text-[11px] text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com/icon.png"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isLoading}
              className="w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors font-medium text-slate-900"
            />
          </div>

          {/* Order & Status Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Display Order <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors font-medium text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Status <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 h-9 p-0.5 bg-slate-100 rounded-md border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setStatus(true)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    status === true
                      ? "bg-white text-emerald-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status === true && <Check className="w-3 h-3 text-emerald-600" />}
                  <span>Active</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(false)}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    status === false
                      ? "bg-white text-slate-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status === false && <Check className="w-3 h-3 text-slate-600" />}
                  <span>Inactive</span>
                </button>
              </div>
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-xs font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded-md border border-rose-100">
              {errorMsg}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 px-4 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="h-9 px-4 rounded-md bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingItem ? "Save Changes" : "Create Link"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
