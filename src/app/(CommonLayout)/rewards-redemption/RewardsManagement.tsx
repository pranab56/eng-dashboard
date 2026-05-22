/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CustomTable from '@/components/table/CustomTable'
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect, useState } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import CreateButton from '@/components/buttons/CreateButton';
import { getRewardsColumns } from '@/tableColumns/rewardsColumns';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import Link from 'next/link';
import { useDeleteRewordMutation, useGetAllRewordQuery } from '@/features/rewordProduct/rewordApi';
import { useSearchParams } from 'next/navigation';
import RewardViewModal from './RewardViewModal';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import { toast } from 'sonner';


const RewardsManagement = () => {

  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("rewardPage") || "1";

  const { data: rewardData, isLoading } = useGetAllRewordQuery(page);
  const [deleteReward, { isLoading: isDeleting }] = useDeleteRewordMutation();

  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Rewards Redemption",
      des: "Manage the digital inventory of redeemable boutique items and partner rewards."
    })
  }, [])

  const handleView = (reward: any) => {
    setSelectedReward(reward);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteReward(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Reward deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete reward");
    }
  };

  const items = [
    {
      title: "Active Rewards",
      value: rewardData?.pagination?.total || 0,
      id: "home1",
      description: "Available items"
    }
  ];

  const tableHeaderPayload = {
    title: "Rewards Inventory",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-3' />
      </>
      <div className="flex flex-wrap items-center justify-end gap-4 p-4">
        <Link href="/rewards-redemption/create-reward">
          <CreateButton text="Create Reward" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-2">
            <CustomTable<any> columns={getRewardsColumns(handleView, handleDelete)} data={rewardData?.data || []} isLoading={isLoading} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={rewardData?.pagination?.totalPage || 1} qryName="rewardPage" />
        </div>
      </div>

      <RewardViewModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        reward={selectedReward} 
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Reward Deletion"
        description="Are you sure you want to delete this reward item? This will remove it from the mobile catalog."
      />
    </div>
  )
}

export default RewardsManagement;