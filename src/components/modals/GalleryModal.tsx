/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetAllCategoryQuery } from "@/features/gallery/galleryApi";
import { TCategory, TGallery, TSubCategory } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";
import {
  X,
  Upload,
  Loader2,
  Image as ImageIcon,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    category: string;
    subCategory?: string;
    status: string;
    file: File | null;
  }) => Promise<void>;
  editingItem: TGallery | null;
  isLoading: boolean;
}

export default function GalleryModal({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  isLoading,
}: GalleryModalProps) {
  const { data: categoryData } = useGetAllCategoryQuery({});
  const categoriesList: TCategory[] = categoryData?.data || [];

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("");
  const [status, setStatus] = useState("active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Popover States
  const [parentPopoverOpen, setParentPopoverOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState("");

  const [subPopoverOpen, setSubPopoverOpen] = useState(false);
  const [subSearch, setSubSearch] = useState("");

  useEffect(() => {
    if (editingItem) {
      setSelectedCategory(editingItem.category || "");
      setSelectedSubCategory(editingItem.subCategory || "");
      setStatus(editingItem.status || "active");
      setPreviewUrl(formatImagePath(editingItem.image));
      setSelectedFile(null);
    } else {
      setSelectedCategory("");
      setSelectedSubCategory("");
      setStatus("active");
      setSelectedFile(null);
      setPreviewUrl(null);
    }
    setErrorMsg("");
    setParentSearch("");
    setSubSearch("");
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

  // Find selected parent category object
  const selectedParentObj = categoriesList.find(
    (c) => (c._id || c.id) === selectedCategory || c.name === selectedCategory
  );

  // Subcategories array for selected parent category
  const subCategoriesList: TSubCategory[] =
    selectedParentObj?.subCategories || [];

  // Find selected subcategory object
  const selectedSubObj = subCategoriesList.find(
    (s) =>
      (s._id || s.id) === selectedSubCategory || s.name === selectedSubCategory
  );

  // Filtered lists for search
  const filteredParentCategories = categoriesList.filter((c) =>
    (c.name || "").toLowerCase().includes(parentSearch.toLowerCase())
  );

  const filteredSubCategories = subCategoriesList.filter((s) =>
    (s.name || "").toLowerCase().includes(subSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!selectedCategory) {
      setErrorMsg("Please select a Category");
      return;
    }

    if (!editingItem && !selectedFile) {
      setErrorMsg("Please select an image file to upload");
      return;
    }

    await onSubmit({
      category: selectedCategory,
      subCategory: selectedSubCategory || undefined,
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
              <h3 className="font-medium text-gray-900 text-lg">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                className="flex flex-col items-center justify-center w-full min-h-[150px] border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/30 rounded-xl transition-all cursor-pointer overflow-hidden relative"
              >
                {previewUrl ? (
                  <div className="relative w-full h-40 group-hover:opacity-90 transition-opacity">
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

          {/* Step 1: Parent Category Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Category <span className="text-red-500">*</span>
            </label>
            <Popover
              open={parentPopoverOpen}
              onOpenChange={setParentPopoverOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between font-medium text-gray-800 hover:bg-gray-100/70 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate">
                    {selectedParentObj
                      ? selectedParentObj.name
                      : categoriesList.length === 0
                        ? "No category available"
                        : "Select Category..."}
                  </span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-[60]">
                <div className="p-2 border-b border-gray-100 relative flex items-center">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                  {filteredParentCategories.map((cat) => {
                    const catId = cat._id || cat.id || "";
                    const isSelected = selectedCategory === catId;

                    const handleSelect = (e: React.SyntheticEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCategory(catId);
                      setSelectedSubCategory(""); // Reset subcategory
                      setParentPopoverOpen(false);
                      setParentSearch("");
                    };

                    return (
                      <button
                        key={catId}
                        type="button"
                        onPointerDown={handleSelect}
                        onClick={handleSelect}
                        className={`w-full px-3 py-2 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${isSelected
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </button>
                    );
                  })}

                  {filteredParentCategories.length === 0 && (
                    <p className="p-3 text-center text-xs text-gray-400 font-medium">
                      {categoriesList.length === 0
                        ? "No category available"
                        : "No matching categories found"}
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Step 2: SubCategory Selection (Only if Parent Category has children) */}
          {selectedCategory && subCategoriesList.length > 0 && (
            <div className="space-y-2 animate-in fade-in duration-200">
              <label className="block text-sm font-semibold text-gray-800">
                SubCategory <span className="text-gray-400 text-xs font-normal">(Optional)</span>
              </label>
              <Popover open={subPopoverOpen} onOpenChange={setSubPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between font-medium text-gray-800 hover:bg-gray-100/70 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="truncate">
                      {selectedSubObj
                        ? selectedSubObj.name
                        : "Select SubCategory..."}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-[60]">
                  <div className="p-2 border-b border-gray-100 relative flex items-center">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Search subcategory..."
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                    {filteredSubCategories.map((sub) => {
                      const subId = sub._id || sub.id || "";
                      const isSelected = selectedSubCategory === subId;

                      const handleSelectSub = (e: React.SyntheticEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedSubCategory(subId);
                        setSubPopoverOpen(false);
                        setSubSearch("");
                      };

                      return (
                        <button
                          key={subId}
                          type="button"
                          onPointerDown={handleSelectSub}
                          onClick={handleSelectSub}
                          className={`w-full px-3 py-2 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${isSelected
                              ? "bg-blue-50 text-blue-600 font-semibold"
                              : "text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                          <span>{sub.name}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                          )}
                        </button>
                      );
                    })}

                    {filteredSubCategories.length === 0 && (
                      <p className="p-3 text-center text-xs text-gray-400 font-medium">
                        No subcategories found
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

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
