/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TReward } from '@/types/columnTypes';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomPagination from '@/components/cui/CustomPagination';
import CustomSelect from '@/components/selects/CustomSelect';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import CreateButton from '@/components/buttons/CreateButton';
import { rewardsColumns } from '@/tableColumns/rewardsColumns';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import Link from 'next/link';

const rewards: TReward[] = [
  {
    id: 1,
    rewardName: "ENG WRIST BAND",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    type: "Band",
    pointsRequired: "5 pts",
    status: "Active",
    usage: 320
  },
  {
    id: 2,
    rewardName: "FREE COFFEE",
    image: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png",
    type: "Coffee",
    pointsRequired: "20 pts",
    status: "Inactive",
    usage: 84
  }
];

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
  }
];

const RewardsManagement = () => {

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
        <GeneralStateCard items={items} className='grid-cols-3' />
      </>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
        {/* Left Side: Filters */}
        <div className="flex items-center gap-3">
          {/* Status Dropdown */}
          <CustomSelect selectValues={selectTeamValues} selectType="teamName" />
          <CustomSelect selectValues={selectPositionValues} selectType="playerPosition" />
        </div>
        {/* Right Side: Action Button */}
        <Link href="/rewards-redemption/create-reward">
          <CreateButton text="Create Reward" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<TReward> columns={rewardsColumns} data={rewards} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default RewardsManagement