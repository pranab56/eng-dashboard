"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteLeagueMutation, useGetAllLeagueQuery } from '@/features/leagueManagement/leagueApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getLeagueColumns } from '@/tableColumns/leagueColumns';
import { LeagueRecord } from '@/types/dashboard';
import { getErrorMessage } from '@/utils/getErrorMessage';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import LeagueViewModal from './LeagueViewModal';

const LeagueManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("leaguePage") || "1";

  const { data: leagueData, isLoading } = useGetAllLeagueQuery(page);
  const [deleteLeague, { isLoading: isDeleting }] = useDeleteLeagueMutation();

  const [selectedLeague, setSelectedLeague] = useState<LeagueRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Leagues",
      des: "Manage league seasons, schedules, and competition records.",
    });
  }, [setHeaders]);

  const handleView = (league: LeagueRecord) => {
    setSelectedLeague(league);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteLeague(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "League deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete league"));
    }
  };

  const tableHeaderPayload = {
    title: "League Registry",
    des: "Overview of all active and upcoming league seasons.",
    url: "https://example.com/export-leagues",
  };

  return (
    <div className="px-8 space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-4 p-4">
        <Link href="/league-management/create-league">
          <CreateButton text="Add League" />
        </Link>
      </div>

      <div className="bg-white rounded-md py-4 flex flex-col">
        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4">
            <CustomTable<LeagueRecord>
              columns={getLeagueColumns(handleView, handleDelete)}
              data={leagueData?.data || []}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="pt-8 px-4">
          <CustomPagination
            TOTAL_PAGES={leagueData?.pagination?.totalPage || 1}
            qryName="leaguePage"
          />
        </div>
      </div>

      <LeagueViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        league={selectedLeague}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm League Deletion"
        description="Are you sure you want to delete this league? All associated data will be permanently removed."
      />
    </div>
  );
};

export default LeagueManagement;
