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
      const catVal = typeof editingItem.category === 'object' && editingItem.category 
        ? (editingItem.category as any)._id || (editingItem.category as any).id
        : editingItem.category || "";
      const subVal = typeof editingItem.subCategory === 'object' && editingItem.subCategory 
        ? (editingItem.subCategory as any)._id || (editingItem.subCategory as any).id
        : editingItem.subCategory || "";

      setSelectedCategory(catVal);
      setSelectedSubCategory(subVal);
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
        setErrorMsg("Please select a valid image file (PNG, JPG, WEBP)");
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
      setErrorMsg("Please select a category for this media item.");
      return;
    }

    if (!editingItem && !selectedFile) {
      setErrorMsg("Please select an image file to upload.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {editingItem ? "Edit Gallery Item" : "Upload Gallery Photo"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify media album, category tag, and visibility status.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Image Upload Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Photo Asset {!editingItem && <span className="text-rose-500">*</span>}
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
                className="flex flex-col items-center justify-center w-full min-h-[140px] border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-all cursor-pointer overflow-hidden relative"
              >
                {previewUrl ? (
                  <div className="relative w-full h-44 group-hover:opacity-95 transition-opacity">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="text-xs font-semibold">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-5 text-center">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-500 flex items-center justify-center mb-2 shadow-2xs">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Click to choose an image file
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Category Album <span className="text-rose-500">*</span>
            </label>
            <Popover open={parentPopoverOpen} onOpenChange={setParentPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  disabled={isLoading}
                  className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span className="truncate">
                    {selectedParentObj
                      ? selectedParentObj.name
                      : categoriesList.length === 0
                        ? "No category available"
                        : "Select Album / Category..."}
                  </span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[60]">
                <div className="p-2 border-b border-slate-100 relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={parentSearch}
                    onChange={(e) => setParentSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {filteredParentCategories.map((cat) => {
                    const catId = cat._id || cat.id || "";
                    const isSelected = selectedCategory === catId;

                    const handleSelect = (e: React.SyntheticEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedCategory(catId);
                      setSelectedSubCategory("");
                      setParentPopoverOpen(false);
                      setParentSearch("");
                    };

                    return (
                      <button
                        key={catId}
                        type="button"
                        onPointerDown={handleSelect}
                        onClick={handleSelect}
                        className={`w-full px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${
                          isSelected
                            ? "bg-slate-900 text-white font-medium"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}

                  {filteredParentCategories.length === 0 && (
                    <p className="p-3 text-center text-xs text-slate-400">
                      No categories found
                    </p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* SubCategory Dropdown */}
          {selectedCategory && subCategoriesList.length > 0 && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                SubCategory <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <Popover open={subPopoverOpen} onOpenChange={setSubPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between font-medium text-slate-800 hover:bg-slate-50 focus:outline-none focus:border-slate-400 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="truncate">
                      {selectedSubObj ? selectedSubObj.name : "Select SubCategory..."}
                    </span>
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-[60]">
                  <div className="p-2 border-b border-slate-100 relative flex items-center">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Search subcategory..."
                      value={subSearch}
                      onChange={(e) => setSubSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
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
                          className={`w-full px-2.5 py-1.5 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${
                            isSelected
                              ? "bg-slate-900 text-white font-medium"
                              : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}

                    {filteredSubCategories.length === 0 && (
                      <p className="p-3 text-center text-xs text-slate-400">
                        No subcategories found
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Visibility Status <span className="text-rose-500">*</span>
            </label>
            <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  status === "active"
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Active
              </button>
              <button
                type="button"
                onClick={() => setStatus("inactive")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  status === "inactive"
                    ? "bg-white text-slate-800 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inactive
              </button>
            </div>
          </div>

          {/* Validation Error Message */}
          {errorMsg && (
            <div className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {errorMsg}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingItem ? "Save Changes" : "Upload Photo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
