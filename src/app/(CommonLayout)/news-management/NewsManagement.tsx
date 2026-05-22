/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CreateButton from '@/components/buttons/CreateButton';
import CustomPagination from '@/components/cui/CustomPagination';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteNewsMutation, useGetAllNewsQuery } from '@/features/news/newsApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getNewsColumns } from '@/tableColumns/newsColumns';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteConfirmModal from '../match-management/DeleteConfirmModal';
import NewsViewModal from './NewsViewModal';


const NewsManagement = () => {

  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("newsPage") || "1";

  const { data: newsData, isLoading } = useGetAllNewsQuery(page);
  const [deleteNews, { isLoading: isDeleting }] = useDeleteNewsMutation();

  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setHeaders({
      title: "News Management",
      des: "Distribute official club updates and press releases across the digital network."
    })
  }, [])

  const handleView = (news: any) => {
    setSelectedNews(news);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await deleteNews(deletingId).unwrap();
      if (res.success) {
        toast.success(res.message || "News article deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingId(null);
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete news article");
    }
  };

  const tableHeaderPayload = {
    title: "Editorial Registry",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <div className="flex flex-wrap items-center justify-end gap-4 p-4 bg-white rounded-lg border border-gray-100">
        <Link href="/news-management/create-news">
          <CreateButton text="Create News Article" />
        </Link>
      </div>
      <div className=" bg-white rounded-md py-4 flex flex-col">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<any> columns={getNewsColumns(handleView, handleDelete)} data={newsData?.data || []} isLoading={isLoading} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={newsData?.pagination?.totalPage || 1} qryName="newsPage" />
        </div>
      </div>

      <NewsViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        news={selectedNews}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Confirm Deletion"
        description="Are you sure you want to delete this specific news article? This action cannot be undone."
      />
    </div>
  )
}

export default NewsManagement;