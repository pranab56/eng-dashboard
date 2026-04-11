/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TTransfer } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import { transferColumns } from '@/tableColumns/transferColumns';



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

const tableDatas: TTransfer[] = [
  {
    id: 1,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "John Doe",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Dhaka Warriors",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "London Lions",
  },
  {
    id: 2,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Marcus Rashford",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Manchester United",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Madrid Titans",
  },
  {
    id: 3,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Kevin De Bruyne",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "London Lions",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Paris Saints",
  },
  {
    id: 4,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Luka Modric",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Madrid Titans",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Dhaka Warriors",
  },
  {
    id: 5,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Erling Haaland",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Sylhet Strikers",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Manchester United",
  },
  {
    id: 6,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Kylian Mbappe",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Paris Saints",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Madrid Titans",
  },
  {
    id: 7,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Virgil van Dijk",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Tokyo Wolves",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Berlin Eagles",
  },
  {
    id: 8,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Bruno Fernandes",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Berlin Eagles",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Sydney Sharks",
  },
  {
    id: 9,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Son Heung-min",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Sydney Sharks",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Mumbai Rockets",
  },
  {
    id: 10,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Mohamed Salah",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Mumbai Rockets",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Cape Town Stars",
  },
  {
    id: 11,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    name: "Bukayo Saka",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "New York Bulls",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "Dhaka Warriors",
  },
  {
    id: 12,
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630361/ENG/player2_wpcand.png",
    name: "Harry Kane",
    f_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    f_team: "Cape Town Stars",
    t_logo: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png",
    t_team: "London Lions",
  },
];

const TransferManagement = () => {
const {setHeaders} = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Transfer Management",
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
        <CreateButton text="Add Season Stats" />
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TTransfer> columns={transferColumns} data={tableDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default TransferManagement