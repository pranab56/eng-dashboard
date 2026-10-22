/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { User, Search, Check, ChevronDown, X } from "lucide-react";
import { formatImagePath } from "@/utils/formatImagePath";

interface NomineePlayerSelectDropdownProps {
  players: any[];
  selectedPlayerId: string;
  onChange: (playerId: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const NomineePlayerSelectDropdown: React.FC<NomineePlayerSelectDropdownProps> = ({
  players = [],
  selectedPlayerId,
  onChange,
  disabled = false,
  placeholder = "Select Nominee Player...",
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

  // Find selected player object
  const selectedPlayer = useMemo(() => {
    return players.find(
      (p) => String(p._id || p.id) === String(selectedPlayerId)
    );
  }, [players, selectedPlayerId]);

  // Filter players by name, position, or team
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return players;
    const q = searchTerm.toLowerCase().trim();
    return players.filter((p) => {
      const name = `${p.firstName || ""} ${p.lastName || ""}`.toLowerCase();
      const userName = (p.userName || "").toLowerCase();
      const pos = (p.position || "").toLowerCase();
      const team = (p.selectTeam?.teamName || "").toLowerCase();
      return (
        name.includes(q) ||
        userName.includes(q) ||
        pos.includes(q) ||
        team.includes(q)
      );
    });
  }, [players, searchTerm]);

  const profileImg = selectedPlayer
    ? formatImagePath(selectedPlayer.profile || selectedPlayer.image)
    : null;

  const displayName = selectedPlayer
    ? `${selectedPlayer.firstName || ""} ${selectedPlayer.lastName || ""}`.trim() ||
      selectedPlayer.userName ||
      "Player"
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
          {selectedPlayer ? (
            <>
              <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[9px] font-semibold text-slate-600">
                {profileImg ? (
                  <img
                    src={profileImg}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <span className="font-medium text-slate-900 truncate">
                {displayName}
              </span>
              {selectedPlayer.position && (
                <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded font-mono">
                  {selectedPlayer.position}
                </span>
              )}
              {selectedPlayer.selectTeam?.teamName && (
                <span className="text-[10px] text-slate-400 truncate">
                  • {selectedPlayer.selectTeam.teamName}
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

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-full min-w-[280px] bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Bar */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search player, team, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-6 rounded border border-slate-200 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 bg-white"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Players */}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredPlayers.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                No players found matching "{searchTerm}"
              </div>
            ) : (
              filteredPlayers.map((player) => {
                const pId = String(player._id || player.id);
                const isSelected = String(selectedPlayerId) === pId;
                const pName =
                  `${player.firstName || ""} ${player.lastName || ""}`.trim() ||
                  player.userName ||
                  "Player";
                const pImg = formatImagePath(player.profile || player.image);

                return (
                  <button
                    key={pId}
                    type="button"
                    onClick={() => {
                      onChange(pId);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded text-left transition-colors cursor-pointer text-xs ${
                      isSelected
                        ? "bg-slate-100/90 text-slate-900 font-medium"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                        {pImg ? (
                          <img
                            src={pImg}
                            alt={pName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          pName.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{pName}</span>
                          {player.position && (
                            <span className="text-[10px] text-slate-500 bg-slate-100 px-1 py-0.2 rounded font-mono">
                              {player.position}
                            </span>
                          )}
                        </div>
                        {player.selectTeam?.teamName && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {player.selectTeam.teamName}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-slate-900 shrink-0 ml-2" />
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
