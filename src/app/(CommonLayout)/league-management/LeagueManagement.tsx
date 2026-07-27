/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteLeagueMutation, useGetAllLeagueQuery } from '@/features/leagueManagement/leagueApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getLeagueColumns } from '@/tableColumns/leagueColumns';
import { Search, X } from 'lucide-react';
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

  const [searchTerm, setSearchTerm] = useState("");

  const { data: leagueData, isLoading } = useGetAllLeagueQuery({
    page: page,
    searchValue: searchTerm,
  });
  const [deleteLeague, { isLoading: isDeleting }] = useDeleteLeagueMutation();

  const [selectedLeague, setSelectedLeague] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Leagues",
      des: "Manage league seasons, schedules, and competition records.",
    });
  }, []);

  const handleView = (league: any) => {
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
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete league");
    }
  };

  const tableHeaderPayload = {
    title: "League Registry",
    des: "Overview of all active and upcoming league seasons.",
    url: "https://example.com/export-leagues",
  };

  const rawLeagues = leagueData?.data || [];
  const filteredLeagues = rawLeagues.filter((league: any) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const title = (league.title || league.leagueName || '').toLowerCase();
    const desc = (league.description || '').toLowerCase();
    return title.includes(q) || desc.includes(q);
  });

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search leagues by name..."
            className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <Link href="/league-management/create-league">
          <CreateButton text="Add League" />
        </Link>
      </div>

      <div className="bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4">
            <CustomTable<any>
              columns={getLeagueColumns(handleView, handleDelete)}
              data={filteredLeagues}
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
