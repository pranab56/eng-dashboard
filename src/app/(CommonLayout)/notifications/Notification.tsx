/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TNotification } from '@/types/columnTypes';
import CustomPagination from '@/components/cui/CustomPagination';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import CustomSelect from '@/components/selects/CustomSelect';
import CreateButton from '@/components/buttons/CreateButton';
import { selectPositionValues, selectTeamValues } from '@/constants/selectData';
import { notificationColumns } from '@/tableColumns/notificationColumns';
import { CustomModal } from '@/components/modals/CustomModal';
import SendNotification from './SendNotification';


const Notification = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Dashboard Overview",
      des: "Welcome back, Alexander! Here's an update on your luxury estate portfolio."
    })
  }, [])

  const notificationDatas: TNotification[] = [
    {
      id: 1,
      title: "Marcus Drax signs for Thunder FC",
      subtitle: "S. Grealish officially joins the starting XI for Sunday.",
      type: "Transfer Alert",
      date: "Oct 20, 2023 • 14:32"
    },
    {
      id: 2,
      title: "Neon United adds new midfielder",
      subtitle: "S. Grealish officially joins the starting XI for Sunday.",
      type: "Feature",
      date: "Oct 20, 2023 • 14:32"
    },
    {
      id: 3,
      title: "Marcus Drax signs for Thunder FC",
      subtitle: "S. Grealish officially joins the starting XI for Sunday.",
      type: "Transfer Alert",
      date: "Oct 20, 2023 • 14:32"
    },
    {
      id: 4,
      title: "Marcus Drax signs for Thunder FC",
      subtitle: "S. Grealish officially joins the starting XI for Sunday.",
      type: "Transfer Alert",
      date: "Oct 20, 2023 • 14:32"
    },
    {
      id: 5,
      title: "Neon United adds new midfielder",
      subtitle: "S. Grealish officially joins the starting XI for Sunday.",
      type: "Feature",
      date: "Oct 20, 2023 • 14:32"
    }
  ];

  const tableHeaderPayload = {
    title: "Notifications",
    des: "",
    url: "https://example.com/export-notifications"
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
        {/* <CreateButton text="Send Notification" /> */}
        <CustomModal
          title="Create New Notification"
          trigger={<button><CreateButton text="Send Notification" /></button>}
        >
          <SendNotification />
        </CustomModal>
      </div>
      <div className=" bg-white rounded-md py-4 min-h-[600px] flex flex-col">
        <div className='flex-1'>
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4">
            <CustomTable<TNotification> columns={notificationColumns} data={notificationDatas} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="page" />
        </div>
      </div>
    </div>
  )
}

export default Notification