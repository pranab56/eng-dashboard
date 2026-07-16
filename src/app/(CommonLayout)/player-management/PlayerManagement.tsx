"use client"


import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useHeaders } from '@/hooks/useHeaders';
import { getPlayerColumns } from '@/tableColumns/playerColumns';
import { TPlayer } from '@/types/columnTypes';
import { useEffect, useState } from 'react';

import { useGetAllPlayerQuery } from '@/features/player/playerApi';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import CreateButton from '../../../components/buttons/CreateButton';
import PlayerViewModal from './PlayerViewModal';

const PlayerManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const { data: playerData, isLoading } = useGetAllPlayerQuery({
    pageNumber: Number(pageNumber)
  });

  const [selectedPlayer, setSelectedPlayer] = useState<TPlayer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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
    <div className='pt-10 px-8 space-y-6'>
      <div className="flex items-end">
        <div className='w-full'>
          <GeneralStateCard items={summaryItems} className="grid-cols-4" />
        </div>
        <Link href="/player-management/player-economy" className='w-2/12'>
          <CreateButton text="View Player Economy" className='py-4' />
        </Link>
      </div>

      <div className=" bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TPlayer>
              columns={getPlayerColumns(handleView)}
              data={players}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className='pt-8 px-4'>
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
    </div>
  )
}


export default PlayerManagement
