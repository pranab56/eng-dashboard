"use client";

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { formatImagePath } from '../../../../utils/formatImagePath';
import { Team } from './CreateMatch';

// Sub-component for the Individual Team Selection
export const TeamCard = ({
  label,
  selectedTeam,
  onSelect,
  teams,
}: {
  label: string;
  selectedTeam: Team | null;
  teams: Team[];
  onSelect: (team: Team) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col items-center bg-gray-100 p-8 rounded-3xl w-full md:w-72">
      <span className="text-gray-500 font-medium mb-6 tracking-wide">{label}</span>

      {/* Logo Container */}
      <div className="bg-white p-2 rounded-3xl shadow-sm mb-8 w-40 h-40 flex items-center justify-center relative overflow-hidden">
        {selectedTeam?.logo ? (
          <Image
            src={formatImagePath(selectedTeam.logo)}
            alt={selectedTeam.name}
            width={120}
            height={120}
            className="object-contain transition-opacity duration-300 rounded-3xl"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-3xl">
            <span className="text-3xl font-black text-gray-300">
              {selectedTeam?.name?.[0] || '?'}
            </span>
          </div>
        )}
      </div>

      {/* Team Name */}
      {selectedTeam && (
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">{selectedTeam.name}</p>
      )}

      {/* Custom Styled Dropdown */}
      <div className="relative w-full" ref={ref}>
        {teams.length === 0 ? (
          <div className="w-full py-3 px-4 rounded-xl bg-gray-200 text-gray-400 text-sm text-center font-medium">
            No teams available
          </div>
        ) : (
          <>
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setOpen(prev => !prev)}
              className="w-full flex items-center justify-between bg-white py-3 px-4 rounded-xl text-gray-800 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer transition-all"
            >
              <span className={selectedTeam ? "text-gray-800" : "text-gray-400"}>
                {selectedTeam ? selectedTeam.name : "Select team"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Panel */}
            {open && (
              <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 max-h-56 overflow-y-auto">
                {teams.map((team) => (
                  <button
                    key={team.value}
                    type="button"
                    onClick={() => {
                      onSelect(team);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 cursor-pointer
                      ${selectedTeam?.value === team.value ? "bg-gray-100 font-semibold text-gray-900" : "text-gray-700"}`}
                  >
                    {/* Mini Logo */}
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {team.logo ? (
                        <Image
                          src={formatImagePath(team.logo)}
                          alt={team.name}
                          width={28}
                          height={28}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-400">{team.name?.[0]}</span>
                      )}
                    </div>
                    <span>{team.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
