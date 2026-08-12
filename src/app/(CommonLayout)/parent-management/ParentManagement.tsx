"use client"

import React, { useEffect, useState } from 'react';
import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useHeaders } from '@/hooks/useHeaders';
import { getParentColumns } from '@/tableColumns/parentColumns';
import { TUserManagement } from '@/types/columnTypes';
import { Search, X, Users } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useDeleteUserMutation, useGetAllParentsQuery } from '@/features/userManagement/userApi';
import ParentViewModal from './ParentViewModal';
import DeleteConfirmationModal from '../user-management/DeleteConfirmationModal';

const ParentManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedParent, setSelectedParent] = useState<TUserManagement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [deleteTargetParent, setDeleteTargetParent] = useState<TUserManagement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: userData, isLoading } = useGetAllParentsQuery({
    pageNumber: Number(pageNumber),
    searchValue: searchTerm,
  });

  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "Parent & Family Management",
      des: "Review parent account owners, their linked child players, and active subscriptions."
    });
  }, [setHeaders]);

  const handleViewParent = (parent: TUserManagement) => {
    setSelectedParent(parent);
    setIsViewModalOpen(true);
  };

  const handleDeleteParentClick = (parent: TUserManagement) => {
    setDeleteTargetParent(parent);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteUser({ id }).unwrap();
      toast.success("Parent account deleted successfully");
      setIsDeleteModalOpen(false);
      setDeleteTargetParent(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete parent account");
    }
  };

  const rawParents = userData?.data || [];
  const pagination = userData?.pagination || { totalPage: 1, total: rawParents.length };

  // Instant client-side search filter over Parent name, email, phone, and child player names
  const filteredParents = rawParents.filter((parent: any) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const fullName = `${parent.firstName || ''} ${parent.lastName || ''}`.toLowerCase();
    const userName = (parent.userName || '').toLowerCase();
    const email = (parent.email || '').toLowerCase();
    const phone = (parent.phone || '').toLowerCase();
    const childrenNames = (parent.myPlayers || parent.children || [])
      .map((c: any) => `${c.firstName || ''} ${c.lastName || ''} ${c.userName || ''}`.toLowerCase())
      .join(' ');

    return (
      fullName.includes(q) ||
      userName.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      childrenNames.includes(q)
    );
  });

  // Calculate total child players and total subscribed child players
  const totalChildPlayers = rawParents.reduce((acc: number, p: any) => {
    const children = p.myPlayers || p.children || [];
    return acc + children.length;
  }, 0);

  const totalSubscribedChildPlayers = rawParents.reduce((acc: number, p: any) => {
    const children = p.myPlayers || p.children || [];
    return acc + children.filter((c: any) => Boolean(c.subscription || c.isPaid)).length;
  }, 0);

  const summaryItems = [
    {
      title: "Total Parents",
      value: pagination.total || rawParents.length,
      id: "total_parents",
      description: "Registered parent account owners"
    },
    {
      title: "Linked Child Players",
      value: totalChildPlayers,
      id: "total_children",
      description: "Total children managed under parents"
    },
    {
      title: "Subscribed Child Players",
      value: totalSubscribedChildPlayers,
      id: "active_subscriptions",
      description: "Child players with active package"
    }
  ];

  const tableHeaderPayload = {
    title: "Parent Account Owners",
    url: "#"
  };

  return (
    <div className="p-4 sm:p-6 lg:pt-10 lg:px-8 space-y-4 sm:space-y-6">
      {/* State Summary Cards */}
      <div className="w-full">
        <GeneralStateCard items={summaryItems} className="grid-cols-1 sm:grid-cols-3" />
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 py-3 sm:py-4 flex flex-col">
        {/* Search Toolbar */}
        <div className="px-4 sm:px-6 pt-2 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search parents by name, email, phone, or child's name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400 bg-slate-50/50 hover:bg-white focus:bg-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 p-0.5 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-2 sm:pt-4">
            <CustomTable<TUserManagement>
              columns={getParentColumns(handleViewParent, handleDeleteParentClick)}
              data={filteredParents}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="pt-4 sm:pt-8 px-2 sm:px-4">
          <CustomPagination
            TOTAL_PAGES={pagination.totalPage || 1}
            qryName="userPage"
          />
        </div>
      </div>

      <ParentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedParent(null);
        }}
        parent={selectedParent}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetParent(null);
        }}
        onConfirm={handleConfirmDelete}
        user={deleteTargetParent as any}
        isDeleting={isDeletingUser}
      />
    </div>
  );
};

export default ParentManagement;
