import React from 'react';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react'; // Optional: for the dropdown icon
import { Team } from './CreateMatch';




// Sub-component for the Individual Team Selection
export const TeamCard = ({ label, selectedTeam, onSelect, teams }: { 
  label: string, 
  selectedTeam: Team, 
  teams: Team[],
  onSelect: (team: Team) => void 
}) => {
  return (
    <div className="flex flex-col items-center bg-gray-100 p-8 rounded-3xl w-full md:w-72">
      <span className="text-gray-500 font-bold mb-6 tracking-wide">{label}</span>
      
      {/* Logo Container */}
      <div className="bg-white p-2 rounded-3xl shadow-sm mb-8 w-40 h-40 flex items-center justify-center relative overflow-hidden">
        <Image 
          src={selectedTeam.logo} 
          alt={selectedTeam.name} 
          width={120} 
          height={120} 
          className="object-contain transition-opacity duration-300 rounded-3xl"
        />
      </div>

      {/* Custom Styled Select Container */}
      <div className="relative w-full">
        <select 
          value={selectedTeam.value}
          onChange={(e) => {
            const team = teams.find(t => t.value === e.target.value);
            if (team) onSelect(team);
          }}
          className="w-full appearance-none bg-white py-3 px-4 rounded-xl text-gray-800 font-bold shadow-sm focus:outline-none cursor-pointer pr-10"
        >
          {teams.map((team) => (
            <option key={team.value} value={team.value}>
              {team.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <ChevronDown className="w-5 h-5 text-gray-800" />
        </div>
      </div>
    </div>
  );
};
