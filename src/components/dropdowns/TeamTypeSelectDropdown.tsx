/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Layers, Check, ChevronDown, X } from 'lucide-react';

interface TeamTypeSelectDropdownProps {
  types: string[];
  selectedType: string;
  onChange: (type: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TeamTypeSelectDropdown: React.FC<TeamTypeSelectDropdownProps> = ({
  types = ["Football", "Cricket"],
  selectedType,
  onChange,
  placeholder = "All Team Types",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
        className="flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-400 rounded-xl text-xs font-semibold text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer shadow-xs min-w-[140px]"
      >
        <div className="flex items-center gap-1.5 truncate">
          <Layers className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate font-bold text-gray-900">
            {selectedType === "ALL" || !selectedType ? placeholder : selectedType}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedType !== "ALL" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("ALL");
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
              title="Reset type filter"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
          {/* All Types Option */}
          <button
            type="button"
            onClick={() => {
              onChange("ALL");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
              selectedType === "ALL"
                ? 'bg-blue-50 text-blue-950 font-bold'
                : 'text-gray-700 hover:bg-gray-100 font-medium'
            }`}
          >
            <span className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              All Team Types
            </span>
            {selectedType === "ALL" && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </button>

          {types.map((type) => {
            const isSelected = selectedType.toLowerCase() === type.toLowerCase();
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  onChange(type);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-950 font-bold'
                    : 'text-gray-800 hover:bg-gray-50 hover:text-blue-700 font-medium'
                }`}
              >
                <span>{type}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
