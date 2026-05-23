/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteLeagueEntryMutation, useDeleteLeagueTeamMutation, useGetAllLeagueTeamQuery } from '@/features/leagueTeam/leagueTeamApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getLeagueTeamColumns } from '@/tableColumns/leagueTeamColumns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import LeagueTeamViewModal from './LeagueTeamViewModal';

const LeagueTeamManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const { data: leagueTeamData, isLoading } = useGetAllLeagueTeamQuery(page);
  const [deleteLeagueTeam, { isLoading: isDeleting }] = useDeleteLeagueTeamMutation();
  const [deleteLeagueEntry, { isLoading: isDeletingEntry }] = useDeleteLeagueEntryMutation();

  // View modal: holds { league, teams[] } for the selected row
  const [viewData, setViewData] = useState<{ league: any; teams: any[] } | null>(null);

  // Delete modal state — handles both per-team and per-league deletes
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"team" | "league">("team");
  const [deletingParams, setDeletingParams] = useState<{ leagueId: string; teamId?: string } | null>(null);

  useEffect(() => {
    setHeaders({
      title: "League Teams",
      des: "Manage the association between leagues and teams.",
    });
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────
  const handleView = (row: { league: any; teams: any[] }) => {
    setViewData(row);
  };

  const handleCloseView = () => {
    setViewData(null);
  };

  // Called from inside the view modal's per-team trash button
  const handleDeleteTeam = (leagueId: string, teamId: string) => {
    setDeleteMode("team");
    setDeletingParams({ leagueId, teamId });
    setIsDeleteModalOpen(true);
  };

  // Called from the table row's delete icon (deletes the whole league entry)
  const handleDeleteLeagueEntry = (leagueId: string) => {
    setDeleteMode("league");
    setDeletingParams({ leagueId });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingParams) return;

    try {
      if (deleteMode === "league") {
        // Delete the entire league entry (parent row)
        const res = await deleteLeagueEntry(deletingParams.leagueId).unwrap();
        if (res.success) {
          toast.success(res.message || "League entry deleted successfully");
          setIsDeleteModalOpen(false);
          setDeletingParams(null);
          // Close view modal if it was open for this league
          if (viewData?.league?._id === deletingParams.leagueId) {
            setViewData(null);
          }
        }
      } else {
        // Delete a single team from a league
        const res = await deleteLeagueTeam({
          leagueId: deletingParams.leagueId,
          teamId: deletingParams.teamId!,
        }).unwrap();
        if (res.success) {
          toast.success(res.message || "Team removed from league successfully");
          setIsDeleteModalOpen(false);

          // Optimistically update the view modal teams list
          if (viewData) {
            const updatedTeams = viewData.teams.filter(
              (t) => t._id !== deletingParams.teamId
            );
            if (updatedTeams.length === 0) {
              setViewData(null);
            } else {
              setViewData({ ...viewData, teams: updatedTeams });
            }
          }

          setDeletingParams(null);
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete");
    }
  };

  const tableHeaderPayload = {
    title: "League Team Connections",
    des: "List of teams associated with specific leagues.",
    url: "",
  };

  // API returns [{ league, teams[] }] — use directly as table rows
  const tableData: any[] = leagueTeamData?.data || [];

  return (
    <div className="px-8 pt-10 space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-4 p-4">
        <Link href="/league-team/create-league-team">
          <CreateButton text="Add Team to League" />
        </Link>
      </div>

      <div className="bg-white rounded-md py-4 flex flex-col">
        <div className="flex-1 text-left">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<any>
              columns={getLeagueTeamColumns(handleView, handleDeleteLeagueEntry)}
              data={tableData}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className="pt-8 px-4">
          <CustomPagination
            TOTAL_PAGES={leagueTeamData?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* View Modal — shows all teams in the selected league */}
      <LeagueTeamViewModal
        data={viewData}
        isOpen={!!viewData}
        onClose={handleCloseView}
        onDeleteTeam={handleDeleteTeam}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingParams(null);
        }}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting || isDeletingEntry}
        title={
          deleteMode === "league"
            ? "Delete League Entry"
            : "Remove Team from League"
        }
        description={
          deleteMode === "league"
            ? "Are you sure you want to delete this entire league entry? All team associations will be removed. This action cannot be undone."
            : "Are you sure you want to remove this team from the league? This action cannot be undone."
        }
      />
    </div>
  );
};

export default LeagueTeamManagement;
