"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import { CustomModal } from '@/components/modals/CustomModal';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteVideoMutation, useGetAllVideoQuery } from '@/features/engTVManagement/engApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getEngtvColumns } from '@/tableColumns/engtvColumns';
import { TEngtv } from '@/types/columnTypes';
import { getErrorMessage } from '@/utils/getErrorMessage';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { baseURL } from '../../../utils/BaseURL';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';

const EngtvManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get('userPage') || '1';

  const { data: videoData, isLoading } = useGetAllVideoQuery(page);
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();

  const [selectedVideo, setSelectedVideo] = useState<TEngtv | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "ENG TV Management",
      des: "Manage your video content, categories, and publishing schedules."
    })
  }, [setHeaders])

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteVideo(deletingId).unwrap();
      toast.success("Video deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete video"));
    }
  };

  const handleView = (video: TEngtv) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const items = [
    {
      title: "Total Videos",
      value: videoData?.pagination?.total || 0,
      id: "table1",
      description: "Total videos in system"
    }
  ];

  const tableHeaderPayload = {
    title: "Video Content List",
    url: "#"
  }

  const columns = getEngtvColumns(handleView, handleDelete);

  useEffect(() => {
    if (!isModalOpen) {
      setSelectedVideo(null);
    }
  }, [isModalOpen])

  return (
    <div className='pt-10 px-8 space-y-4'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className="flex flex-wrap items-center justify-end">
        <Link href="/engtv-management/create-video">
          <CreateButton text="Add Video" />
        </Link>
      </div>

      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1'>
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">Loading videos...</div>
            ) : (
              <CustomTable<TEngtv> columns={columns} data={videoData?.data || []} />
            )}
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={videoData?.pagination?.totalPage || 1} qryName="userPage" />
        </div>
      </div>

      <CustomModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title="Video Details"
        className="max-w-2xl"
      >
        {selectedVideo ? (
          <div className="space-y-4 pb-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedVideo.videoUrl && (
                <video src={baseURL + selectedVideo.videoUrl} controls className="w-full h-full" />
              )}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h3>
                <p className="text-sm text-gray-500 capitalize">{selectedVideo.category}</p>
              </div>
              <div className={`px-2 py-1 rounded text-xs font-semibold capitalize ${selectedVideo.status === 'publish' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {selectedVideo.status}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedVideo.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>Created: {new Date(selectedVideo.createdAt).toLocaleString()}</div>
              <div>Published: {selectedVideo.publishDateTime ? new Date(selectedVideo.publishDateTime).toLocaleString() : "Not scheduled"}</div>
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400 font-medium italic">
            Loading details...
          </div>
        )}
      </CustomModal>


      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Video Deletion"
        description="Are you sure you want to remove this video from EngTV? This action is permanent and cannot be reversed."
      />

    </div>
  )
}

export default EngtvManagement
