/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteeventMutation, useGetEventQuery } from '@/features/eventManagement/eventApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getEventColumns } from '@/tableColumns/eventColumns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import EventViewModal from './EventViewModal';


const EventManagement = () => {

  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("eventPage") || "1";

  const { data: eventData, isLoading } = useGetEventQuery(page);
  console.log("event Data", eventData)
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteeventMutation();

  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "Event Management",
      des: "Organize, schedule, and verify club events and matchdays across the digital network."
    })
  }, [])

  const handleView = (event: any) => {
    setSelectedEvent(event);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteEvent(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "Event deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete event");
    }
  };

  const tableHeaderPayload = {
    title: "Event Registry",
    url: ""
  }

  return (
    <div className='pt-10 px-8 space-y-4'>
      <div className="flex flex-wrap items-center justify-end gap-4 p-4 bg-white rounded-lg border border-gray-100">
        <Link href="/event-management/create-event">
          <CreateButton text="Create Event" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<any> columns={getEventColumns(handleView, handleDelete)} data={eventData?.data || []} isLoading={isLoading} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={eventData?.pagination?.totalPage || 1} qryName="eventPage" />
        </div>
      </div>

      <EventViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        event={selectedEvent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Deletion"
        description="Are you sure you want to delete this specific event? This action cannot be undone."
      />
    </div>
  )
}

export default EventManagement;
