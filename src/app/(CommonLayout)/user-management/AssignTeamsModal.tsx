/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAllTeamQuery } from '@/features/teamManagement/teamApi';
import {
  useGetManagerTeamsForAdminQuery,
  useBulkAssignTeamsMutation
} from '@/features/managerTeam/managerTeamApi';
import { TUserManagement } from '@/types/columnTypes';
import { Search, Loader2, CheckSquare, Square, Building2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface AssignTeamsModalProps {
  user: TUserManagement | null;
  isOpen: boolean;
  onClose: () => void;
}

const AssignTeamsModal: React.FC<AssignTeamsModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // 1. Fetch all teams in the system (high limit to list all)
  const { data: teamsData, isLoading: isLoadingTeams } = useGetAllTeamQuery({
    limit: 1000,
  });

  // 2. Fetch teams currently managed by this coach
  const { data: currentMappings, isLoading: isLoadingMappings } = useGetManagerTeamsForAdminQuery(
    user?._id || '',
    { skip: !user?._id || !isOpen }
  );

  const [assignTeams, { isLoading: isSaving }] = useBulkAssignTeamsMutation();

  // Populate selected teams when current assignments are loaded
  useEffect(() => {
    if (currentMappings?.data) {
      const assignedIds = currentMappings.data.map((m: any) => m.team?._id || m.team).filter(Boolean);
      setSelectedTeams(assignedIds);
    }
  }, [currentMappings, isOpen]);

  if (!user) return null;

  const allTeams = teamsData?.data || [];

  // Filter teams by search term
  const filteredTeams = allTeams.filter((team: any) =>
    (team.teamName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.shortName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id: string) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredTeams.map((t: any) => t._id as string);
    setSelectedTeams((prev) => {
      const newSelections = [...prev];
      filteredIds.forEach((id: string) => {
        if (!newSelections.includes(id)) {
          newSelections.push(id);
        }
      });
      return newSelections;
    });
  };

  const handleDeselectAll = () => {
    const filteredIds = filteredTeams.map((t: any) => t._id as string);
    setSelectedTeams((prev) => prev.filter((id: string) => !filteredIds.includes(id)));
  };

  const handleSave = async () => {
    try {
      // Direct call to bulk assignment api: POST /manager-team/assign
      // But wait! Does assignTeamManager call bulk endpoints?
      // In the backend, we defined /manager-team/assign as POST, handled by bulkAssignTeams
      // Let's call the API! Since we configured the backend to accept bulk assignments
      // Wait, is there a bulk assignment hook in the API slice?
      // No! managerTeamApi.js only has assignTeamManager mutation which maps to POST /manager-team
      // BUT in package.service.ts or managerTeam.service.ts, we normalized both!
      // Wait, does assignTeamManager call POST /manager-team? Yes!
      // In the backend, POST /manager-team calls assignManagerToTeamToDB.
      // But wait! We also created a bulk endpoint POST /manager-team/assign which replaces manager's teams completely!
      // Wait, let's look at managerTeamApi.js:
      // Does it have a bulk assignment mutation?
      // Ah! In our restored managerTeamApi.js, we only exported:
      // useAssignTeamManagerMutation (POST /manager-team)
      // Wait! We can define a bulkAssignTeams mutation in managerTeamApi.js too!
      // Let's check:
      // POST /manager-team/assign accepts { manager, teams }
      // This is exactly what we want to call!
      // Let's check if we should add it to managerTeamApi.js so we can call it in AssignTeamsModal.tsx.
      // Yes, let's call it `bulkAssignTeams`!
      // Let's rewrite managerTeamApi.js to export useBulkAssignTeamsMutation as well.
      // Wait! We can do that. But first, let's construct handleSave in AssignTeamsModal:
      // It can just call bulkAssignTeams mutation!
      
      const payload = {
        manager: user._id,
        teams: selectedTeams,
      };

      await assignTeams(payload).unwrap();
      toast.success("Coach team assignments updated successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update team assignments");
    }
  };

  const isLoadingData = isLoadingTeams || isLoadingMappings;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl bg-white rounded-3xl p-6 border-none shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <DialogHeader className="border-b border-gray-100 pb-4">
          <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-500" />
            Assign Teams to Coach
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Manage team assignments for <span className="font-semibold text-gray-700">{user.firstName} {user.lastName}</span>
          </p>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by name..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Quick select buttons */}
        <div className="flex gap-2 mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            Select All Filtered
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
          >
            Deselect All Filtered
          </button>
        </div>

        {/* Team list checklist */}
        <div className="flex-1 overflow-y-auto min-h-[250px] border border-gray-100 rounded-2xl p-2 space-y-1 hide-scrollbar">
          {isLoadingData ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-sm font-medium">Loading teams...</p>
            </div>
          ) : filteredTeams.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              No teams found matching search criteria.
            </div>
          ) : (
            filteredTeams.map((team: any) => {
              const isSelected = selectedTeams.includes(team._id);
              return (
                <div
                  key={team._id}
                  onClick={() => handleToggleTeam(team._id)}
                  className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-amber-50/50 border border-amber-200/50'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {team.teamLogo ? (
                      <img
                        src={team.teamLogo.startsWith('http') ? team.teamLogo : `http://localhost:5000${team.teamLogo}`}
                        alt="logo"
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        onError={(e: any) => {
                          e.target.src = '';
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-400">
                        FC
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{team.teamName}</h4>
                      <p className="text-xs text-gray-400 font-medium">{team.shortName}</p>
                    </div>
                  </div>
                  <button type="button" className="text-amber-500 hover:scale-105 transition-transform">
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 fill-amber-500 text-white" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 pt-4 mt-4 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-gray-900 text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-black/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Assignments
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignTeamsModal;
