"use client"


import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useHeaders } from '@/hooks/useHeaders';
import { getPlayerColumns } from '@/modules/players';
import { TPlayer } from '@/types/columnTypes';
import { useEffect, useState } from 'react';

import { useGetAllPlayerQuery, useUpdateEngCoinBudgetMutation } from '@/features/player/playerApi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import CreateButton from '../../../components/buttons/CreateButton';
import PlayerViewModal from './PlayerViewModal';
import PlayerEditModal from './PlayerEditModal';
import { UpdateCoinModal } from '@/components/modals/UpdateCoinModal';

const PlayerManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const { data: playerData, isLoading } = useGetAllPlayerQuery({
    pageNumber: Number(pageNumber)
  });

  const [updateEngCoinBudget, { isLoading: isUpdatingCoin }] = useUpdateEngCoinBudgetMutation();

  const [selectedPlayer, setSelectedPlayer] = useState<TPlayer | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editTargetPlayer, setEditTargetPlayer] = useState<TPlayer | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [coinTargetPlayer, setCoinTargetPlayer] = useState<TPlayer | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Players",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, [setHeaders])

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
  }

  const players = playerData?.data?.players || [];
  const pagination = playerData?.data?.pagination || { totalPage: 1, total: 0 };

  const summaryItems = [
    {
      title: "Total Players",
      value: pagination.total || 0,
      id: "total_players",
      description: "Total players registered in the system"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:pt-10 lg:px-8 space-y-4 sm:space-y-6">
      {/* Header Section: Stacked on mobile, flex row on tablet & desktop */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="w-full">
          <GeneralStateCard items={summaryItems} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" />
        </div>
        <Link href="/player-management/player-economy" className="w-full sm:w-auto lg:w-2/12 shrink-0">
          <CreateButton text="View Player Economy" className="w-full py-3.5 sm:py-4 justify-center" />
        </Link>
      </div>

      {/* Main Table Container: No horizontal overflow on mobile */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 py-3 sm:py-4 flex flex-col">
        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-2 sm:pt-4">
            <CustomTable<TPlayer>
              columns={getPlayerColumns(handleView, handleEditCoin, handleEdit)}
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
    </div>
  )
}
export default PlayerManagement
