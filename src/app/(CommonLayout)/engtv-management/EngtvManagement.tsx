/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TEngtv } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import { engtvColumns } from '@/tableColumns/engtvColumns';
import Link from 'next/link';



const items = [
  {
    title: "Total Videos",
    value: 1482,
    id: "table1",
    description: "Total videos in system"
  },
  {
    title: "Total Duration",
    value: "1200:00",
    id: "table2",
    description: "Total duration of videos"
  }
];

const tableDatas: TEngtv[] = [
  {
    id: 1,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Active"
  },
  {
    id: 2,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Published"
  },
  {
    id: 3,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Active"
  },
  {
    id: 4,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Active"
  },
  {
    id: 5,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Active"
  },
  {
    id: 6,
    name: "Elias Thorne",
    role: "Midfielder",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    duration: "72:44",
    status: "Published"
  }
];

const EngtvManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Dashboard Overview",
      des: "Welcome back, Alexander! Here's an update on your luxury estate portfolio."
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
        <Link href="/engtv-management/create-video">
          <CreateButton text="Add Video" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TEngtv> columns={engtvColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default EngtvManagement