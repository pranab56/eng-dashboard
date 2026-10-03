"use client";

import { ChevronDown, Search, ArrowLeftRight, Shield } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import { formatImagePath } from "../../../../utils/formatImagePath";

export interface Team {
  value: string;
  name: string;
  logo: string | null;
}

// Sub-component for individual Team Selection Card
export const TeamCard = ({
  label,
  role = "home",
  selectedTeam,
  onSelect,
  teams,
}: {
  label: string;
  role?: "home" | "away";
  selectedTeam: Team | null;
  teams: Team[];
  onSelect: (team: Team) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Focus search input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }
  }, [open]);

  // Filtered teams list based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    const q = searchQuery.toLowerCase().trim();
    return teams.filter((t) => t.name.toLowerCase().includes(q));
  }, [teams, searchQuery]);

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 sm:p-5 flex flex-col items-center justify-between shadow-2xs relative">
      {/* Top Header Badge */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
            role === "home"
              ? "bg-slate-100 text-slate-800 border-slate-200"
              : "bg-slate-100 text-slate-700 border-slate-200"
          }`}
        >
          {role === "home" ? "Home" : "Away"}
        </span>
      </div>

      {/* Team Crest / Logo Display */}
      <div className="my-4 flex flex-col items-center">
        <div className="w-20 h-20 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center p-2.5 relative shadow-2xs">
          {selectedTeam?.logo ? (
            <Image
              src={formatImagePath(selectedTeam.logo)}
              alt={selectedTeam.name}
              width={64}
              height={64}
              className="object-contain max-h-full max-w-full"
            />
          ) : selectedTeam ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
              {selectedTeam.name.slice(0, 2)}
            </div>
          ) : (
            <Shield className="w-8 h-8 text-slate-300 stroke-[1.5]" />
          )}
        </div>

        {/* Selected Team Name */}
        <p className="text-sm font-semibold text-slate-900 text-center truncate max-w-[200px] h-5 mt-1">
          {selectedTeam ? selectedTeam.name : "No team selected"}
        </p>
      </div>

      {/* Dropdown Selector */}
      <div className="relative w-full" ref={ref}>
        {teams.length === 0 ? (
          <div className="w-full h-9 px-3 rounded-md bg-slate-100 border border-slate-200 text-slate-400 text-xs flex items-center justify-center font-medium">
            No teams available
          </div>
        ) : (
          <>
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className={`w-full h-9 flex items-center justify-between px-3 bg-white border rounded-md text-xs font-medium transition-colors cursor-pointer select-none ${
                open
                  ? "border-slate-500 ring-2 ring-slate-900/5"
                  : "border-slate-200 hover:border-slate-300 text-slate-800"
              }`}
            >
              <span className="truncate pr-2">
                {selectedTeam ? selectedTeam.name : "Select team..."}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${
                  open ? "rotate-180 text-slate-600" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute z-50 mt-1.5 w-full bg-white rounded-lg shadow-xl border border-slate-200 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                {/* Search Input */}
                <div className="relative mb-1 px-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team..."
                    className="w-full h-8 pl-8 pr-2 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>

                {/* Team Options */}
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-0.5">
                  {filteredTeams.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      No matching teams
                    </div>
                  ) : (
                    filteredTeams.map((team) => {
                      const isSelected = selectedTeam?.value === team.value;
                      return (
                        <button
                          key={team.value}
                          type="button"
                          onClick={() => {
                            onSelect(team);
                            setOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-slate-100 text-slate-900 font-semibold"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                            {team.logo ? (
                              <Image
                                src={formatImagePath(team.logo)}
                                alt={team.name}
                                width={22}
                                height={22}
                                className="object-contain"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-400">
                                {team.name?.[0] || "?"}
                              </span>
                            )}
                          </div>
                          <span className="truncate flex-1">{team.name}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Full Matchup Selector Component with Home, VS / Swap, and Away
interface MatchupSelectorProps {
  homeTeam: Team | null;
  awayTeam: Team | null;
  homeTeamOptions: Team[];
  awayTeamOptions: Team[];
  onSelectHome: (team: Team) => void;
  onSelectAway: (team: Team) => void;
  onSwapTeams?: () => void;
}

export const MatchupSelector = ({
  homeTeam,
  awayTeam,
  homeTeamOptions,
  awayTeamOptions,
  onSelectHome,
  onSelectAway,
  onSwapTeams,
}: MatchupSelectorProps) => {
  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-4">
      {/* Home Team Card */}
      <TeamCard
        label="Home Fixture"
        role="home"
        selectedTeam={homeTeam}
        onSelect={onSelectHome}
        teams={homeTeamOptions}
      />

      {/* VS & Swap Action in center */}
      <div className="flex flex-row md:flex-col items-center justify-center gap-2 shrink-0 py-2">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-2xs select-none">
          VS
        </div>

        {onSwapTeams && (
          <button
            type="button"
            onClick={onSwapTeams}
            disabled={!homeTeam && !awayTeam}
            className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
            title="Swap Home and Away teams"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Away Team Card */}
      <TeamCard
        label="Away Fixture"
        role="away"
        selectedTeam={awayTeam}
        onSelect={onSelectAway}
        teams={awayTeamOptions}
      />
    </div>
  );
};

export default MatchupSelector;
