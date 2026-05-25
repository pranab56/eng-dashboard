"use client"


import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteMatchMutation, useGetAllMatchQuery } from '@/features/match/matchApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getMatchColumns } from '@/tableColumns/matchColumns';
import { MatchRecord } from '@/types/dashboard';
import { getErrorMessage } from '@/utils/getErrorMessage';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from './DeleteConfirmModal';
import MatchViewModal from './MatchViewModal';


const MatchManagement = () => {

  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("matchPage") || "1";

  const { data: matchData, isLoading } = useGetAllMatchQuery(page);
  const [deleteMatch, { isLoading: isDeleting }] = useDeleteMatchMutation();

  const [selectedMatch, setSelectedMatch] = useState<MatchRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Matches",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, [setHeaders])

  const handleView = (match: MatchRecord) => {
    setSelectedMatch(match);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteMatch(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Match deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete match"));
    }
  };

  const tableHeaderPayload = {
    title: "Matches Registry",
    des: "Real-time update stream for active league matches.",
    url: "https://example.com/export-users"
  }


  return (
    <div className=' px-8 space-y-4'>
      <div className="flex flex-wrap items-center justify-end gap-4 p-4">
        <Link href="/match-management/create-match">
          <CreateButton text="Add Match" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>

          <div className="pt-4">
            <CustomTable<MatchRecord> columns={getMatchColumns(handleView, handleDelete)} data={matchData?.data || []} isLoading={isLoading} />
          </div>
        </div>

        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={matchData?.pagination?.totalPage || 1} qryName="matchPage" />
        </div>
      </div>

      <MatchViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        match={selectedMatch}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default MatchManagement
