/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TPlayer } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import { playerColumns } from '@/tableColumns/playerColumns';
import Link from 'next/link';



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
    goals: 12,
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Marcus Rashford",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    position: "Striker",
    goals: 10,
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Kevin De Bruyne",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Manchester United",
    position: "Midfielder",
    goals: 8,
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Luka Modric",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Madrid Titans",
    position: "Midfielder",
    goals: 5,
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Erling Haaland",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sylhet Strikers",
    position: "Striker",
    goals: 15,
  },
  {
    id: 6,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Kylian Mbappe",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Paris Saints",
    position: "Forward",
    goals: 14,
  },
  {
    id: 7,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Virgil van Dijk",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Tokyo Wolves",
    position: "Defender",
    goals: 2,
  },
  {
    id: 8,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Bruno Fernandes",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Berlin Eagles",
    position: "Midfielder",
    goals: 9,
  },
  {
    id: 9,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Son Heung-min",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sydney Sharks",
    position: "Winger",
    goals: 11,
  },
  {
    id: 10,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Mohamed Salah",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Mumbai Rockets",
    position: "Forward",
    goals: 13,
  },
  {
    id: 11,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Bukayo Saka",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "New York Bulls",
    position: "Winger",
    goals: 7,
  },
  {
    id: 12,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Harry Kane",
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Cape Town Stars",
    position: "Striker",
    goals: 16,
  },
];

const PlayerManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Players",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, [])

  const tableHeaderPayload = {
    title: "Point Table List",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        {/* Left Side: Filters */}
        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <CustomSelect selectValues={selectTeamValues} selectType="teamName" />
          <CustomSelect selectValues={selectPositionValues} selectType="playerPosition" />
        </div>
        {/* Right Side: Action Button */}
        <Link href="/player-management/create-player">
          <CreateButton text="Add Player" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TPlayer> columns={playerColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default PlayerManagement