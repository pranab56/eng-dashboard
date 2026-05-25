/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TPlayer } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { singleTeamColumns } from '@/tableColumns/singleTeamColumns';



const items = [
  {
    title: "Total Teams",
    value: 1482,
    id: "table1",
    description: "Total registered teams in system"
  },
  {
    title: "Avg Player Count",
    value: 22.2,
    id: "table2",
    description: "Per managed squad"
  }
];

const tableDatas: TPlayer[] = [
  {
    firstName: "John",
    lastName: "Doe",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Dhaka Warriors",
    shortName: "P-001",
    position: "Forward",
    goals: 12,
  },
  {
    firstName: "Marcus",
    lastName: "Rashford",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "London Lions",
    shortName: "P-002",
    position: "Striker",
    goals: 10,
  },
  {
    firstName: "Kevin",
    lastName: "De Bruyne",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Manchester United",
    shortName: "P-003",
    position: "Midfielder",
    goals: 8,
  },
  {
    firstName: "Luka",
    lastName: "Modric",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Madrid Titans",
    shortName: "P-004",
    position: "Midfielder",
    goals: 5,
  },
  {
    firstName: "Erling",
    lastName: "Haaland",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Sylhet Strikers",
    shortName: "P-005",
    position: "Striker",
    goals: 15,
  },
  {
    firstName: "Kylian",
    lastName: "Mbappe",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Paris Saints",
    shortName: "P-006",
    position: "Forward",
    goals: 14,
  },
  {
    firstName: "Virgil",
    lastName: "van Dijk",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Tokyo Wolves",
    shortName: "P-007",
    position: "Defender",
    goals: 2,
  },
  {
    firstName: "Bruno",
    lastName: "Fernandes",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Berlin Eagles",
    shortName: "P-008",
    position: "Midfielder",
    goals: 9,
  },
  {
    firstName: "Son",
    lastName: "Heung-min",
    profile: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    teamLogo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    teamName: "Sydney Sharks",
    shortName: "P-009",
    position: "Winger",
    goals: 11,
  }
];

const SingleTeam = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Players",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, [])

  const tableHeaderPayload = {
    title: "Squad Roster",
    des: "24 registered athletes across all classifications",
    url: "https://example.com/export-users"
  }

  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TPlayer> columns={singleTeamColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default SingleTeam