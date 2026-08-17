/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Check, ChevronDown, X } from 'lucide-react';

interface PositionSelectDropdownProps {
  positions: string[];
  selectedPosition: string;
  onChange: (pos: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PositionSelectDropdown: React.FC<PositionSelectDropdownProps> = ({
  positions = [],
  selectedPosition,
  onChange,
  placeholder = "All Positions",
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
        className="flex items-center justify-between gap-2 px-3.5 py-2 bg-slate-50/80 hover:bg-white border border-gray-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 cursor-pointer shadow-2xs min-w-[150px]"
      >
        <div className="flex items-center gap-2 truncate">
          <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate font-bold text-slate-900">
            {selectedPosition === "ALL" || !selectedPosition ? placeholder : selectedPosition}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedPosition !== "ALL" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("ALL");
              }}
              className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Reset position filter"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 max-h-64 bg-white border border-gray-200 rounded-2xl shadow-xl z-[150] overflow-y-auto animate-in fade-in zoom-in-95 duration-150 p-1.5 space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Select Position
          </div>

          {/* All Positions */}
          <button
            type="button"
            onClick={() => {
              onChange("ALL");
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
              selectedPosition === "ALL"
                ? 'bg-slate-900 text-white font-bold'
                : 'text-slate-700 hover:bg-slate-100 font-medium'
            }`}
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              All Positions
            </span>
            {selectedPosition === "ALL" && <Check className="w-3.5 h-3.5 text-white" />}
          </button>

          {positions.map((pos) => {
            const isSelected = selectedPosition.toLowerCase() === pos.toLowerCase();
            return (
              <button
                key={pos}
                type="button"
                onClick={() => {
                  onChange(pos);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <span>{pos}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
