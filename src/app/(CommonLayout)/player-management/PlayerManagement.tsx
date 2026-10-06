/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  X,
  RotateCcw,
  RefreshCw,
  Coins,
  Users,
  Shield,
  CreditCard,
} from "lucide-react";
import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import { useHeaders } from "@/hooks/useHeaders";
import { getPlayerColumns } from "@/modules/players";
import { TPlayer } from "@/types/columnTypes";
import {
  useDeletePlayerMutation,
  useGetAllPlayerQuery,
  useGetPlayerOverviewQuery,
} from "@/features/player/playerApi";
import { useGetAllAgeGroupQuery } from "@/features/categoryManagement/categoryApi";
import { useGetAllTeamQuery } from "@/features/teamManagement/teamApi";
import { toast } from "sonner";
import PlayerViewModal from "./PlayerViewModal";
import PlayerEditModal from "./PlayerEditModal";
import { EditPlayerStatsModal } from "@/components/modals/EditPlayerStatsModal";
import { AdjustCoinModal } from "@/components/modals/AdjustCoinModal";
import DeleteConfirmationModal from "../user-management/DeleteConfirmationModal";
import { AgeGroupSelectDropdown } from "@/components/dropdowns/AgeGroupSelectDropdown";
import { PositionSelectDropdown } from "@/components/dropdowns/PositionSelectDropdown";
import { SortSelectDropdown } from "@/components/dropdowns/SortSelectDropdown";
import { TeamSelectDropdown } from "@/components/dropdowns/TeamSelectDropdown";

const PlayerManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("ALL");
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("newest");

  const queryParams = useMemo(
    () => ({
      pageNumber: Number(pageNumber),
      limit: 10,
      ...(searchTerm.trim() && { searchValue: searchTerm.trim() }),
      ...(selectedAgeGroup !== "ALL" && { ageGroup: selectedAgeGroup }),
      ...(selectedPosition !== "ALL" && { position: selectedPosition }),
      ...(selectedTeamId !== "ALL" && { selectTeam: selectedTeamId }),
      ...(sortBy !== "newest" && { sort: sortBy }),
    }),
    [pageNumber, searchTerm, selectedAgeGroup, selectedPosition, selectedTeamId, sortBy]
  );

  const {
    data: playerData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllPlayerQuery(queryParams);

  // Dedicated Backend Overview API (100% pagination-independent MongoDB Aggregation)
  const { data: overviewRes, refetch: refetchOverview } = useGetPlayerOverviewQuery(undefined);
  const overview = overviewRes?.data;

  // Dynamic Age Groups & Teams
  const { data: ageGroupRes } = useGetAllAgeGroupQuery({});
  const { data: teamRes } = useGetAllTeamQuery({ limit: 1000 });
  const teamsList = useMemo(() => teamRes?.data?.result || teamRes?.data || [], [teamRes]);

  const { data: allPlayersData, refetch: refetchAll } = useGetAllPlayerQuery({ limit: 1000 });
  const allPlayersList = useMemo(
    () => allPlayersData?.data?.players || playerData?.data?.players || [],
    [allPlayersData, playerData]
  );

  // Dynamically compute unique age groups
  const dynamicAgeGroups = useMemo(() => {
    const defaultGroups = ["U7", "U8", "U9", "U10", "U11", "U12", "U13", "U14", "U15", "U16", "U17", "U18"];
    const groupsSet = new Set<string>(defaultGroups);

    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    if (Array.isArray(apiCats)) {
      apiCats.forEach((cat: any) => {
        if (cat?.name && typeof cat.name === "string") {
          const val = cat.name.trim();
          if (val) groupsSet.add(val);
        }
      });
    }

    allPlayersList.forEach((p: any) => {
      if (p?.ageGroup && typeof p.ageGroup === "string") {
        const val = p.ageGroup.trim();
        if (val) groupsSet.add(val);
      }
    });

    return Array.from(groupsSet).sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ""), 10);
      const numB = parseInt(b.replace(/\D/g, ""), 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
  }, [ageGroupRes, allPlayersList]);

  // Dynamically compute unique positions
  const dynamicPositions = useMemo(() => {
    const defaultPositions = ["Goalkeeper", "Defender", "Midfielder", "Forward", "Striker", "Winger"];
    const posSet = new Set<string>(defaultPositions);

    allPlayersList.forEach((p: any) => {
      if (p?.position && typeof p.position === "string") {
        const val = p.position.trim();
        if (val) posSet.add(val);
      }
    });

    return Array.from(posSet);
  }, [allPlayersList]);

  const [deletePlayer, { isLoading: isDeletingPlayer }] = useDeletePlayerMutation();

  const [statsTargetPlayer, setStatsTargetPlayer] = useState<TPlayer | null>(null);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<TPlayer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [editTargetPlayer, setEditTargetPlayer] = useState<TPlayer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [coinTargetPlayer, setCoinTargetPlayer] = useState<TPlayer | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  const [deleteTargetPlayer, setDeleteTargetPlayer] = useState<TPlayer | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Player Management",
      des: "Manage, review registrations, update coins, and control player accounts.",
    });
  }, [setHeaders]);

  useEffect(() => {
    if (selectedPlayer) {
      const list = allPlayersList;
      const updated = list.find(
        (p: any) => (p._id || p.id) === ((selectedPlayer as any)._id || (selectedPlayer as any).id)
      );
      if (updated) {
        setSelectedPlayer(updated);
      }
    }
  }, [allPlayersList, selectedPlayer]);

  const handleView = (player: TPlayer) => {
    setSelectedPlayer(player);
    setIsViewModalOpen(true);
  };

  const handleEdit = (player: TPlayer) => {
    setEditTargetPlayer(player);
    setIsEditModalOpen(true);
  };

  const handleEditCoin = (player: TPlayer) => {
    setCoinTargetPlayer(player);
    setIsCoinModalOpen(true);
  };

  const handleEditStats = (player: TPlayer) => {
    setStatsTargetPlayer(player);
    setIsStatsModalOpen(true);
  };

  const handleDeleteClick = (player: TPlayer) => {
    setDeleteTargetPlayer(player);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deletePlayer({ id }).unwrap();
      toast.success("Player deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteTargetPlayer(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete player");
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedAgeGroup("ALL");
    setSelectedPosition("ALL");
    setSelectedTeamId("ALL");
    setSortBy("newest");
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedAgeGroup !== "ALL" ||
    selectedPosition !== "ALL" ||
    selectedTeamId !== "ALL" ||
    sortBy !== "newest";

  const rawPlayers = playerData?.data?.players || [];
  const pagination = playerData?.data?.pagination || { totalPage: 1, total: rawPlayers.length };

  // Metrics directly from dedicated backend overview API (completely separate from pagination)
  const totalRegistered = overview?.totalPlayers ?? (pagination.total || 0);
  const assignedToSquads = overview?.assignedToSquads ?? 0;
  const activeSubscriptions = overview?.activeSubscriptions ?? 0;
  const totalCirculatingCoins = overview?.totalCoins ?? 0;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Player Management
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {totalRegistered} players
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review registered rosters, position assignments, subscription plans, and token economics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refetch();
              refetchAll();
              refetchOverview();
            }}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh player directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-slate-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link href="/player-management/player-economy">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Player Economy</span>
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Players
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalRegistered.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Assigned to Squads
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {assignedToSquads.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Active Subscriptions
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {activeSubscriptions.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              ENG Coins Balance
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalCirculatingCoins.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Directory Table Container */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
        {/* Search & Filter Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by player name, email, city..."
                className="w-full h-8.5 pl-8.5 pr-8 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="w-auto">
              <AgeGroupSelectDropdown
                groups={dynamicAgeGroups}
                selectedGroup={selectedAgeGroup}
                onChange={(group) => setSelectedAgeGroup(group)}
                placeholder="All Age Groups"
              />
            </div>

            <div className="w-auto">
              <PositionSelectDropdown
                positions={dynamicPositions}
                selectedPosition={selectedPosition}
                onChange={(pos) => setSelectedPosition(pos)}
                placeholder="All Positions"
              />
            </div>

            <div className="w-[180px] sm:w-[200px]">
              <TeamSelectDropdown
                teams={teamsList}
                selectedTeamId={selectedTeamId === "ALL" ? "" : selectedTeamId}
                onChange={(teamId) => setSelectedTeamId(teamId || "ALL")}
                placeholder="All Teams"
              />
            </div>

            <div className="w-auto">
              <SortSelectDropdown
                sortBy={sortBy}
                onChange={(sort) => setSortBy(sort)}
              />
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 h-8.5 px-2.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 w-full overflow-x-auto">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
            <span className="font-semibold text-slate-700">Player Directory</span>
            <span className="tabular-nums">
              Showing {rawPlayers.length} of {pagination.total || 0} registered players
            </span>
          </div>

          <CustomTable<TPlayer>
            columns={getPlayerColumns(
              handleView,
              handleEditCoin,
              handleEdit,
              handleDeleteClick,
              handleEditStats
            )}
            data={rawPlayers}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <CustomPagination
            TOTAL_PAGES={
              (searchTerm.trim() !== "" ||
                selectedAgeGroup !== "ALL" ||
                selectedPosition !== "ALL" ||
                selectedTeamId !== "ALL") &&
              rawPlayers.length < 10 &&
              Number(pageNumber) === 1
                ? 1
                : Math.max(1, pagination.totalPage || 1)
            }
            qryName="userPage"
          />
        </div>
      </div>

      {/* Modals */}
      <PlayerViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        player={selectedPlayer}
      />

      <PlayerEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditTargetPlayer(null);
        }}
        player={editTargetPlayer}
      />

      <EditPlayerStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => {
          setIsStatsModalOpen(false);
          setStatsTargetPlayer(null);
        }}
        player={statsTargetPlayer}
        currentStats={null}
      />

      <AdjustCoinModal
        isOpen={isCoinModalOpen}
        onClose={() => {
          setIsCoinModalOpen(false);
          setCoinTargetPlayer(null);
        }}
        player={coinTargetPlayer}
        currentCoins={
          coinTargetPlayer
            ? Number(
                (coinTargetPlayer as any).engCoine ??
                  (coinTargetPlayer as any).engCoin ??
                  (coinTargetPlayer as any).coin ??
                  0
              ) || 0
            : 0
        }
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetPlayer(null);
        }}
        onConfirm={handleConfirmDelete}
        user={deleteTargetPlayer as any}
        isDeleting={isDeletingPlayer}
      />
    </div>
  );
};

export default PlayerManagement;
