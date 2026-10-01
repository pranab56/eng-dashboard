/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomTable from "@/components/table/CustomTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useGetAllTableQuery,
  useGetTableOverviewQuery,
} from "@/features/tableManagement/tableApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getTableColumns } from "@/tableColumns/tableColumns";
import {
  ChevronDown,
  Trophy,
  Users,
  Search,
  Download,
  Activity,
  Target,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EditTableStandingModal } from "./EditTableStandingModal";

const TableManagement = () => {
  const { setHeaders } = useHeaders();
  const { data: tableData, isLoading: isTableLoading, refetch: refetchTable, isFetching: isTableFetching } =
    useGetAllTableQuery({});

  const allEntries: any[] = tableData?.data || [];

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [editingStanding, setEditingStanding] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Backend Overview Query
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useGetTableOverviewQuery(
    selectedLeagueId ? { leagueId: selectedLeagueId } : {}
  );
  const overview = overviewRes?.data;

  useEffect(() => {
    if (allEntries.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(allEntries[0].league._id);
    }
  }, [allEntries]);

  useEffect(() => {
    setHeaders({
      title: "Table Management",
      des: "View and manage official league standings, team points, and match records.",
    });
  }, []);

  // Find selected league
  const selectedLeague = allEntries.find(
    (entry) => entry.league._id === selectedLeagueId
  );
  const rawStandings: any[] = selectedLeague?.standings || [];

  // Filter standings by search term (team name or short name)
  const filteredStandings = useMemo(() => {
    if (!searchTerm.trim()) return rawStandings;
    const q = searchTerm.toLowerCase().trim();
    return rawStandings.filter((s: any) => {
      const name = s.team?.teamName?.toLowerCase() || "";
      const short = s.team?.shortName?.toLowerCase() || "";
      return name.includes(q) || short.includes(q);
    });
  }, [rawStandings, searchTerm]);

  // Backend overview values with safe client fallbacks
  const totalLeagues = overview?.totalLeagues ?? allEntries.length;
  const totalTeams = overview?.totalClubs ?? rawStandings.length;
  const matchesPlayed = overview?.matchesPlayed ?? 0;
  const totalMatches = overview?.totalMatches ?? 0;
  const totalGoals = overview?.totalGoals ?? 0;
  const avgGoalsPerMatch = overview?.avgGoalsPerMatch ?? 0;

  // League selector labels
  const selectedLeagueName = selectedLeague?.league?.leagueName || "Select Competition";
  const selectedLeagueSeason = selectedLeague?.league?.season || "";

  // Memoize columns with edit handler
  const columns = useMemo(() => {
    return getTableColumns((standing: any) => {
      setEditingStanding(standing);
      setIsEditModalOpen(true);
    });
  }, []);

  // Refresh both table and backend overview
  const handleRefresh = () => {
    refetchTable();
    refetchOverview();
  };

  // Export Standings to CSV
  const handleExportCSV = () => {
    if (!rawStandings.length) return;
    const headers = [
      "Pos",
      "Team",
      "Played",
      "Won",
      "Drawn",
      "Lost",
      "GF",
      "GA",
      "GD",
      "PTS",
      "Type",
    ];
    const rows = rawStandings.map((s, idx) => [
      idx + 1,
      `"${s.team?.teamName || "Team"}"`,
      s.played || 0,
      s.win || 0,
      s.draw || 0,
      s.loss || 0,
      s.goalsFor || 0,
      s.goalsAgainst || 0,
      s.goalDifference || 0,
      s.points || 0,
      s.isManual ? "Manual Override" : "Auto Calculated",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `${selectedLeagueName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_standings.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isCardLoading = isTableLoading || isOverviewLoading;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Executive Summary KPI Strip - Connected directly to Backend Analytics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Competitions
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {isCardLoading ? "..." : totalLeagues}
            </span>
            <span className="text-xs text-slate-400">active leagues</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ranked Clubs
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {isCardLoading ? "..." : totalTeams}
            </span>
            <span className="text-xs text-slate-400">in this table</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Matches Recorded
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {isCardLoading ? "..." : matchesPlayed}
            </span>
            <span className="text-xs text-slate-400">
              {totalMatches > 0 ? `of ${totalMatches} fixtures` : "fixtures played"}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Goals
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-50 text-slate-600 border border-slate-200/60 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {isCardLoading ? "..." : totalGoals}
            </span>
            <span className="text-xs text-slate-400">
              {avgGoalsPerMatch > 0 ? `${avgGoalsPerMatch} / match` : "goals scored"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Control Bar & Standings Table */}
      <div className="bg-white rounded-lg border border-slate-200/80 overflow-hidden shadow-2xs">
        {/* Table Action Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Competition Selector & Details */}
            <div className="flex items-center gap-3 flex-wrap">
              {allEntries.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      <Trophy className="w-4 h-4 text-slate-600" />
                      <span>{selectedLeagueName}</span>
                      {selectedLeagueSeason && (
                        <span className="text-xs font-normal text-slate-500 font-mono">
                          ({selectedLeagueSeason})
                        </span>
                      )}
                      <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-80 max-h-96 overflow-y-auto rounded-lg p-1.5 shadow-md border-slate-200 bg-white"
                  >
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Select League Table
                    </div>
                    {allEntries.map((entry) => {
                      const isSelected = selectedLeagueId === entry.league._id;
                      return (
                        <DropdownMenuItem
                          key={entry.league._id}
                          onClick={() => {
                            setSelectedLeagueId(entry.league._id);
                            setSearchTerm("");
                          }}
                          className={`cursor-pointer py-2 px-3 text-sm flex items-center justify-between rounded-md transition-colors ${
                            isSelected
                              ? "bg-slate-100 font-semibold text-slate-900"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <p className="truncate text-sm font-medium">{entry.league.leagueName}</p>
                            <p className="text-xs text-slate-400 font-mono">
                              {entry.league.season || "Active"} • {entry.standings?.length || 0} clubs
                            </p>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <span className="hidden sm:inline-block text-slate-300">|</span>

              <div className="text-xs text-slate-500 font-medium">
                Standard Points Rule:{" "}
                <span className="font-mono text-slate-700 font-semibold">
                  3 Win / 1 Draw / 0 Loss
                </span>
              </div>
            </div>

            {/* Right: Quick Search, Export, Refresh */}
            <div className="flex items-center gap-2.5">
              <div className="relative min-w-[180px] sm:min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter team..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                disabled={!rawStandings.length}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Export table to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isTableFetching}
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh table and overview"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isTableFetching ? "animate-spin" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:p-5">
          {filteredStandings.length === 0 && !isTableLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {searchTerm
                  ? "No matching clubs found"
                  : "No standings available for this competition"}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                {searchTerm
                  ? `No club in this league matches "${searchTerm}". Clear search to view all.`
                  : "Teams will automatically rank here as matches are scheduled and completed."}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <CustomTable<any>
              columns={columns}
              data={filteredStandings}
              isLoading={isTableLoading}
            />
          )}
        </div>
      </div>

      {/* Edit Standing Modal */}
      <EditTableStandingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStanding(null);
        }}
        league={selectedLeague?.league || null}
        standing={editingStanding}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default TableManagement;
