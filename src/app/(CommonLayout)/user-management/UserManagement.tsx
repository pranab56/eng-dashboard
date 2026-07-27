/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteUserMutation, useGetUserQuery, useUpdateStatusMutation, useUpdateUserStatusMutation } from '@/features/userManagement/userApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getUsersColumns } from '@/tableColumns/usersColumns';
import { TUserManagement } from '@/types/columnTypes';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const ROLE_TABS = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Players', value: 'PLAYER' },
  { label: 'Managers', value: 'MANAGER' },
  { label: 'Clubs', value: 'CLUB' },
  { label: 'Referees', value: 'REFEREE' },
  { label: 'Others', value: 'OTHER' },
];

const UserManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get('userPage') || '1';

  const [activeRole, setActiveRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data: userData, isLoading } = useGetUserQuery({
    pageNumber: page,
    searchValue: searchTerm,
    role: activeRole,
  });

  const [toggleStatus] = useUpdateStatusMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "User Management",
      des: "Manage ecosystem permissions and member access levels."
    })
  }, [setHeaders])

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus({ id }).unwrap();
      toast.success("User verification status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update verification status");
    }
  };

  const handleUpdateUserStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await updateUserStatus({ id, data: { status } }).unwrap();
      toast.success(`User status updated to ${status}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser({ id }).unwrap();
        toast.success("User deleted successfully");
      } catch (error: any) {
        toast.error(error?.data?.message || "Failed to delete user");
      }
    }
  };

  const items = [
    {
      title: "Total Users",
      value: userData?.pagination?.total || 0,
      description: "Registered members in ecosystem",
      id: "users1",
    },
    {
      title: "Active Players",
      value: userData?.data?.filter((u: any) => u.role === 'PLAYER').length || 0,
      description: "Currently active players",
      id: "users2",
    },
    {
      title: "Verified Users",
      value: userData?.data?.filter((u: any) => u.verified).length || 0,
      description: "Users with verified status",
      id: "users3",
    },
    {
      title: "Pending Users",
      value: userData?.data?.filter((u: any) => !u.verified).length || 0,
      description: "Users awaiting verification",
      id: "users4",
    },
  ];

  const tableHeaderPayload = {
    title: "Member List",
    des: "A list of all users and their respective roles and status.",
    url: "#"
  }

  const columns = getUsersColumns(handleToggleStatus, handleUpdateUserStatus, handleDeleteUser);

  // Instant client-side fallback filtering
  const filteredUsers = (userData?.data || []).filter((user: any) => {
    if (activeRole !== 'ALL') {
      const userRole = (user.role || '').toUpperCase();
      if (activeRole === 'OTHER') {
        if (['PLAYER', 'MANAGER', 'CLUB', 'REFEREE'].includes(userRole)) {
          return false;
        }
      } else if (userRole !== activeRole) {
        return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const nameMatch = (user.userName || user.name || '').toLowerCase().includes(q);
      const emailMatch = (user.email || '').toLowerCase().includes(q);
      const roleMatch = (user.role || '').toLowerCase().includes(q);
      const phoneMatch = (user.phone || '').toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !roleMatch && !phoneMatch) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className='py-10 px-8 space-y-6 pb-16'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className="bg-white rounded-md py-4 min-h-[600px] flex flex-col space-y-4">
        {/* Table Header and Search Bar */}
        <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TableHeader payload={tableHeaderPayload} />

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-10 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs matching provided design */}
        <div className="px-6">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-gray-100/80 rounded-xl border border-gray-100 flex-wrap">
            {ROLE_TABS.map((tab) => {
              const isActive = activeRole === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveRole(tab.value)}
                  className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all cursor-pointer ${isActive
                      ? 'bg-white text-blue-600 shadow-sm border border-gray-100 font-bold'
                      : 'text-gray-500 hover:text-gray-900 font-medium'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1">
          <div className="pt-2 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-48 text-gray-500 font-medium">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-48 text-gray-400 space-y-2">
                <p className="text-sm font-semibold">No users found</p>
                <p className="text-xs">Try selecting another category tab or clearing your search.</p>
              </div>
            ) : (
              <CustomTable<TUserManagement> columns={columns} data={filteredUsers} />
            )}
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={userData?.pagination?.totalPage || 1} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default UserManagement
