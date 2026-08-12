/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Trophy, Search, Check, ChevronDown, X } from 'lucide-react';

interface LeagueSelectDropdownProps {
  leagues: any[];
  selectedLeagueId: string;
  onChange: (leagueId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const LeagueSelectDropdown: React.FC<LeagueSelectDropdownProps> = ({
  leagues = [],
  selectedLeagueId,
  onChange,
  placeholder = "All Leagues",
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

  const selectedLeague = leagues.find(
    (l) => (l._id || l.id) === selectedLeagueId
  );

  const filteredLeagues = leagues.filter((l) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (l.leagueName || l.name || '').toLowerCase().includes(q);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-gray-50 hover:bg-white border border-gray-200 hover:border-amber-400 rounded-xl text-xs font-semibold text-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 cursor-pointer shadow-xs min-w-[170px]"
      >
        <div className="flex items-center gap-2 truncate">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="truncate font-bold text-gray-900">
            {selectedLeagueId === "ALL" || !selectedLeague
              ? placeholder
              : selectedLeague.leagueName || selectedLeague.name}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {selectedLeagueId !== "ALL" && selectedLeague && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange("ALL");
              }}
              className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 cursor-pointer"
              title="Reset league filter"
            >
              <X className="w-3 h-3" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-600' : ''
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
                placeholder="Search league name..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium placeholder:text-gray-400"
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

          {/* Scrollable League List */}
          <div className="max-h-56 overflow-y-auto p-1.5 divide-y divide-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
            {/* All Leagues Option */}
            <button
              type="button"
              onClick={() => {
                onChange("ALL");
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                selectedLeagueId === "ALL"
                  ? 'bg-amber-50 text-amber-950 font-bold'
                  : 'text-gray-700 hover:bg-gray-100 font-medium'
              }`}
            >
              <span className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                All Leagues
              </span>
              {selectedLeagueId === "ALL" && <Check className="w-3.5 h-3.5 text-amber-600" />}
            </button>

            {filteredLeagues.length === 0 ? (
              <div className="py-6 text-center text-gray-400 text-xs font-medium">
                No matching leagues found
              </div>
            ) : (
              filteredLeagues.map((lg) => {
                const lgId = lg._id || lg.id;
                const isSelected = selectedLeagueId === lgId;

                return (
                  <button
                    key={lgId}
                    type="button"
                    onClick={() => {
                      onChange(lgId);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 text-amber-950 font-bold'
                        : 'text-gray-800 hover:bg-gray-50 hover:text-amber-700 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-5 h-5 rounded-md bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                        <Trophy className="w-3 h-3 text-amber-600" />
                      </div>
                      <span className="truncate">{lg.leagueName || lg.name}</span>
                    </div>

                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
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
