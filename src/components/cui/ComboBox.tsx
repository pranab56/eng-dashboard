"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown, Search, Plus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboBoxProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}

export default function ComboBox({
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  searchPlaceholder = "Search or type custom...",
  disabled = false,
}: ComboBoxProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isCustomOption =
    searchQuery.trim().length > 0 &&
    !options.some(
      (opt) => opt.toLowerCase() === searchQuery.trim().toLowerCase()
    );

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm flex items-center justify-between font-medium text-gray-800 hover:bg-gray-100/70 focus:outline-none focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50"
        >
          <span className="truncate">
            {value ? value : placeholder}
          </span>
          <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
        {/* Search Header */}
        <div className="p-2 border-b border-gray-100 relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-100 rounded-md text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Options List */}
        <div className="max-h-56 overflow-y-auto p-1 space-y-0.5">
          {filteredOptions.map((opt) => {
            const isSelected = value.toLowerCase() === opt.toLowerCase();
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full px-3 py-2 text-xs rounded-md flex items-center justify-between transition-colors cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>{opt}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}

          {/* Custom Option */}
          {isCustomOption && (
            <button
              type="button"
              onClick={() => handleSelect(searchQuery.trim())}
              className="w-full px-3 py-2 text-xs rounded-md flex items-center gap-2 text-blue-600 font-semibold hover:bg-blue-50 transition-colors cursor-pointer border-t border-gray-100 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Use &quot;{searchQuery.trim()}&quot;</span>
            </button>
          )}

          {filteredOptions.length === 0 && !isCustomOption && (
            <p className="p-3 text-center text-xs text-gray-400">
              No matching options found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
