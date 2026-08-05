"use client";

import CreateButton from "@/components/buttons/CreateButton";
import CustomPagination from "@/components/cui/CustomPagination";
import GeneralStateCard from "@/components/cui/GeneralStateCard";
import TableTitle from "@/components/titles/TableTitle";
import {
  useCreateTourNamentsMutation,
  useDeleteTourNamentsMutation,
  useGetAllTournamentsQuery,
  useUpdateTourNamentsMutation,
} from "@/features/tournaments/tournamentsApi";
import { useHeaders } from "@/hooks/useHeaders";
import { TTournament, TPositionReward } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import dayjs from "dayjs";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import {
  Trophy,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronRight,
  GitBranch,
  Search,
  Loader2,
  FolderPlus,
  Award,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import DeleteConfirmModal from "../match-management/DeleteConfirmModal";
import TournamentFormModal from "./TournamentFormModal";
import TournamentViewModal from "./TournamentViewModal";

export default function Tournaments() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // API Hooks
  const { data: tournamentRes, isLoading } = useGetAllTournamentsQuery(page);
  const [createTourNaments, { isLoading: isCreating }] =
    useCreateTourNamentsMutation();
  const [updateTourNaments, { isLoading: isUpdating }] =
    useUpdateTourNamentsMutation();
  const [deleteTourNaments, { isLoading: isDeleting }] =
    useDeleteTourNamentsMutation();

  // Modals & Selection States
  const [selectedTournament, setSelectedTournament] =
    useState<TTournament | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] =
    useState<TTournament | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setHeaders({
      title: "Tournaments",
      des: "Manage and monitor official tournament events, schedules, and prize positions.",
    });
  }, [setHeaders]);

  const rawTournaments: TTournament[] = useMemo(
    () => tournamentRes?.data || [],
    [tournamentRes]
  );

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filtered Tournaments
  const filteredTournaments = useMemo(() => {
    return rawTournaments.filter((t) => {
      const matchesSearch =
        !searchTerm.trim() ||
        (t.title || "").toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (t.description || "").toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        (t.positionRewards || []).some((r) =>
          r.positionName.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );

      const matchesStatus =
        statusFilter === "ALL" ||
        (t.status || "upcoming").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawTournaments, searchTerm, statusFilter]);

  // Handlers
  const handleView = (tournament: TTournament) => {
    setSelectedTournament(tournament);
    setIsViewModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    setEditingTournament(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (tournament: TTournament) => {
    setEditingTournament(tournament);
    setIsFormModalOpen(true);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  // Submit Action
  const handleFormSubmit = async (data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
    positionRewards: TPositionReward[];
    id?: string;
  }) => {
    try {
      const body = {
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status,
        positionRewards: data.positionRewards,
      };

      if (data.id) {
        const res = await updateTourNaments({
          id: data.id,
          body: body,
        }).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Tournament updated successfully");
          setIsFormModalOpen(false);
        }
      } else {
        const res = await createTourNaments(body).unwrap();
        if (res?.success !== false) {
          toast.success(res?.message || "Tournament created successfully");
          setIsFormModalOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save tournament"));
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteTourNaments(deletingId).unwrap();
      if (res?.success !== false) {
        toast.success(res?.message || "Tournament deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to delete tournament"));
    }
  };

  const totalTournaments =
    tournamentRes?.pagination?.total || rawTournaments.length;

  const cardItems = [
    {
      title: "Total Tournaments",
      value: totalTournaments,
      id: "t1",
      description: "Official registered competitive tournaments",
    },
  ];

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Executive Banner & State Card */}
      <div className="flex items-end">
        <div className="w-full">
          <GeneralStateCard items={cardItems} className="grid-cols-4" />
        </div>
      </div>

      {/* Main Tree Container Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
        {/* Header Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <TableTitle payload={{ title: "Tournament Tree Hierarchy" }} />
            <p className="text-xs text-gray-400 mt-1">
              Visual node structure for tournament events and prize position branches
            </p>
          </div>

          <div className="flex  items-center gap-3 w-4/12">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tournaments or ranks..."
                className="w-full pl-10 pr-4 py-3.5  bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>

            {/* Status Filter Combobox */}
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-12 px-3.5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-between gap-2 hover:bg-gray-100 transition-all cursor-pointer min-w-[125px]"
                >
                  <span className="capitalize">
                    {statusFilter === "ALL" ? "All Status" : statusFilter}
                  </span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                {[
                  { label: "All Status", value: "ALL" },
                  { label: "Upcoming", value: "upcoming" },
                  { label: "Ongoing", value: "ongoing" },
                  { label: "Completed", value: "completed" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setStatusPopoverOpen(false);
                    }}
                    className={`w-full px-3 py-3 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${statusFilter === opt.value
                      ? "bg-black text-white font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Tree Toggle Helpers */}


            {/* Create Tournament Button */}
            <div className="w-5/12">
              <CreateButton
                text="Create Tournament"
                onClick={handleOpenCreateModal}
                className="py-3"
              />
            </div>
          </div>
        </div>

        {/* Tree Nodes List Section */}
        {isLoading ? (
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs font-medium text-gray-500">
              Loading tournament tree structure...
            </p>
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <FolderPlus className="w-6 h-6" />
            </div>
            <h4 className="text-base font-medium text-gray-800">
              No Tournaments Found
            </h4>
            <p className="text-xs text-gray-400 max-w-xs">
              {searchTerm || statusFilter !== "ALL"
                ? "No tournament matches your search or status filter criteria."
                : "Create your first tournament to build the hierarchy tree."}
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="mt-2 px-4 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition-all cursor-pointer shadow-sm"
            >
              + Create Tournament
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTournaments.map((tournament) => {
              const nodeKey = tournament._id || (tournament as any).id || "";
              const isExpanded = !!expandedNodes[nodeKey];
              const rewards = tournament.positionRewards || [];

              const start = tournament.startDate
                ? dayjs(tournament.startDate).format("DD MMM, YYYY")
                : "N/A";
              const end = tournament.endDate
                ? dayjs(tournament.endDate).format("DD MMM, YYYY")
                : "N/A";

              const status = (tournament.status || "upcoming").toLowerCase();
              let badgeStyle = "bg-amber-50 text-amber-700 border-amber-200";
              if (status === "ongoing" || status === "active") {
                badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
              } else if (status === "completed" || status === "finished") {
                badgeStyle = "bg-purple-50 text-purple-700 border-purple-200";
              }

              return (
                <div
                  key={nodeKey}
                  className="rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Root Node Container */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/40 border-b border-gray-100">
                    <div className="flex items-start gap-3.5 min-w-0">
                      {/* Expand / Collapse Button */}
                      <button
                        type="button"
                        onClick={() => toggleNodeExpand(nodeKey)}
                        className="mt-1 p-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer shrink-0"
                        title={isExpanded ? "Collapse Tree" : "Expand Tree"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      {/* Tournament Icon */}
                      <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-medium shrink-0 shadow-sm">
                        <Trophy className="w-5 h-5" />
                      </div>

                      {/* Info & Status */}
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-medium text-gray-900 text-base leading-snug truncate">
                            {tournament.title}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium . tracking-wider border ${badgeStyle}`}
                          >
                            {status}
                          </span>
                        </div>

                        {tournament.description && (
                          <p className="text-xs text-gray-500 line-clamp-1 font-normal">
                            {tournament.description}
                          </p>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>
                            {start} &mdash; {end}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Root Action Buttons */}
                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-purple-500" />
                        {rewards.length} Ranks
                      </span>

                      <button
                        type="button"
                        onClick={() => handleView(tournament)}
                        className="p-2 rounded-xl text-gray-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tournament)}
                        className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200 transition-colors cursor-pointer"
                        title="Edit Tournament"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrigger(nodeKey)}
                        className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 border border-gray-200 transition-colors cursor-pointer"
                        title="Delete Tournament"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Tree Children (Position Rewards Branch Nodes) */}
                  {isExpanded && (
                    <div className="p-6 bg-white space-y-3 relative border-t border-gray-50">
                      {/* Visual Tree Vertical Main Stem Connector */}
                      <div className="absolute left-10 top-6 bottom-8 w-0.5 bg-gradient-to-b from-amber-200 via-gray-200 to-transparent pointer-events-none" />

                      <div className="flex items-center gap-2 text-xs font-medium text-gray-400 . tracking-wider ml-8 mb-4">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Position Rewards Tree Branches ({rewards.length})</span>
                      </div>

                      {rewards.length === 0 ? (
                        <div className="ml-8 text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl">
                          No position rewards configured for this tournament.
                        </div>
                      ) : (
                        <div className="space-y-3 pl-8 relative">
                          {rewards.map((reward, rIdx) => {
                            let iconMark = "#" + reward.position;
                            let cardStyle = "bg-gray-50 border-gray-200 text-gray-800";
                            let pointsStyle = "bg-blue-50 text-blue-700 border-blue-100";

                            if (reward.position === 1) {
                              iconMark = "🥇";
                              cardStyle = "bg-amber-50/60 border-amber-200 text-amber-950";
                              pointsStyle = "bg-amber-100 text-amber-800 border-amber-300";
                            } else if (reward.position === 2) {
                              iconMark = "🥈";
                              cardStyle = "bg-slate-50 border-slate-200 text-slate-900";
                              pointsStyle = "bg-slate-100 text-slate-800 border-slate-300";
                            } else if (reward.position === 3) {
                              iconMark = "🥉";
                              cardStyle = "bg-orange-50/60 border-orange-200 text-orange-950";
                              pointsStyle = "bg-orange-100 text-orange-800 border-orange-300";
                            }

                            return (
                              <div
                                key={rIdx}
                                className="relative flex items-center gap-4 group"
                              >
                                {/* Horizontal Branch Connecting Line */}
                                <div className="absolute -left-6 top-1/2 w-6 h-0.5 bg-gray-200 group-hover:bg-amber-400 transition-colors pointer-events-none" />

                                {/* Reward Leaf Node */}
                                <div
                                  className={`flex-1 p-3.5 px-4 rounded-xl border flex items-center justify-between transition-all duration-200 hover:shadow-sm ${cardStyle}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl shrink-0">
                                      {iconMark}
                                    </span>
                                    <div>
                                      <h4 className="text-sm font-medium leading-snug">
                                        {reward.positionName}
                                      </h4>
                                      <p className="text-[11px] text-gray-500 font-medium">
                                        Rank #{reward.position} Placement
                                      </p>
                                    </div>
                                  </div>

                                  <div
                                    className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 border ${pointsStyle}`}
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>{reward.points} Points</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="pt-6 px-2 border-t border-gray-100">
          <CustomPagination
            TOTAL_PAGES={tournamentRes?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* View Details Modal */}
      <TournamentViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        tournament={selectedTournament}
      />

      {/* Create / Edit Form Modal */}
      <TournamentFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingTournament={editingTournament}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Tournament Deletion"
        description="Are you sure you want to delete this tournament? This action cannot be undone."
      />
    </div>
  );
}
