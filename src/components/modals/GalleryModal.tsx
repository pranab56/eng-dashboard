/* eslint-disable @next/next/no-img-element */
"use client";

import CategoryComboBox from "@/components/cui/CategoryComboBox";
import { TGallery } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; status: string; file: File | null }) => Promise<void>;
  editingItem: TGallery | null;
  isLoading: boolean;
}

const CATEGORY_OPTIONS = ["Football", "Basketball", "Cricket", "Events", "General"];

export default function GalleryModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: GalleryModalProps) {
  const [category, setCategory] = useState("Football");
  const [status, setStatus] = useState("active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (editingItem) {
      setCategory(editingItem.category || "Football");
      setStatus(editingItem.status || "active");
      setPreviewUrl(formatImagePath(editingItem.image));
      setSelectedFile(null);
    } else {
      setCategory("Football");
      setStatus("active");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    setErrorMsg("");
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMsg("Please select a valid image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const finalCategory = category.trim();

    if (!finalCategory) {
      setErrorMsg("Category is required");
      return;
    }

    if (!editingItem && !selectedFile) {
      setErrorMsg("Please select an image file to upload");
      return;
    }

    await onSubmit({
      category: finalCategory,
      status,
      file: selectedFile,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {editingItem ? "Edit Gallery Item" : "Add New Gallery Item"}
              </h3>
              <p className="text-xs text-gray-500">
                Upload image and configure category & status settings
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Dropzone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Image File {!editingItem && <span className="text-red-500">*</span>}
            </label>

            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="gallery-image-input"
                disabled={isLoading}
              />
              <label
                htmlFor="gallery-image-input"
                className="flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer overflow-hidden relative"
              >
                {previewUrl ? (
                  <div className="relative w-full h-44 group-hover:opacity-90 transition-opacity">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1">
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-semibold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700">
                      Click to upload image
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, WEBP, GIF up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Category ComboBox */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Category <span className="text-red-500">*</span>
            </label>
            <CategoryComboBox
              value={category}
              onChange={setCategory}
              options={CATEGORY_OPTIONS}
              disabled={isLoading}
            />
          </div>

          {/* Status Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === "active"}
                  onChange={() => setStatus("active")}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={() => setStatus("inactive")}
                  disabled={isLoading}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                Inactive
              </label>
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
              <span>{editingItem ? "Save Changes" : "Create Item"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
