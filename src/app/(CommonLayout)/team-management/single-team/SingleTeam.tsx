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
    id: 1,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "John Doe",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Dhaka Warriors",
    position: "Forward",
    status: "Professional",
    goals: 12,
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Marcus Rashford",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    position: "Striker",
    status: "Semi Pro",
    goals: 10,
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Kevin De Bruyne",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Manchester United",
    position: "Midfielder",
    status: "Semi Pro",
    goals: 8,
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Luka Modric",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Madrid Titans",
    position: "Midfielder",
    status: "Professional",
    goals: 5,
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Erling Haaland",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sylhet Strikers",
    position: "Striker",
    status: "Amateur",
    goals: 15,
  },
  {
    id: 6,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Kylian Mbappe",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Paris Saints",
    position: "Forward",
    status: "Professional",
    goals: 14,
  },
  {
    id: 7,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Virgil van Dijk",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Tokyo Wolves",
    position: "Defender",
    status: "Amateur",
    goals: 2,
  },
  {
    id: 8,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Bruno Fernandes",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Berlin Eagles",
    position: "Midfielder",
    status: "Professional",
    goals: 9,
  },
  {
    id: 9,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Son Heung-min",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sydney Sharks",
    position: "Winger",
    status: "Amateur",
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