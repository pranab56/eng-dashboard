"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useHeaders } from '@/hooks/useHeaders';
import { getPlayerColumns } from '@/modules/players';
import { TPlayer } from '@/types/columnTypes';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import { useDeletePlayerMutation, useGetAllPlayerQuery, useUpdateEngCoinBudgetMutation } from '@/features/player/playerApi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CreateButton from '../../../components/buttons/CreateButton';
import PlayerViewModal from './PlayerViewModal';
import PlayerEditModal from './PlayerEditModal';
import { UpdateCoinModal } from '@/components/modals/UpdateCoinModal';
import DeleteConfirmationModal from '../user-management/DeleteConfirmationModal';

const PLAYER_ROLE_TABS = [
  { label: 'All Players', value: 'ALL' },
  { label: 'Regular Players', value: 'PLAYER' },
  { label: 'Trial Players', value: 'OTHER_CLUBS' },
  { label: 'Tournament Players', value: 'TOURNAMENT_PLAYER' },
  { label: 'Pending Approval', value: 'PENDING' },
];

const PlayerManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: playerData, isLoading } = useGetAllPlayerQuery({
    pageNumber: Number(pageNumber),
    searchValue: searchTerm,
    role: activeTab === 'PENDING' ? undefined : activeTab,
    status: activeTab === 'PENDING' ? 'PENDING' : undefined,
  });

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

  const tableHeaderPayload = {
    title: "Player List",
    url: "https://example.com/export-users"
  };

  const players = playerData?.data?.players || [];
  const pagination = playerData?.data?.pagination || { totalPage: 1, total: 0 };

  const summaryItems = [
    {
      title: "Total Players",
      value: pagination.total || 0,
      id: "total_players",
      description: "Total players matching selected criteria"
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
        {/* Search & Tabs Controls */}
        <div className="px-4 sm:px-6 pt-2 pb-4 space-y-4 border-b border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Search Box */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search by player name, email, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {PLAYER_ROLE_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-2 sm:pt-4">
            <CustomTable<TPlayer>
              columns={getPlayerColumns(handleView, handleEditCoin, handleEdit, handleDeleteClick)}
              data={players}
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
