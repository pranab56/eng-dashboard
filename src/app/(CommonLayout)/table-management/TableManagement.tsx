/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import TableTitle from "@/components/titles/TableTitle";
import CustomTable from "@/components/table/CustomTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllTableQuery } from "@/features/tableManagement/tableApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getTableColumns } from "@/tableColumns/tableColumns";
import { ChevronDown, Trophy, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EditTableStandingModal } from "./EditTableStandingModal";

const TableManagement = () => {
  const { setHeaders } = useHeaders();
  const { data: tableData, isLoading } = useGetAllTableQuery({});

  const allEntries: any[] = tableData?.data || [];

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");
  const [editingStanding, setEditingStanding] = useState<any | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (allEntries.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(allEntries[0].league._id);
    }
  }, [allEntries]);

  useEffect(() => {
    setHeaders({
      title: "Table Management",
      des: "View and manage the league standings, team points, and match records.",
    });
  }, []);

  // Find selected league
  const selectedLeague = allEntries.find(
    (entry) => entry.league._id === selectedLeagueId
  );
  const standings: any[] = selectedLeague?.standings || [];

  // Compute stats
  const totalTeams = standings.length;
  const totalLeagues = allEntries.length;

  const tableHeaderPayload = {
    title: "Point Table Standings",
    des: selectedLeague?.league
      ? `${selectedLeague.league.leagueName} - ${selectedLeague.league.season || ""}`
      : "Select a league",
  };

  // Get selected league name for dropdown button
  const getSelectedLeagueName = () => {
    const league = allEntries.find(
      (entry) => entry.league._id === selectedLeagueId
    );
    return league?.league.leagueName || "Select League";
  };

  const getSelectedLeagueSeason = () => {
    const league = allEntries.find(
      (entry) => entry.league._id === selectedLeagueId
    );
    return league?.league.season || "";
  };

  // Memoize columns with edit handler
  const columns = useMemo(() => {
    return getTableColumns((standing: any) => {
      setEditingStanding(standing);
      setIsEditModalOpen(true);
    });
  }, []);

  return (
    <div className="py-8 px-6 lg:px-8 space-y-6 pb-16 max-w-[1600px] mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
              Active Leagues
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : totalLeagues}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-xs border border-gray-200 flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-gray-700" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium tracking-wide">
              Teams in League
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "..." : totalTeams}
            </p>
          </div>
        </div>
      </div>

      {/* Standings Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 py-4 flex flex-col">
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between px-6 py-2 gap-4 border-b border-gray-100 pb-4">
            <TableTitle
              payload={{
                title: tableHeaderPayload.title,
                des: tableHeaderPayload.des,
              }}
            />

            {/* League Dropdown Selector */}
            {allEntries.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-2.5 shadow-2xs hover:border-gray-400 focus:outline-none transition-all cursor-pointer">
                    <Trophy className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-sm text-gray-800">
                      {getSelectedLeagueName()}
                    </span>
                    {getSelectedLeagueSeason() && (
                      <span className="text-xs text-gray-500 font-normal">
                        ({getSelectedLeagueSeason()})
                      </span>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-72 max-h-80 overflow-y-auto rounded-lg p-1 shadow-md border-gray-200"
                >
                  {allEntries.map((entry) => (
                    <DropdownMenuItem
                      key={entry.league._id}
                      onClick={() => setSelectedLeagueId(entry.league._id)}
                      className={`cursor-pointer py-2 px-3 text-sm flex items-center justify-between rounded-md transition-colors
                        ${
                          selectedLeagueId === entry.league._id
                            ? "bg-blue-50 font-medium text-blue-600"
                            : "hover:bg-gray-50"
                        }
                      `}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {entry.league.leagueName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {entry.league.season}
                        </p>
                      </div>
                      {selectedLeagueId === entry.league._id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="pt-4 px-4 overflow-x-auto">
            {standings.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium text-sm">
                  No standings available for this league
                </p>
                <p className="text-gray-400 text-xs">
                  Teams will appear once added to this league.
                </p>
              </div>
            ) : (
              <CustomTable<any>
                columns={columns}
                data={standings}
                isLoading={isLoading}
              />
            )}
          </div>
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
      />
    </div>
  );
};

export default TableManagement;
