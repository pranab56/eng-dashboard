/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TMatch } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import { matchColumns } from '@/tableColumns/matchColumns';
import TableHeader from '@/components/cui/TableHeader';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectStatusValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import CustomDate from '@/components/selects/CustomDate';
import CustomPagination from '@/components/cui/CustomPagination';




const matchDatas: TMatch[] = [
  {
    id: 1,
    team_a_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team_b_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teams_matchup: "London Lions Vs Dhaka Lions",
    venue: "London Fc Football Club Team",
    date: "03/04/2025",
    time: "Kick-off: 16:30 pm",
    score: "2 - 1",
    status: "Completed"
  },
  {
    id: 2,
    team_a_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team_b_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teams_matchup: "London Lions Vs Dhaka Lions",
    venue: "London Fc Football Club Team",
    date: "03/04/2025",
    time: "Kick-Wait: 16:30 pm",
    score: "0 - 0",
    status: "Scheduled"
  },
  {
    id: 3,
    team_a_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team_b_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teams_matchup: "London Lions Vs Dhaka Lions",
    venue: "London Fc Football Club Team",
    date: "03/04/2025",
    time: "Kick-off: 16:30 pm",
    score: "2 - 1",
    status: "Completed"
  },
  {
    id: 4,
    team_a_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team_b_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teams_matchup: "London Lions Vs Dhaka Lions",
    venue: "London Fc Football Club Team",
    date: "03/04/2025",
    time: "Kick-off: 16:30 pm",
    score: "2 - 1",
    status: "Completed"
  },
  {
    id: 5,
    team_a_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team_b_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teams_matchup: "London Lions Vs Dhaka Lions",
    venue: "London Fc Football Club Team",
    date: "03/04/2025",
    time: "Kick: 16:30 pm",
    score: "2 - 1",
    status: "On Going"
  }
];

const MatchManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Matches",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, [])

  const tableHeaderPayload = {
    title: "Matches Registry",
    des: "Real-time update stream for active league matches.",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        {/* Left Side: Filters */}
        <div className="flex items-center gap-3">
          {/* Date Picker Input */}
          <CustomDate selectType="date1" />
          {/* Status Dropdown */}
          <CustomSelect selectValues={selectStatusValues} selectType="status" />
        </div>
        {/* Right Side: Action Button */}
        <CreateButton text="Create Match" />
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TMatch> columns={matchColumns} data={matchDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default MatchManagement