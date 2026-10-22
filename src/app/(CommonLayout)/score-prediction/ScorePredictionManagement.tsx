"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Plus,
  Search,
  RefreshCw,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
} from "lucide-react";
import {
  useGetAllPredictionRoundsQuery,
  useCreatePredictionRoundMutation,
  useUpdatePredictionRoundMutation,
  useDeletePredictionRoundMutation,
  useSettlePredictionRoundMutation,
} from "@/features/scorePrediction/scorePredictionApi";
import { getScorePredictionColumns } from "@/tableColumns/scorePredictionColumns";
import ScorePredictionModal from "@/components/modals/ScorePredictionModal";
import ScorePredictionLeaderboardModal from "@/components/modals/ScorePredictionLeaderboardModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { toast } from "react-hot-toast";

export default function ScorePredictionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [leaderboardRound, setLeaderboardRound] = useState<any>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settlingRound, setSettlingRound] = useState<any>(null);

  // Queries & Mutations
  const {
    data: roundRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPredictionRoundsQuery({
    page,
    limit,
    searchTerm,
    status: statusFilter,
  });

  const [createRound, { isLoading: isCreating }] = useCreatePredictionRoundMutation();
  const [updateRound, { isLoading: isUpdating }] = useUpdatePredictionRoundMutation();
  const [deleteRound, { isLoading: isDeleting }] = useDeletePredictionRoundMutation();
  const [settleRound, { isLoading: isSettling }] = useSettlePredictionRoundMutation();

  const rounds = useMemo(() => {
    return Array.isArray(roundRes?.data) ? roundRes.data : [];
  }, [roundRes]);

  const total = roundRes?.pagination?.total || roundRes?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // KPIs
  const stats = useMemo(() => {
    let active = 0;
    let participants = 0;
    let coinsPaid = 0;

    rounds.forEach((r: any) => {
      if (r.status === "active") active++;
      participants += Number(r.totalParticipants) || 0;
      coinsPaid += Number(r.totalCoinsDistributed) || 0;
    });

    return {
      totalRounds: total,
      activeRounds: active,
      totalParticipants: participants,
      totalCoinsPaid: coinsPaid,
    };
  }, [rounds, total]);

  // Actions
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleViewLeaderboard = (item: any) => {
    setLeaderboardRound(item);
    setIsLeaderboardOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRound(deletingId).unwrap();
      toast.success("Prediction round deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete round");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmSettle = async () => {
    if (!settlingRound?._id) return;
    try {
      const res = await settleRound(settlingRound._id).unwrap();
      toast.success(res?.message || "Round settled and coins awarded to winners!");
      setSettlingRound(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to settle round");
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (editingItem) {
      await updateRound({ id: editingItem._id, data: formData }).unwrap();
      toast.success("Prediction round updated successfully");
    } else {
      await createRound(formData).unwrap();
      toast.success("Prediction round published successfully");
    }
    setIsModalOpen(false);
  };

  // Table setup
  const columns = useMemo(
    () =>
      getScorePredictionColumns(
        handleViewLeaderboard,
        (item) => setSettlingRound(item),
        handleEdit,
        handleDelete
      ),
    []
  );

  const table = useReactTable({
    data: rounds,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Score Prediction Game
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Fixtures 5-Match Pick
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create prediction rounds for 5 selected fixtures, award coins for exact score and correct outcome predictions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Prediction Round</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-md shrink-0">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Rounds</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {stats.totalRounds}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Active Rounds</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {stats.activeRounds}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-md shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Predictors</span>
            <span className="text-lg font-bold text-sky-700 font-mono">
              {stats.totalParticipants}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-md shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Coins Paid</span>
            <span className="text-lg font-bold text-amber-700 font-mono">
              +{stats.totalCoinsPaid}
            </span>
          </div>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search prediction round..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div className="w-[140px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val)}>
              <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-slate-50 shadow-2xs cursor-pointer">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="upcoming" className="text-xs">Upcoming</SelectItem>
                <SelectItem value="locked" className="text-xs">Locked</SelectItem>
                <SelectItem value="settled" className="text-xs">Settled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer shrink-0"
          title="Refresh table"
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? "animate-spin text-slate-900" : ""}`}
          />
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr
                  key={headerGroup.id}
                  className="bg-slate-50/75 border-b border-slate-200"
                >
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-xs">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-xs text-slate-400 animate-pulse"
                  >
                    Loading prediction rounds...
                  </td>
                </tr>
              ) : rounds.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    No score prediction rounds found.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50/50 text-xs text-slate-500">
          <span>
            Showing {rounds.length} of {total} rounds
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-colors"
            >
              Previous
            </button>
            <span className="font-mono text-slate-900 px-1">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Prediction Modal */}
      <ScorePredictionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Leaderboard Modal */}
      <ScorePredictionLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          setLeaderboardRound(null);
        }}
        roundItem={leaderboardRound}
      />

      {/* Settle Confirmation Modal */}
      {settlingRound && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xl max-w-md w-full space-y-3">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Settle Predictions & Distribute Coins</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to settle <strong>{settlingRound.title}</strong>? The system will check the actual scores of the {settlingRound.matches?.length || 5} fixtures, calculate each user's exact/outcome matches, and automatically credit coins to winning user wallets.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSettlingRound(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSettle}
                disabled={isSettling}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isSettling ? "Settling & Paying..." : "Confirm & Award Coins"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xl max-w-sm w-full space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Delete Prediction Round</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this score prediction round and its user submissions?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
