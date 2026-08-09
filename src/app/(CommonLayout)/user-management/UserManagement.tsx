/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteUserMutation, useGetUserAnalyticsQuery, useGetUserQuery, useUpdateStatusMutation, useUpdateUserStatusMutation } from '@/features/userManagement/userApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getUsersColumns } from '@/tableColumns/usersColumns';
import { TUserManagement } from '@/types/columnTypes';
import { Search, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UserVerificationModal from './UserVerificationModal';
import AssignTeamsModal from './AssignTeamsModal';

const ROLE_TABS = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Pending Requests', value: 'PENDING_REQUESTS' },
  { label: 'Parents', value: 'PARENT' },
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

  const [selectedUser, setSelectedUser] = useState<TUserManagement | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  const [assignTargetUser, setAssignTargetUser] = useState<TUserManagement | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const { data: analyticsData } = useGetUserAnalyticsQuery({});
  const { data: userData, isLoading } = useGetUserQuery({
    pageNumber: page,
    searchValue: searchTerm,
    role: activeRole,
  });

  const [toggleStatus] = useUpdateStatusMutation();
  const [updateUserStatus, { isLoading: isUpdatingUserStatus }] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "User Management & Player Approval",
      des: "Review pending player registrations, parent accounts, and member permissions."
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

  const handleViewUser = (user: TUserManagement) => {
    setSelectedUser(user);
    setIsVerificationModalOpen(true);
  };

  const handleAssignTeams = (user: TUserManagement) => {
    setAssignTargetUser(user);
    setIsAssignModalOpen(true);
  };

  const handleApproveVerification = async (id: string) => {
    await handleUpdateUserStatus(id, "APPROVED");
  };

  const handleRejectVerification = async (id: string) => {
    await handleUpdateUserStatus(id, "REJECTED");
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

  const analytics = analyticsData?.data || {};
  const pendingCount = analytics.pendingRequests ?? userData?.data?.filter((u: any) => (u.status || '').toUpperCase() === 'PENDING').length ?? 0;

  const items = [
    {
      title: "Total Members",
      value: analytics.totalUsers ?? userData?.pagination?.total ?? 0,
      description: "Total ecosystem users",
      id: "users1",
    },
    {
      title: "Pending Requests",
      value: pendingCount,
      description: "Awaiting admin approval",
      id: "users2",
    },
    {
      title: "Parent Accounts",
      value: analytics.totalParents ?? 0,
      description: "Authenticated parents",
      id: "users3",
    },
    {
      title: "Player Profiles",
      value: analytics.totalPlayers ?? 0,
      description: "Registered player profiles",
      id: "users4",
    },
    {
      title: "Managers",
      value: analytics.totalManagers ?? 0,
      description: "Assigned team managers",
      id: "users5",
    },
    {
      title: "Clubs",
      value: analytics.totalClubs ?? 0,
      description: "Registered club accounts",
      id: "users6",
    },
    {
      title: "Referees",
      value: analytics.totalReferees ?? 0,
      description: "Registered match referees",
      id: "users7",
    },
    {
      title: "Verified Users",
      value: analytics.verifiedUsers ?? 0,
      description: "Users with verified status",
      id: "users8",
    },
  ];

  const tableHeaderPayload = {
    title: "Member List",
    des: "A list of all users, parents, players, and pending player requests.",
    url: "#"
  }

  const columns = getUsersColumns(handleToggleStatus, handleUpdateUserStatus, handleDeleteUser, handleViewUser, handleAssignTeams, activeRole);

  // Filter users by active tab
  const filteredUsers = (userData?.data || []).filter((user: any) => {
    const userRole = (user.role || '').toUpperCase();
    const userStatus = (user.status || '').toUpperCase();
    const isChildPlayer = !!user.parentId || user.password === null || !user.email || (userRole === 'PLAYER' && (!!user.position || !!user.dateOfBirth || !!user.ageGroup || !!user.selectTeam));
    const isParent = !isChildPlayer && !user.parentId && !!user.email;

    if (activeRole === 'PENDING_REQUESTS') {
      if (userStatus !== 'PENDING') return false;
    } else if (activeRole === 'PARENT') {
      if (!isParent) return false;
    } else if (activeRole === 'PLAYER') {
      if (!isChildPlayer) return false;
    } else if (activeRole === 'CLUB') {
      if (!['CLUB', 'CLUBS', 'OTHER_CLUBS'].includes(userRole)) return false;
    } else if (activeRole === 'OTHER') {
      if (['PLAYER', 'MANAGER', 'CLUB', 'CLUBS', 'OTHER_CLUBS', 'REFEREE', 'PARENT'].includes(userRole) || isParent || isChildPlayer) {
        return false;
      }
    } else if (activeRole !== 'ALL') {
      if (userRole !== activeRole && !userRole.includes(activeRole)) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const fullName = (user.userName || user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
      const emailMatch = (user.email || '').toLowerCase().includes(q);
      const roleMatch = (user.role || '').toLowerCase().includes(q);
      const phoneMatch = (user.phone || user.phoneNumber || '').toLowerCase().includes(q);
      if (!fullName.includes(q) && !emailMatch && !roleMatch && !phoneMatch) {
        return false;
      }
    }

    return true;
  });

  // Sort PENDING requests to the top (Newest pending first)
  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    const statusA = (a.status || '').toUpperCase();
    const statusB = (b.status || '').toUpperCase();
    if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
    if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className='py-10 px-8 space-y-6 pb-16'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className="bg-white rounded-md py-4 flex flex-col space-y-4 shadow-sm border border-gray-100">
        {/* Table Header and Search Bar */}
        <div className="px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TableHeader payload={tableHeaderPayload} />

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Role Tabs */}
        <div className="px-6 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {ROLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveRole(tab.value)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeRole === tab.value
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : tab.value === 'PENDING_REQUESTS' && pendingCount > 0
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 font-extrabold'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                }`}
              >
                {tab.label}
                {tab.value === 'PENDING_REQUESTS' && pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Table Section */}
        <div className="px-6">
          <CustomTable
            columns={columns}
            data={sortedUsers}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination Section */}
        <div className="px-6 pt-4 flex justify-between items-center border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-semibold text-gray-900">{sortedUsers.length}</span> entries
          </p>

          {userData?.pagination && (
            <CustomPagination
              TOTAL_PAGES={userData.pagination.totalPage || 1}
              qryName="userPage"
            />
          )}
        </div>
      </div>

      {/* Verification / Detail Modal */}
      <UserVerificationModal
        user={selectedUser}
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setIsVerificationModalOpen(false);
          setSelectedUser(null);
        }}
        onApprove={handleApproveVerification}
        onReject={handleRejectVerification}
        isUpdating={isUpdatingUserStatus}
      />

      {/* Assign Teams Modal */}
      <AssignTeamsModal
        user={assignTargetUser}
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setAssignTargetUser(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
