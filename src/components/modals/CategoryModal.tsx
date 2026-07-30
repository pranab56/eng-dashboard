"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TCategory } from "@/types/columnTypes";
import {
  X,
  FolderPlus,
  Loader2,
  GitBranch,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    order?: number;
    parentCategory?: string | null;
    id?: string;
  }) => Promise<void>;
  categories: TCategory[];
  editingCategory?: TCategory | null;
  parentCategoryIdForSub?: string | null;
  isLoading: boolean;
  allowSubcategory?: boolean;
  domainName?: string;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingCategory,
  parentCategoryIdForSub,
  isLoading,
  allowSubcategory = true,
  domainName = "Category",
}: CategoryModalProps) {
  const [isSubcategory, setIsSubcategory] = useState<boolean>(false);
  const [name, setName] = useState("");
  const [order, setOrder] = useState<number | string>("");
  const [parentCategory, setParentCategory] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");

  // ComboBox Popover State
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!allowSubcategory) {
      setIsSubcategory(false);
      setParentCategory("");
    }
    if (editingCategory) {
      setName(editingCategory.name || "");
      setOrder(
        editingCategory.order !== undefined && editingCategory.order !== null
          ? editingCategory.order
          : ""
      );
      if (editingCategory.parentCategory && allowSubcategory) {
        setIsSubcategory(true);
        setParentCategory(editingCategory.parentCategory);
      } else {
        setIsSubcategory(false);
        setParentCategory("");
      }
    } else if (parentCategoryIdForSub && allowSubcategory) {
      setIsSubcategory(true);
      setParentCategory(parentCategoryIdForSub);
      setName("");
      setOrder("");
    } else {
      setIsSubcategory(false);
      setParentCategory(categories[0]?._id || categories[0]?.id || "");
      setName("");
      setOrder("");
    }
    setErrorMsg("");
    setSearchQuery("");
  }, [editingCategory, parentCategoryIdForSub, categories, isOpen, allowSubcategory]);

  // Ensure parent category default is populated when switching to subcategory
  useEffect(() => {
    if (isSubcategory && !parentCategory && categories.length > 0) {
      setParentCategory(categories[0]?._id || categories[0]?.id || "");
    }
  }, [isSubcategory, parentCategory, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Category name is required");
      return;
    }

    if (isSubcategory && !parentCategory) {
      setErrorMsg("Please select a parent category");
      return;
    }

    await onSubmit({
      name: name.trim(),
      order: !isSubcategory && order !== "" ? Number(order) : undefined,
      parentCategory: isSubcategory ? parentCategory : null,
      id: editingCategory?._id || editingCategory?.id,
    });
  };

  const selectedParentObj = categories.find(
    (c) =>
      (c._id && c._id === parentCategory) ||
      (c.id && c.id === parentCategory) ||
      (c._id || c.id) === parentCategory
  );

  const filteredCategories = categories.filter((c) =>
    (c.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              {isSubcategory ? (
                <GitBranch className="w-5 h-5" />
              ) : (
                <FolderPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {editingCategory
                  ? isSubcategory
                    ? `Edit ${domainName} Subcategory`
                    : `Edit ${domainName} Category`
                  : isSubcategory
                  ? `Add ${domainName} Subcategory`
                  : `Add ${domainName} Category`}
              </h3>
              <p className="text-xs text-gray-500">
                {isSubcategory
                  ? `Create or update a subcategory under a parent ${domainName.toLowerCase()} category`
                  : `Create or update a main ${domainName.toLowerCase()} category`}
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
          {/* Category Type Toggle (Only when creating new & allowSubcategory is true) */}
          {allowSubcategory && !editingCategory && !parentCategoryIdForSub && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                Category Type
              </label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubcategory(false);
                    setParentCategory("");
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !isSubcategory
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Parent Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubcategory(true);
                    if (!parentCategory) {
                      setParentCategory(
                        categories[0]?._id || categories[0]?.id || ""
                      );
                    }
                  }}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isSubcategory
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Subcategory
                </button>
              </div>
            </div>
          )}

          {/* Parent Category ComboBox Selection (If subcategory) */}
          {isSubcategory && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Parent Category <span className="text-red-500">*</span>
              </label>

              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between font-medium text-gray-800 hover:bg-gray-100/70 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="truncate">
                      {selectedParentObj
                        ? selectedParentObj.name
                        : "Select parent category..."}
                    </span>
                    <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-[60]">
                  {/* Search Header */}
                  <div className="p-2 border-b border-gray-100 relative flex items-center">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {/* Options List */}
                  <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
                    {filteredCategories.map((cat) => {
                      const catId = cat._id || cat.id || "";
                      const isSelected =
                        parentCategory === catId ||
                        parentCategory === cat._id ||
                        parentCategory === cat.id;

                      const handleSelectCategory = (e: React.SyntheticEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setParentCategory(catId);
                        setPopoverOpen(false);
                        setSearchQuery("");
                      };

                      return (
                        <button
                          key={catId}
                          type="button"
                          onPointerDown={handleSelectCategory}
                          onClick={handleSelectCategory}
                          className={`w-full px-3 py-2 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${
                            isSelected
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

                    {filteredCategories.length === 0 && (
                      <p className="p-3 text-center text-xs text-gray-400">
                        No parent categories found
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* Category Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-800">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder={
                isSubcategory ? "e.g. Premier League" : "e.g. Cricket"
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium text-gray-800"
            />
          </div>

          {/* Category Order (Only for main categories, not subcategories) */}
          {!isSubcategory && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-800">
                Order Number <span className="text-xs font-normal text-gray-400">(e.g. 1, 2, 3)</span>
              </label>
              <input
                type="number"
                placeholder="e.g. 1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                disabled={isLoading}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors font-medium text-gray-800"
              />
            </div>
          )}



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
              <span>
                {editingCategory
                  ? "Save Changes"
                  : isSubcategory
                  ? "Create Subcategory"
                  : "Create Category"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
