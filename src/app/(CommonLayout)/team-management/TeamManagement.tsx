/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import CreateButton from '@/components/buttons/CreateButton';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import CustomPagination from '@/components/cui/CustomPagination';
import CustomTable from '@/components/table/CustomTable';
import TableTitle from '@/components/titles/TableTitle';
import { useDeleteTeamMutation, useGetAllTeamQuery, useUpdateTeamCoinBudgetMutation } from '@/features/teamManagement/teamApi';
import { useGetAllLeagueQuery } from '@/features/leagueManagement/leagueApi';
import { useGetAllManagerTeamQuery } from '@/features/managerTeam/managerTeamApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getTeamColumns } from '@/tableColumns/teamColumns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import TeamViewModal from './TeamViewModal';
import { UpdateCoinModal } from '@/components/modals/UpdateCoinModal';
import { Search, X, RotateCcw } from 'lucide-react';
import { LeagueSelectDropdown } from '@/components/dropdowns/LeagueSelectDropdown';
import { ManagerSelectDropdown } from '@/components/dropdowns/ManagerSelectDropdown';
import { TeamTypeSelectDropdown } from '@/components/dropdowns/TeamTypeSelectDropdown';

const TeamManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("teamPage") || "1";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("ALL");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("ALL");
  const [selectedTeamType, setSelectedTeamType] = useState<string>("ALL");

  const { data: teamData, isLoading } = useGetAllTeamQuery({
    page,
    limit: 10,
    searchTerm,
  });

  const { data: leagueData } = useGetAllLeagueQuery({ limit: 100 });
  const allLeagues = leagueData?.data?.result || leagueData?.data || [];

  const { data: managersData } = useGetAllManagerTeamQuery(undefined);
  const allManagers = managersData?.data || [];

  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();
  const [updateTeamCoinBudget, { isLoading: isUpdatingCoin }] = useUpdateTeamCoinBudgetMutation();

  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [coinTargetTeam, setCoinTargetTeam] = useState<any | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Teams",
      des: "Manage and monitor registered squads, league associations, and team identities."
    });
  }, [setHeaders]);

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleEditCoin = (team: any) => {
    setCoinTargetTeam(team);
    setIsCoinModalOpen(true);
  };

  const handleConfirmUpdateCoin = async (coinValue: number) => {
    if (!coinTargetTeam?._id) {
      toast.error("Team ID not found");
      return;
    }
    try {
      await updateTeamCoinBudget({
        id: coinTargetTeam._id,
        data: { coin: coinValue },
      }).unwrap();
      toast.success("Team coin updated successfully");
      setIsCoinModalOpen(false);
      setCoinTargetTeam(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update team coin");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteTeam(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Team deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete team");
    }
  };

  const handleResetAllFilters = () => {
    setSelectedLeagueId("ALL");
    setSelectedManagerId("ALL");
    setSelectedTeamType("ALL");
    setSearchTerm("");
  };

  const hasActiveFilters =
    selectedLeagueId !== "ALL" ||
    selectedManagerId !== "ALL" ||
    selectedTeamType !== "ALL" ||
    searchTerm.trim() !== "";

  // Available unique team types
  const uniqueTeamTypes = useMemo(() => {
    const rawList = teamData?.data || [];
    const typesSet = new Set<string>(["Football", "Cricket"]);
    rawList.forEach((t: any) => {
      if (t.teamType) typesSet.add(t.teamType);
    });
    return Array.from(typesSet);
  }, [teamData]);

  const filteredTeams = useMemo(() => {
    const list = teamData?.data || [];
    return list.filter((t: any) => {
      // 1. Filter by League
      if (selectedLeagueId !== "ALL") {
        const directLeagueId = t.league?._id || t.league || t.leagueId;
        const matchesDirect = directLeagueId === selectedLeagueId;
        const matchesArray = Array.isArray(t.leagues) && t.leagues.some((l: any) => (l?._id || l?.id || l) === selectedLeagueId);
        if (!matchesDirect && !matchesArray) return false;
      }

      // 2. Filter by Manager
      if (selectedManagerId !== "ALL") {
        if (selectedManagerId === "UNASSIGNED") {
          const hasManagers = (Array.isArray(t.managers) && t.managers.length > 0) || Boolean(t.manager);
          if (hasManagers) return false;
        } else {
          const managersArray = Array.isArray(t.managers)
            ? t.managers
            : t.managers
            ? [t.managers]
            : t.manager
            ? [t.manager]
            : [];

          const matchesManager = managersArray.some((m: any) => {
            const mId = m?._id || m?.id || m?.manager?._id || m?.manager || m;
            return mId === selectedManagerId;
          });

          if (!matchesManager) return false;
        }
      }

      // 3. Filter by Team Type
      if (selectedTeamType !== "ALL") {
        const typeMatch = (t.teamType || "").toLowerCase() === selectedTeamType.toLowerCase();
        if (!typeMatch) return false;
      }

      // 4. Filter by Search Query
      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase().trim();
      return (
        (t.teamName || "").toLowerCase().includes(q) ||
        (t.stadiumName || t.stadium || "").toLowerCase().includes(q) ||
        (t.shortName || "").toLowerCase().includes(q) ||
        (t.city || t.location || "").toLowerCase().includes(q) ||
        (t.country || "").toLowerCase().includes(q)
      );
    });
  }, [teamData, searchTerm, selectedLeagueId, selectedManagerId, selectedTeamType]);

  const items = [
    {
      title: "Total Teams",
      value: teamData?.pagination?.total || (teamData?.data || []).length,
      id: "table1",
      description: "Total registered squads in database"
    },
    {
      title: "Available Leagues",
      value: allLeagues.length,
      id: "table2",
      description: "Registered competition tiers"
    }
  ];

  return (
    <div className='py-10 px-8 space-y-6 pb-16'>
      <div className='flex flex-col md:flex-row items-end gap-4'>
        <div className='w-full md:w-9/12'>
          <GeneralStateCard items={items} className='grid-cols-1 sm:grid-cols-2' />
        </div>
        <div className='w-full md:w-3/12'>
          <Link href="/team-management/budget_economay" className='w-full block'>
            <CreateButton text="Edit Club Budget & Economy" className='py-4 w-full justify-center' />
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-100 py-4 flex flex-col">
        <div className='flex-1'>
          <div className="flex flex-col xl:flex-row xl:items-center justify-between px-6 py-2 gap-4 border-b border-gray-100 pb-4">
            <TableTitle payload={{ title: "Squad Registry" }} />

            {/* Search & Filter Toolbar */}
            <div className='flex flex-wrap items-center gap-2.5'>
              {/* League Filter Dropdown */}
              <LeagueSelectDropdown
                leagues={allLeagues}
                selectedLeagueId={selectedLeagueId}
                onChange={(lgId) => setSelectedLeagueId(lgId)}
                placeholder="All Leagues"
              />

              {/* Manager Filter Dropdown */}
              <ManagerSelectDropdown
                managers={allManagers}
                selectedManagerId={selectedManagerId}
                onChange={(mgrId) => setSelectedManagerId(mgrId)}
                placeholder="All Managers"
              />

              {/* Team Type Filter Dropdown */}
              <TeamTypeSelectDropdown
                types={uniqueTeamTypes}
                selectedType={selectedTeamType}
                onChange={(type) => setSelectedTeamType(type)}
                placeholder="All Types"
              />

              {/* Search Box */}
              <div className="relative w-56 sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search squad, city..."
                  className="w-full pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Reset all applied filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}

              <Link href="/team-management/add-team">
                <CreateButton text="Add Team" />
              </Link>
            </div>
          </div>

          <div className="pt-4">
            <CustomTable<any> columns={getTeamColumns(handleView, handleDelete, handleEditCoin)} data={filteredTeams} isLoading={isLoading} />
          </div>
        </div>

        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={teamData?.pagination?.totalPage || 1} qryName="teamPage" />
        </div>
      </div>

      <TeamViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        team={selectedTeam}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Team Deletion"
        description="Are you sure you want to delete this team? All associated squad data will be removed."
      />

      <UpdateCoinModal
        isOpen={isCoinModalOpen}
        onClose={() => {
          setIsCoinModalOpen(false);
          setCoinTargetTeam(null);
        }}
        onConfirm={handleConfirmUpdateCoin}
        title="Update Team Coin"
        entityName={coinTargetTeam?.teamName}
        initialValue={coinTargetTeam?.coin ?? 0}
        isLoading={isUpdatingCoin}
      />
    </div>
  );
};

export default TeamManagement;