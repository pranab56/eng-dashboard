/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TMatch } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { IoArrowForwardSharp } from "react-icons/io5";
import Link from 'next/link';
import { matchColumns } from '@/tableColumns/matchColumns';
import TableTitle from '@/components/titles/TableTitle';



const items = [
  {
    title: "Active Players",
    value: 30453,
    id: "home1",
  },
  {
    title: "Total Matches",
    value: 10045,
    id: "home2",
  },
  {
    title: "Teams Count",
    value: 200,
    id: "home3",
  },
  {
    title: "Live Matches",
    value: 10,
    id: "home4",
  },
];

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

const Home = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Dashboard Overview",
      des: "Welcome back, Alexander! Here's an update on your luxury estate portfolio."
    })
  }, [])



  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1'>
          <div className="flex items-center justify-between px-6 py-1">
            <TableTitle payload={{ title: "Matches Registry", des: "Real-time update stream for active league matches." }} />
            <Link href="/match-management" className='flex items-center gap-2 hover:text-gray-600 transition-colors duration-300'>
              View All Matches
              <IoArrowForwardSharp />
            </Link>
          </div>
          <div className="pt-4">
            <CustomTable<TMatch> columns={matchColumns} data={matchDatas} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home