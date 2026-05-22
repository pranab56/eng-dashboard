/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect, useState } from 'react';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { getTeamColumns } from '@/tableColumns/teamColumns';
import TableTitle from '@/components/titles/TableTitle';
import CreateButton from '@/components/buttons/CreateButton';
import Link from 'next/link';
import { useDeleteTeamMutation, useGetAllTeamQuery } from '@/features/teamManagement/teamApi';
import { useSearchParams } from 'next/navigation';
import TeamViewModal from './TeamViewModal';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import { toast } from 'sonner';


const TeamManagement = () => {

  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("teamPage") || "1";
  
  const { data: teamData, isLoading } = useGetAllTeamQuery(page);
  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();

  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Teams",
      des: "Manage and monitor registered squads and team identities."
    })
  }, [])

  const handleView = (team: any) => {
    setSelectedTeam(team);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
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

  const items = [
    {
      title: "Total Teams",
      value: teamData?.pagination?.total || 0,
      id: "table1",
      description: "Total registered teams"
    }
  ];


  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className=" bg-white rounded-md py-4 flex flex-col ">
        <div className='flex-1'>
          <div className="flex items-center justify-between px-6 py-1">
            <TableTitle payload={{ title: "Squad Registry" }} />
            <div className='flex gap-2'>
              <Link href="/team-management/add-team">
                <CreateButton text="Add Team" />
              </Link>
            </div>
          </div>
          <div className="pt-4">
            <CustomTable<any> columns={getTeamColumns(handleView, handleDelete)} data={teamData?.data || []} isLoading={isLoading} />
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
    </div>
  )
}

export default TeamManagement;