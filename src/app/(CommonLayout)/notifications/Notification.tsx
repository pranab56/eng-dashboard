"use client"


import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import { CustomModal } from '@/components/modals/CustomModal';
import CustomTable from '@/components/table/CustomTable';
import { useGetNotificationsQuery } from '@/features/notification/notificationApi';
import { useHeaders } from '@/hooks/useHeaders';
import { notificationColumns } from '@/tableColumns/notificationColumns';
import { TNotification } from '@/types/columnTypes';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import SendNotification from './SendNotification';


const Notification = () => {
  const searchParams = useSearchParams();
  const page = searchParams.get('page') || '1';

  const { setHeaders } = useHeaders();
  const { data: notificationData, isLoading } = useGetNotificationsQuery(page);

  useEffect(() => {
    setHeaders({
      title: "Notification Center",
      des: "Review and manage all system and user notifications."
    })
  }, [setHeaders])

  const tableHeaderPayload = {
    title: "Notifications",
    des: "A complete list of all broadcasted notifications.",
    url: ""
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <div className="flex flex-wrap items-center justify-end">
        <CustomModal
          title="Send New Notification"
          trigger={<button><CreateButton text="Send Notification" /></button>}
        >
          <SendNotification />
        </CustomModal>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1 pb-4'>
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<TNotification>
              columns={notificationColumns}
              data={notificationData?.data || []}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination
            TOTAL_PAGES={notificationData?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>
    </div>
  )
}

export default Notification
