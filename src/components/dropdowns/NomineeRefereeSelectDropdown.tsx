/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, Check, ChevronDown, X, User } from "lucide-react";
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
  placeholder = "Select official referee...",
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

  const profileImg = selectedReferee
    ? formatImagePath(selectedReferee.profile || selectedReferee.image)
    : null;

  const displayName = selectedReferee
    ? `${selectedReferee.firstName || ""} ${selectedReferee.lastName || ""}`.trim() ||
      selectedReferee.userName ||
      "Referee"
    : "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full h-8 flex items-center justify-between px-2.5 bg-white border rounded-md text-xs transition-all cursor-pointer select-none ${
          isOpen
            ? "border-slate-500 ring-1 ring-slate-400 bg-white"
            : "border-slate-200 hover:border-slate-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedReferee ? (
            <>
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[9px] font-semibold text-slate-600">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="font-medium text-slate-900 truncate">
                {displayName}
              </span>
              {selectedReferee.matchesOfficiatedCount !== undefined && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded font-mono">
                  {selectedReferee.matchesOfficiatedCount} matches
                </span>
              )}
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400">{placeholder}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selectedReferee && !disabled && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[280px] bg-white border border-slate-200 rounded-lg shadow-xl z-[120] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search official referee..."
                className="w-full h-7 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Referee Options List */}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
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
                  r.displayName ||
                  "Referee";
                const img = formatImagePath(r.profile || r.image);

                return (
                  <button
                    key={rId}
                    type="button"
                    onClick={() => {
                      onChange(rId);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors text-xs cursor-pointer ${
                      isSelected
                        ? "bg-slate-50 font-medium text-slate-900"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 text-[10px] text-slate-500 font-semibold">
                        {img ? (
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          fullName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="font-medium truncate">{fullName}</span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {r.email || r.userName || "Official"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.matchesOfficiatedCount !== undefined && (
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 py-0.2 rounded">
                          {r.matchesOfficiatedCount} matches
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-slate-900 shrink-0" />
                      )}
                    </div>
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
