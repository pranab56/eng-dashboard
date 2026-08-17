/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';

interface SortSelectDropdownProps {
  sortBy: string;
  onChange: (sort: string) => void;
  disabled?: boolean;
}

export const SortSelectDropdown: React.FC<SortSelectDropdownProps> = ({
  sortBy,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name_asc', label: 'Name (A to Z)' },
    { value: 'name_desc', label: 'Name (Z to A)' },
    { value: 'coins_desc', label: 'Coins (High to Low)' },
    { value: 'coins_asc', label: 'Coins (Low to High)' },
  ];

  const selectedOpt = sortOptions.find(o => o.value === sortBy) || sortOptions[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50/80 hover:bg-white border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer shadow-2xs min-w-[160px]"
      >
        <div className="flex items-center gap-2 truncate">
          <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate font-bold text-slate-900">
            Sort: {selectedOpt.label}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Sort Options
          </div>

          {sortOptions.map((opt) => {
            const isSelected = sortBy === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
