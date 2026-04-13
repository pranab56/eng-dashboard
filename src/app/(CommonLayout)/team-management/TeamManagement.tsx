/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TTeam } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { teamColumns } from '@/tableColumns/teamColumns';
import TableTitle from '@/components/titles/TableTitle';
import ExportButton from '@/components/buttons/ExportButton';
import CreateButton from '@/components/buttons/CreateButton';
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

const tableDatas: TTeam[] = [
  {
    id: 1,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    since: "Founded 1992",
    total_player: 19,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 2,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Dhaka Warriors",
    since: "Founded 2005",
    total_player: 22,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 3,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Manchester United",
    since: "Founded 1878",
    total_player: 25,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Suspended",
  },
  {
    id: 4,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sylhet Strikers",
    since: "Founded 2012",
    total_player: 18,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 5,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Madrid Titans",
    since: "Founded 1902",
    total_player: 24,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 6,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Paris Saints",
    since: "Founded 1970",
    total_player: 21,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 7,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Tokyo Wolves",
    since: "Founded 1998",
    total_player: 20,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Suspended",
  },
  {
    id: 8,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Berlin Eagles",
    since: "Founded 1963",
    total_player: 23,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 9,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Sydney Sharks",
    since: "Founded 1985",
    total_player: 17,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 10,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Mumbai Rockets",
    since: "Founded 2008",
    total_player: 26,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
  {
    id: 11,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "New York Bulls",
    since: "Founded 1995",
    total_player: 21,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Suspended",
  },
  {
    id: 12,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "Cape Town Stars",
    since: "Founded 2010",
    total_player: 19,
    player_imgs: ["https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png", "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png"],
    status: "Active",
  },
];

const TeamManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Teams",
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
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <div className="flex items-center justify-between px-6 py-1">
            <TableTitle payload={{ title: tableHeaderPayload.title }} />
            <div className='flex gap-2'>
              <ExportButton url={tableHeaderPayload.url || ""} />
              <Link href="/team-management/add-team">
                <CreateButton text="Add Team" />
              </Link>
            </div>
          </div>
          <div className="pt-4">
            <CustomTable<TTeam> columns={teamColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default TeamManagement