/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { UserCheck, Search, Check, ChevronDown, X } from 'lucide-react';
import { formatImagePath } from '@/utils/formatImagePath';
import Image from 'next/image';

interface ManagerSelectDropdownProps {
  managers: any[];
  selectedManagerId: string;
  onChange: (managerId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ManagerSelectDropdown: React.FC<ManagerSelectDropdownProps> = ({
  managers = [],
  selectedManagerId,
  onChange,
  placeholder = "All Managers",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const selectedManager = managers.find(
    (m) => (m._id || m.id) === selectedManagerId
  );

  const getManagerName = (m: any) => {
    if (!m) return '';
    return m.firstName ? `${m.firstName} ${m.lastName || ''}`.trim() : (m.userName || 'Manager');
  };

  const filteredManagers = managers.filter((m) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const name = getManagerName(m).toLowerCase();
    const email = (m.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-indigo-400 rounded-xl text-xs font-semibold text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 cursor-pointer shadow-xs min-w-[170px]"
      >
        <div className="flex items-center gap-2 truncate">
          <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="truncate font-bold text-gray-900">
            {selectedManagerId === "ALL" || !selectedManager
              ? placeholder
              : selectedManagerId === "UNASSIGNED"
              ? "Unassigned Manager"
              : getManagerName(selectedManager)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedManagerId !== "ALL" && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("ALL");
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
              title="Reset manager filter"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </div>
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-64 sm:w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2.5 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search manager name or email..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-gray-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Manager List */}
          <div className="max-h-56 overflow-y-auto p-1.5 divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
            {/* All Managers Option */}
            <button
              type="button"
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                selectedManagerId === "ALL"
                  ? 'bg-indigo-50 text-indigo-950 font-bold'
                  : 'text-gray-700 hover:bg-gray-100 font-medium'
              }`}
            >
              <span className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                All Managers
              </span>
              {selectedManagerId === "ALL" && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            {/* Unassigned Manager Option */}
            <button
              type="button"
              onClick={() => {
                onChange("UNASSIGNED");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                selectedManagerId === "UNASSIGNED"
                  ? 'bg-amber-50 text-amber-950 font-bold'
                  : 'text-gray-700 hover:bg-gray-100 font-medium'
              }`}
            >
              <span className="flex items-center gap-2 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Unassigned (No Manager)
              </span>
              {selectedManagerId === "UNASSIGNED" && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            {filteredManagers.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs font-medium">
                No matching managers found
              </div>
            ) : (
              filteredManagers.map((m) => {
                const mId = m._id || m.id;
                const isSelected = selectedManagerId === mId;
                const name = getManagerName(m);
                const profileImg = formatImagePath(m.profile || m.profilePic);

                return (
                  <button
                    key={mId}
                    type="button"
                    onClick={() => {
                      onChange(mId);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-950 font-bold'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-indigo-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative w-6 h-6 rounded-full bg-indigo-100 border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0">
                        {profileImg ? (
                          <Image src={profileImg} alt={name} fill className="object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-indigo-700">{name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="truncate">
                        <span className="block truncate font-bold text-gray-900">{name}</span>
                        {m.email && <span className="block text-[10px] text-gray-400 truncate">{m.email}</span>}
                      </div>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
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
