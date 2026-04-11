/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TTable } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { tableColumns } from '@/tableColumns/tableColumns';



const items = [
  {
    title: "Total Transfers",
    value: 30142,
    id: "table1",
  },
  {
    title: "Pending Review",
    value: 28,
    id: "table2",
  }
];
const tableDatas:TTable[] = [
  {
    id: 1,
    rating: 1,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 2,
    rating:2,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 3,
    rating:3,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 4,
    rating:4,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 5,
    rating:5,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 6,
    rating:6,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 7,
    rating:7,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  },
  {
    id: 8,
    rating:8,
    logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    team: "London Lions",
    played: 2,
    won: 2,
    drawn: 2,
    lost: 2,
    points: 25
  }
];

const TableManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Table Management",
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
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TTable> columns={tableColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default TableManagement