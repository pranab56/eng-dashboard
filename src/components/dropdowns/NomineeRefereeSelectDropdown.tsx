/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, Search, Check, ChevronDown, X, Shield } from "lucide-react";
import { formatImagePath } from "@/utils/formatImagePath";

interface NomineeRefereeSelectDropdownProps {
  referees: any[];
  selectedRefereeId: string;
  onChange: (refereeId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const NomineeRefereeSelectDropdown: React.FC<NomineeRefereeSelectDropdownProps> = ({
  referees = [],
  selectedRefereeId,
  onChange,
  disabled = false,
  placeholder = "Select Nominee Referee...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Find selected referee object
  const selectedReferee = useMemo(() => {
    return referees.find(
      (r) => String(r._id || r.id) === String(selectedRefereeId)
    );
  }, [referees, selectedRefereeId]);

  // Filter referees by name, username, or email
  const filteredReferees = useMemo(() => {
    if (!searchTerm.trim()) return referees;
    const q = searchTerm.toLowerCase().trim();
    return referees.filter((r) => {
      const name = `${r.firstName || ""} ${r.lastName || ""}`.toLowerCase();
      const userName = (r.userName || "").toLowerCase();
      const email = (r.email || "").toLowerCase();
      return name.includes(q) || userName.includes(q) || email.includes(q);
    });
  }, [referees, searchTerm]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border rounded-lg text-left text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#800020]/20 ${
          disabled
            ? "bg-slate-50 border-slate-200 cursor-not-allowed text-slate-400"
            : isOpen
            ? "border-[#800020] ring-1 ring-[#800020]"
            : "border-slate-200 hover:border-slate-300 text-slate-800"
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          {selectedReferee ? (
            <>
              <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 overflow-hidden flex items-center justify-center shrink-0">
                {selectedReferee.profile ? (
                  <img
                    src={formatImagePath(selectedReferee.profile)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                )}
              </div>
              <div className="truncate flex flex-col">
                <span className="font-semibold text-xs text-slate-800 truncate">
                  {`${selectedReferee.firstName || ""} ${selectedReferee.lastName || ""}`.trim() ||
                    selectedReferee.userName ||
                    "Referee"}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {selectedReferee.email || selectedReferee.userName || "Official"}
                </span>
              </div>
            </>
          ) : (
            <span className="text-slate-400 text-xs">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedReferee && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search official referee..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-[#800020] text-slate-700"
              />
            </div>
          </div>

          {/* Referee Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-slate-50">
            {filteredReferees.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No official referees found.
              </div>
            ) : (
              filteredReferees.map((r) => {
                const rId = String(r._id || r.id);
                const isSelected = rId === String(selectedRefereeId);
                const fullName =
                  `${r.firstName || ""} ${r.lastName || ""}`.trim() ||
                  r.userName ||
                  "Referee";

                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => {
                      onChange(rId);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? "bg-[#800020]/5 text-[#800020]"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {r.profile ? (
                          <img
                            src={formatImagePath(r.profile)}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-amber-700" />
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-semibold text-xs truncate">
                          {fullName}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                          <span>{r.email || r.userName || "Official"}</span>
                          {r.matchesOfficiatedCount !== undefined && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-medium">
                                {r.matchesOfficiatedCount} matches
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#800020] shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
