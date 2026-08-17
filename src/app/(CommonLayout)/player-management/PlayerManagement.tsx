"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useHeaders } from '@/hooks/useHeaders';
import { getPlayerColumns } from '@/modules/players';
import { TPlayer } from '@/types/columnTypes';
import { useEffect, useState, useMemo } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

import { useDeletePlayerMutation, useGetAllPlayerQuery, useUpdateEngCoinBudgetMutation } from '@/features/player/playerApi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CreateButton from '../../../components/buttons/CreateButton';
import PlayerViewModal from './PlayerViewModal';
import PlayerEditModal from './PlayerEditModal';
import { UpdateCoinModal } from '@/components/modals/UpdateCoinModal';
import DeleteConfirmationModal from '../user-management/DeleteConfirmationModal';
import { AgeGroupSelectDropdown } from '@/components/dropdowns/AgeGroupSelectDropdown';
import { PositionSelectDropdown } from '@/components/dropdowns/PositionSelectDropdown';
import { SortSelectDropdown } from '@/components/dropdowns/SortSelectDropdown';

const PlayerManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('ALL');
  const [selectedPosition, setSelectedPosition] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  const queryParams = useMemo(() => ({
    pageNumber: Number(pageNumber),
    limit: 10,
    ...(searchTerm.trim() && { searchValue: searchTerm.trim() }),
    ...(selectedAgeGroup !== 'ALL' && { ageGroup: selectedAgeGroup }),
    ...(selectedPosition !== 'ALL' && { position: selectedPosition }),
    ...(sortBy !== 'newest' && { sort: sortBy }),
  }), [pageNumber, searchTerm, selectedAgeGroup, selectedPosition, sortBy]);

  const { data: playerData, isLoading } = useGetAllPlayerQuery(queryParams);

  // Fetch all players for dynamic age groups & positions calculation
  const { data: allPlayersData } = useGetAllPlayerQuery({ limit: 1000 });
  const allPlayersList = useMemo(() => allPlayersData?.data?.players || playerData?.data?.players || [], [allPlayersData, playerData]);

  // Dynamically compute unique age groups
  const dynamicAgeGroups = useMemo(() => {
    const defaultGroups = ["U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18"];
    const groupsSet = new Set<string>(defaultGroups);

    allPlayersList.forEach((p: any) => {
      if (p?.ageGroup && typeof p.ageGroup === 'string') {
        const val = p.ageGroup.trim();
        if (val) groupsSet.add(val);
      }
    });

    return Array.from(groupsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10);
      const numB = parseInt(b.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
  }, [allPlayersList]);

  // Dynamically compute unique positions
  const dynamicPositions = useMemo(() => {
    const defaultPositions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger"];
    const posSet = new Set<string>(defaultPositions);

    allPlayersList.forEach((p: any) => {
      if (p?.position && typeof p.position === 'string') {
        const val = p.position.trim();
        if (val) posSet.add(val);
      }
    });

    return Array.from(posSet);
  }, [allPlayersList]);

  const [updateEngCoinBudget, { isLoading: isUpdatingCoin }] = useUpdateEngCoinBudgetMutation();
  const [deletePlayer, { isLoading: isDeletingPlayer }] = useDeletePlayerMutation();

  const [selectedPlayer, setSelectedPlayer] = useState<TPlayer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editTargetPlayer, setEditTargetPlayer] = useState<TPlayer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [coinTargetPlayer, setCoinTargetPlayer] = useState<TPlayer | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  const [deleteTargetPlayer, setDeleteTargetPlayer] = useState<TPlayer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Player Management",
      des: "Manage, review registrations, update coins, and control player accounts."
    });
  }, [setHeaders]);

  const handleView = (player: TPlayer) => {
    setSelectedPlayer(player);
    setIsViewModalOpen(true);
  };

  const handleEdit = (player: TPlayer) => {
    setEditTargetPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleEditCoin = (player: TPlayer) => {
    setCoinTargetPlayer(player);
    setIsCoinModalOpen(true);
  };

  const handleDeleteClick = (player: TPlayer) => {
    setDeleteTargetPlayer(player);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deletePlayer({ id }).unwrap();
      toast.success("Player deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteTargetPlayer(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete player");
    }
  };

  const handleConfirmUpdateCoin = async (coinValue: number) => {
    if (!coinTargetPlayer?._id) {
      toast.error("Player ID not found");
      return;
    }
    try {
      await updateEngCoinBudget({
        id: coinTargetPlayer._id,
        data: { engCoine: coinValue },
      }).unwrap();
      toast.success("Player coin updated successfully");
      setIsCoinModalOpen(false);
      setCoinTargetPlayer(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update player coin");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedAgeGroup('ALL');
    setSelectedPosition('ALL');
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedAgeGroup !== 'ALL' ||
    selectedPosition !== 'ALL' ||
    sortBy !== 'newest';

  const tableHeaderPayload = {
    title: "Player List",
    url: "https://example.com/export-users"
  };

  const rawPlayers = playerData?.data?.players || [];
  const pagination = playerData?.data?.pagination || { totalPage: 1, total: rawPlayers.length };

  const summaryItems = [
    {
      title: "Total Players",
      value: pagination.total || 0,
      id: "total_players",
      description: "Total registered active players"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:pt-10 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="w-full">
          <GeneralStateCard items={summaryItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
        </div>
        <Link href="/player-management/player-economy" className="w-full sm:w-auto lg:w-2/12 shrink-0">
          <CreateButton text="View Player Economy" className="w-full py-3.5 sm:py-4 justify-center" />
        </Link>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 py-3 sm:py-4 flex flex-col">
        {/* Search & Filter Toolbar */}
        <div className="px-4 sm:px-6 pt-2 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search player name, email, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 bg-slate-50/50 hover:bg-white focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Dynamic Age Group Filter Dropdown */}
            <AgeGroupSelectDropdown
              groups={dynamicAgeGroups}
              selectedGroup={selectedAgeGroup}
              onChange={(group) => setSelectedAgeGroup(group)}
              placeholder="All Age Groups"
            />

            {/* Dynamic Position Filter Dropdown */}
            <PositionSelectDropdown
              positions={dynamicPositions}
              selectedPosition={selectedPosition}
              onChange={(pos) => setSelectedPosition(pos)}
              placeholder="All Positions"
            />

            {/* Sort Dropdown */}
            <SortSelectDropdown
              sortBy={sortBy}
              onChange={(sort) => setSortBy(sort)}
            />

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-2 sm:pt-4">
            <CustomTable<TPlayer>
              columns={getPlayerColumns(handleView, handleEditCoin, handleEdit, handleDeleteClick)}
              data={rawPlayers}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="pt-4 sm:pt-8 px-2 sm:px-4">
          <CustomPagination
            TOTAL_PAGES={pagination.totalPage}
            qryName="userPage"
          />
        </div>
      </div>

      <PlayerViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        player={selectedPlayer}
      />

      <PlayerEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditTargetPlayer(null);
        }}
        player={editTargetPlayer}
      />

      <UpdateCoinModal
        isOpen={isCoinModalOpen}
        onClose={() => {
          setIsCoinModalOpen(false);
          setCoinTargetPlayer(null);
        }}
        onConfirm={handleConfirmUpdateCoin}
        title="Update Player ENG Coin"
        entityName={coinTargetPlayer ? `${coinTargetPlayer.firstName} ${coinTargetPlayer.lastName}` : undefined}
        initialValue={coinTargetPlayer?.engCoine ?? coinTargetPlayer?.engCoin ?? coinTargetPlayer?.coin ?? 0}
        isLoading={isUpdatingCoin}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetPlayer(null);
        }}
        onConfirm={handleConfirmDelete}
        user={deleteTargetPlayer as any}
        isDeleting={isDeletingPlayer}
      />
    </div>
  );
};

export default PlayerManagement;
