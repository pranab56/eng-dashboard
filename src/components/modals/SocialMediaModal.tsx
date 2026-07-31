"use client";

import ComboBox from "@/components/cui/ComboBox";
import { TSocialMedia } from "@/types/columnTypes";
import { X, Share2, Loader2 } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">
                {editingItem ? "Edit Social Media Link" : "Add Social Media Link"}
              </h3>
              <p className="text-xs text-gray-500">
                Configure platform, URL link, display order, and status
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Platform ComboBox */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Platform Name <span className="text-red-500">*</span>
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
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Profile / Page URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/yourpage"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium text-gray-800"
            />
          </div>

          {/* Icon URL Field (Optional) */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Icon URL <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com/icon.png"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium text-gray-800"
            />
          </div>

          {/* Order & Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Display Order <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                disabled={isLoading}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4 h-11">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="social-status"
                    checked={status === true}
                    onChange={() => setStatus(true)}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="social-status"
                    checked={status === false}
                    onChange={() => setStatus(false)}
                    disabled={isLoading}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  Inactive
                </label>
              </div>
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <p className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
              {errorMsg}
            </p>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 text-sm font-semibold transition-all shadow-md shadow-gray-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{editingItem ? "Save Changes" : "Create Link"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
