"use client";

import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Trophy,
  Award,
  Users,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  useGetAllQuizQuery,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useDeleteQuizMutation,
} from "@/features/quiz/quizApi";
import { getQuizColumns } from "@/tableColumns/quizColumns";
import QuizModal from "@/components/modals/QuizModal";
import QuizLeaderboardModal from "@/components/modals/QuizLeaderboardModal";
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

const CATEGORIES = [
  "All",
  "General Sports",
  "Football Trivia",
  "Rules & Fair Play",
  "Tournament Special",
  "Academy & Tactics",
  "Matchday Quiz",
];

export default function QuizManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [leaderboardQuiz, setLeaderboardQuiz] = useState<any>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Queries & Mutations
  const {
    data: quizRes,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllQuizQuery({
    page,
    limit,
    searchTerm,
    status: statusFilter,
    category: categoryFilter,
  });

  const [createQuiz, { isLoading: isCreating }] = useCreateQuizMutation();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuiz, { isLoading: isDeleting }] = useDeleteQuizMutation();

  const quizzes = useMemo(() => {
    return Array.isArray(quizRes?.data) ? quizRes.data : [];
  }, [quizRes]);

  const total = quizRes?.pagination?.total || quizRes?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  // Metrics
  const stats = useMemo(() => {
    let active = 0;
    let attempts = 0;
    let rewards = 0;

    quizzes.forEach((q: any) => {
      if (q.status === "active") active++;
      attempts += Number(q.totalAttempts) || 0;
      rewards += Number(q.totalRewardsDistributed) || 0;
    });

    return {
      totalQuizzes: total,
      activeQuizzes: active,
      totalAttempts: attempts,
      totalRewards: rewards,
    };
  }, [quizzes, total]);

  // Handlers
  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleViewLeaderboard = (item: any) => {
    setLeaderboardQuiz(item);
    setIsLeaderboardOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteQuiz(deletingId).unwrap();
      toast.success("Quiz deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete quiz");
    } finally {
      setDeletingId(null);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (editingItem) {
      await updateQuiz({ id: editingItem._id, data: formData }).unwrap();
      toast.success("Quiz updated successfully");
    } else {
      await createQuiz(formData).unwrap();
      toast.success("Quiz published successfully");
    }
    setIsModalOpen(false);
  };

  // Table setup
  const columns = useMemo(
    () => getQuizColumns(handleViewLeaderboard, handleEdit, handleDelete),
    []
  );

  const table = useReactTable({
    data: quizzes,
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
              Interactive Quiz Management
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Play-to-Win
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create quizzes, set reward points, and boost fan and player engagement with interactive trivia.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Quiz</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-md shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Total Quizzes</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {stats.totalQuizzes}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Active Quizzes</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {stats.activeQuizzes}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-md shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Quiz Attempts</span>
            <span className="text-lg font-bold text-sky-700 font-mono">
              {stats.totalAttempts}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-md shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Rewards Given</span>
            <span className="text-lg font-bold text-amber-700 font-mono">
              {stats.totalRewards} pts
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Bar */}
          <div className="relative min-w-[200px] max-w-xs flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quiz title, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400"
            />
          </div>

          {/* Custom Category Filter */}
          <div className="w-[160px]">
            <Select
              value={categoryFilter}
              onValueChange={(val) => setCategoryFilter(val)}
            >
              <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-slate-50 shadow-2xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat === "All" ? "all" : cat}
                    className="text-xs"
                  >
                    {cat === "All" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Status Filter */}
          <div className="w-[140px]">
            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val)}
            >
              <SelectTrigger className="w-full h-8 px-2.5 rounded-md border border-slate-200 text-xs text-slate-900 bg-slate-50 shadow-2xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                <SelectItem value="completed" className="text-xs">Completed</SelectItem>
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
                    Loading quizzes...
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-xs text-slate-400"
                  >
                    No quizzes found matching the filter criteria.
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
            Showing {quizzes.length} of {total} quizzes
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

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingItem={editingItem}
        isLoading={isCreating || isUpdating}
      />

      {/* Leaderboard Modal */}
      <QuizLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          setLeaderboardQuiz(null);
        }}
        quizItem={leaderboardQuiz}
      />

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xl max-w-sm w-full space-y-3">
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Delete Quiz</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this quiz? All participant attempts and results will be permanently removed.
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
