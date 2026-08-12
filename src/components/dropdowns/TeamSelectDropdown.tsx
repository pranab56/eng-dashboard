/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { formatImagePath } from '@/utils/formatImagePath';
import { Building2, Search, Check, ChevronDown, X, Shield } from 'lucide-react';

interface TeamSelectDropdownProps {
  teams: any[];
  selectedTeamId: string;
  onChange: (teamId: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TeamSelectDropdown: React.FC<TeamSelectDropdownProps> = ({
  teams = [],
  selectedTeamId,
  onChange,
  placeholder = "Select a Team...",
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

  const selectedTeam = teams.find((t) => (t._id || t.id) === selectedTeamId);

  const filteredTeams = teams.filter((t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      (t.teamName || '').toLowerCase().includes(q) ||
      (t.shortName || '').toLowerCase().includes(q) ||
      (t.location || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-slate-300 hover:border-indigo-400 rounded-xl text-xs font-semibold text-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 cursor-pointer shadow-xs"
      >
        <div className="flex items-center gap-2 truncate">
          {selectedTeam ? (
            <>
              <div className="relative w-5 h-5 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                {selectedTeam.teamLogo ? (
                  <Image
                    src={formatImagePath(selectedTeam.teamLogo)}
                    alt={selectedTeam.teamName || 'logo'}
                    fill
                    className="object-contain p-0.5"
                  />
                ) : (
                  <Building2 className="w-3 h-3 text-slate-400" />
                )}
              </div>
              <span className="truncate text-slate-900 font-bold">
                {selectedTeam.teamName} {selectedTeam.shortName ? `(${selectedTeam.shortName})` : ''}
              </span>
            </>
          ) : (
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
      </button>

      {/* Dropdown Menu Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full bg-white border border-slate-200 rounded-2xl shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Internal Search Box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team name, acronym..."
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder:text-slate-400"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Team List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-200">
            {/* Unassign Option */}
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-semibold transition-colors cursor-pointer ${
                !selectedTeamId ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="italic text-slate-500">-- No Team Assigned --</span>
              {!selectedTeamId && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>

            {filteredTeams.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs font-medium">
                No matching teams found
              </div>
            ) : (
              filteredTeams.map((team) => {
                const teamId = team._id || team.id;
                const isSelected = selectedTeamId === teamId;

                return (
                  <button
                    key={teamId}
                    type="button"
                    onClick={() => {
                      onChange(teamId);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-950 font-bold'
                        : 'text-slate-800 hover:bg-slate-50 hover:text-indigo-600 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {team.teamLogo ? (
                          <Image
                            src={formatImagePath(team.teamLogo)}
                            alt={team.teamName || 'team'}
                            fill
                            className="object-contain p-0.5"
                          />
                        ) : (
                          <Shield className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="truncate font-semibold">{team.teamName}</p>
                        {team.shortName && (
                          <span className="text-[10px] text-slate-400 font-medium block">
                            {team.shortName}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
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
