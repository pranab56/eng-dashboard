/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import TableTitle from '@/components/titles/TableTitle';
import CustomTable from '@/components/table/CustomTable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAllTableQuery } from '@/features/tableManagement/tableApi';
import { useHeaders } from '@/hooks/useHeaders';
import { tableColumns } from '@/tableColumns/tableColumns';
import { ChevronDown, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

const TableManagement = () => {
  const { setHeaders } = useHeaders();
  const { data: tableData, isLoading } = useGetAllTableQuery({});

  const allEntries: any[] = tableData?.data || [];

  const [selectedLeagueId, setSelectedLeagueId] = useState<string>("");

  useEffect(() => {
    if (allEntries.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(allEntries[0].league._id);
    }
  }, [allEntries]);

  useEffect(() => {
    setHeaders({
      title: "Table Management",
      des: "View and manage the league standings and team performance metrics."
    })
  }, []);

  // Find selected league
  const selectedLeague = allEntries.find(entry => entry.league._id === selectedLeagueId);
  const standings: any[] = selectedLeague?.standings || [];

  // Compute stats
  const totalTeams = standings.length;
  const totalLeagues = allEntries.length;

  const tableHeaderPayload = {
    title: "Point Table Standings",
    des: selectedLeague?.league
      ? `${selectedLeague.league.leagueName} · ${selectedLeague.league.season}`
      : "Select a league",
  }

  // Get selected league name for dropdown button
  const getSelectedLeagueName = () => {
    const league = allEntries.find(entry => entry.league._id === selectedLeagueId);
    return league?.league.leagueName || "Select League";
  }

  const getSelectedLeagueSeason = () => {
    const league = allEntries.find(entry => entry.league._id === selectedLeagueId);
    return league?.league.season || "";
  };

  return (
    <div className='py-10 px-8 space-y-6 pb-16'>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium . tracking-wide">Active Leagues</p>
            <p className="text-2xl font-medium text-gray-900">{isLoading ? "—" : totalLeagues}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
            <span className="text-xl">⚽</span>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium . tracking-wide">Teams in League</p>
            <p className="text-2xl font-medium text-gray-900">{isLoading ? "—" : totalTeams}</p>
          </div>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col">
        <div className='flex-1'>
          <div className="flex flex-wrap items-center justify-between px-6 py-2 gap-4 border-b border-gray-100 pb-4">
            <TableTitle payload={{ title: tableHeaderPayload.title, des: tableHeaderPayload.des }} />

            {/* League Dropdown Selector - top right side */}
            {allEntries.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="bg-white border border-gray-200 rounded-full px-5 py-2.5 flex items-center gap-3 shadow-sm hover:border-gray-300 focus:outline-none transition-all cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-gray-600" />
                      <span className="font-semibold text-sm text-gray-800">{getSelectedLeagueName()}</span>
                      <span className="text-xs text-gray-400 font-normal">{getSelectedLeagueSeason()}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 max-h-80 overflow-y-auto">
                  {allEntries.map((entry) => (
                    <DropdownMenuItem
                      key={entry.league._id}
                      onClick={() => setSelectedLeagueId(entry.league._id)}
                      className={`cursor-pointer py-2.5 px-4 text-sm flex items-center justify-between
                        ${selectedLeagueId === entry.league._id ? 'bg-blue-50 font-semibold text-blue-600' : ''}
                      `}
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-800">{entry.league.leagueName}</p>
                        <p className="text-xs text-gray-400">{entry.league.season}</p>
                      </div>
                      {selectedLeagueId === entry.league._id && (
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="pt-4 px-4 overflow-hidden">
            {standings.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold">No standings available for this league</p>
                <p className="text-gray-400 text-sm">Matches need to be played first to generate standings.</p>
              </div>
            ) : (
              <CustomTable<any>
                columns={tableColumns}
                data={standings}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableManagement;