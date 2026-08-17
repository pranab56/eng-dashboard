/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteVideoMutation, useGetAllVideoQuery, useRearrangeVideosMutation } from '@/features/engTVManagement/engApi';
import { useGetAllVideoCategoryQuery } from '@/features/categoryManagement/categoryApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getEngtvColumns } from '@/tableColumns/engtvColumns';
import { TEngtv } from '@/types/columnTypes';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import EngTvViewModal from './EngTvViewModal';

const EngtvManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get('userPage') || '1';

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const { data: videoData, isLoading } = useGetAllVideoQuery({ page, category: selectedCategory });
  const { data: categoriesData } = useGetAllVideoCategoryQuery({});
  console.log("video data", videoData)

  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();
  const [rearrangeVideos] = useRearrangeVideosMutation();

  const [localVideos, setLocalVideos] = useState<TEngtv[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<TEngtv | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (videoData?.data) {
      setLocalVideos(videoData.data);
    }
  }, [videoData]);

  const handleDragEnd = async (startIndex: number, endIndex: number) => {
    const updatedVideos = [...localVideos];
    const [removed] = updatedVideos.splice(startIndex, 1);
    updatedVideos.splice(endIndex, 0, removed);

    setLocalVideos(updatedVideos);

    const limit = videoData?.pagination?.limit || 10;
    const pageNum = Number(page) || 1;
    const offset = (pageNum - 1) * limit;

    const reorderedPayload = updatedVideos.map((video, index) => ({
      id: video._id,
      order: offset + index + 1,
      isHighlight: !!video.isHighlight
    }));

    try {
      await rearrangeVideos({ videos: reorderedPayload }).unwrap();
      toast.success("Videos rearranged successfully");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to rearrange videos");
      if (videoData?.data) {
        setLocalVideos(videoData.data);
      }
    }
  };

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
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete video");
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[200px]"
          >
            <option value="">All Categories</option>
            {categoriesData?.data?.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
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
              <CustomTable<TEngtv>
                columns={columns}
                data={localVideos}
                isSortable={true}
                onDragEnd={handleDragEnd}
              />
            )}
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={videoData?.pagination?.totalPage || 1} qryName="userPage" />
        </div>
      </div>

      <EngTvViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        video={selectedVideo}
      />


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