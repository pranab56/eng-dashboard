/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TNews } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import { newsColumns } from '@/tableColumns/newsColumns';
import Link from 'next/link';

const tableDatas: TNews[] = [
  {
    id: 1,
    title: "Match Day Highlights",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    category: "Match",
    author: "Admin",
    publishDate: "10 Apr"
  },
  {
    id: 2,
    title: "Transfer Rumors",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    category: "Transfer",
    author: "Admin",
    publishDate: "10 Apr"
  },
  {
    id: 3,
    title: "Stadium Renovation Update",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    category: "Internal",
    author: "Admin",
    publishDate: "10 Apr"
  },
  {
    id: 4,
    title: "Match Day Highlights",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    category: "Match",
    author: "Admin",
    publishDate: "10 Apr"
  },
  {
    id: 5,
    title: "Match Day Highlights",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    category: "Match",
    author: "Admin",
    publishDate: "10 Apr"
  }
];

const NewsManagement = () => {

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        {/* Left Side: Filters */}
        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <CustomSelect selectValues={selectTeamValues} selectType="teamName" />
          <CustomSelect selectValues={selectPositionValues} selectType="playerPosition" />
        </div>
        {/* Right Side: Action Button */}
        <Link href="/news-management/create-news">
          <CreateButton text="Add News" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TNews> columns={newsColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default NewsManagement