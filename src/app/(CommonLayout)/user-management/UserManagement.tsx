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
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UserVerificationModal from './UserVerificationModal';
import AssignTeamsModal from './AssignTeamsModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import UserEditProfileModal from './UserEditProfileModal';

const ROLE_TABS = [
  { label: 'All Users', value: 'ALL' },
  { label: 'Pending Requests', value: 'PENDING_REQUESTS' },
  { label: 'Players', value: 'PLAYER' },
  { label: 'Trial Players', value: 'OTHER_CLUBS' },
  { label: 'Tournament Players', value: 'TOURNAMENT_PLAYER' },
  { label: 'Managers', value: 'MANAGER' },
  { label: 'Referees', value: 'REFEREE' },
];

const UserManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = searchParams.get('userPage') || '1';

  const [activeRole, setActiveRole] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Automatically reset userPage to 1 in URL when user types in search box or switches role tabs
  useEffect(() => {
    const currentPageParam = searchParams.get('userPage');
    if (currentPageParam && currentPageParam !== '1') {
      const params = new URLSearchParams(searchParams.toString());
      params.set('userPage', '1');
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [searchTerm, activeRole]);

  const [selectedUser, setSelectedUser] = useState<TUserManagement | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  const [assignTargetUser, setAssignTargetUser] = useState<TUserManagement | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<TUserManagement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  const [editTargetUser, setEditTargetUser] = useState<TUserManagement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

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
      des: "Review pending player registrations and member permissions."
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

  const handleUpdateUserStatus = async (id: string, status: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    try {
      await updateUserStatus({ id, data: { status, rejectionReason } }).unwrap();
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

  const handleRejectVerification = async (id: string, rejectionReason?: string) => {
    await handleUpdateUserStatus(id, "REJECTED", rejectionReason);
  };

  const currentList = userData?.data || [];

  const handleDeleteUserClick = (id: string) => {
    const target = (currentList || []).find((u: any) => u._id === id);
    if (target) {
      setDeleteTargetUser(target);
    } else {
      setDeleteTargetUser({ _id: id } as any);
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = async (id: string) => {
    try {
      setIsDeletingUser(true);
      await deleteUser({ id }).unwrap();
      toast.success("Account deleted successfully! Email is now free to register again.");
      setIsDeleteModalOpen(false);
      setDeleteTargetUser(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    } finally {
      setIsDeletingUser(false);
    }
  };

  // Filter users by active tab (for normal tabs)
  const filteredUsers = (userData?.data || []).filter((user: any) => {
    const userRole = (user.role || '').toUpperCase();
    const userStatus = (user.status || '').toUpperCase();
    const isChildPlayer = !!user.parentId || user.password === null || !user.email || (userRole === 'PLAYER' && (!!user.position || !!user.dateOfBirth || !!user.ageGroup || !!user.selectTeam));
    const isParent = !isChildPlayer && !user.parentId && !!user.email && !['MANAGER', 'REFEREE', 'CLUB', 'CLUBS', 'OTHER_CLUBS', 'ADMIN', 'SUPER_ADMIN'].includes(userRole) && !user.position && !user.dateOfBirth;

    // Always exclude Parent accounts from User Management tables
    if (isParent) return false;

    // Require active subscription / paid access for player profiles (PLAYER, OTHER_CLUBS, TOURNAMENT_PLAYER)
    // EXCEPT when reviewing PENDING requests or PENDING status!
    const isPlayerRole = ['PLAYER', 'OTHER_CLUBS', 'CLUB', 'CLUBS', 'TOURNAMENT_PLAYER'].includes(userRole) || isChildPlayer;
    const isPaid = Boolean(user.subscription || user.activeSubscription || user.isPaid);

    if (activeRole === 'PENDING_REQUESTS') {
      if (userStatus !== 'PENDING') return false;
    } else {
      if (isPlayerRole && !isPaid && userStatus !== 'PENDING') return false;
      if (activeRole === 'PLAYER') {
        if (!isChildPlayer && userRole !== 'PLAYER') return false;
      } else if (activeRole === 'OTHER_CLUBS') {
        if (userRole !== 'OTHER_CLUBS' && userRole !== 'CLUB' && userRole !== 'CLUBS') return false;
      } else if (activeRole === 'TOURNAMENT_PLAYER') {
        if (userRole !== 'TOURNAMENT_PLAYER') return false;
      } else if (activeRole !== 'ALL') {
        if (userRole !== activeRole && !userRole.includes(activeRole)) return false;
      }
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const fullName = (user.userName || user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
      const emailMatch = (user.email || '').toLowerCase().includes(q);
      const roleMatch = (user.role || '').toLowerCase().includes(q);
      const phoneMatch = (user.phone || user.phoneNumber || '').toLowerCase().includes(q);

      return fullName.includes(q) || emailMatch || roleMatch || phoneMatch;
    }

    return true;
  });

  const analytics = analyticsData?.data || {};
  const pendingCount = analytics.pendingRequests ?? (userData?.data || []).filter((u: any) => (u.status || '').toUpperCase() === 'PENDING').length;

  const items = [
    {
      title: "Total Members",
      value: analytics.totalUsers ?? 0,
      description: "Active members in platform",
      id: "users1",
    },
    {
      title: "Pending Player Registrations",
      value: pendingCount,
      description: "Registrations awaiting approval",
      id: "users2",
    },
    {
      title: "Approved Players",
      value: analytics.approvedPlayers ?? 0,
      description: "Verified active players",
      id: "users3",
    },
    {
      title: "Trial Players",
      value: analytics.totalTrialPlayers ?? 0,
      description: "Registered trial players",
      id: "users6",
    },
    {
      title: "Tournament Players",
      value: analytics.totalTournamentPlayers ?? 0,
      description: "Tournament player profiles",
      id: "users9",
    },
    {
      title: "Managers",
      value: analytics.totalManagers ?? 0,
      description: "Assigned team managers",
      id: "users5",
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
    des: "A list of all players, trial players, tournament players, managers, and pending player requests.",
    url: "#"
  };

  const handleEditProfile = (user: TUserManagement) => {
    setEditTargetUser(user);
    setIsEditModalOpen(true);
  };

  const columns = getUsersColumns(handleToggleStatus, handleUpdateUserStatus, handleDeleteUserClick, handleViewUser, handleAssignTeams, activeRole, handleEditProfile);

  const displayTableData = [...filteredUsers].sort((a: any, b: any) => {
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
            {ROLE_TABS.map((tab) => {
              const isPendingTab = tab.value === 'PENDING_REQUESTS';
              const isSelected = activeRole === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveRole(tab.value)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : isPendingTab
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-300 font-extrabold'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60'
                  }`}
                >
                  <span>{tab.label}</span>

                  {isPendingTab && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black transition-colors ${
                      isSelected ? 'bg-amber-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table Section */}
        <div className="px-6">
          <CustomTable
            columns={columns}
            data={displayTableData}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination Section */}
        <div className="px-6 pt-4 flex justify-between items-center border-t border-gray-100">
          <p className="text-xs text-gray-500 font-medium">
            Showing <span className="font-semibold text-gray-900">{displayTableData.length}</span> entries
          </p>

          {userData?.pagination && (
            <CustomPagination
              TOTAL_PAGES={
                (searchTerm.trim() !== '' || activeRole !== 'ALL') && displayTableData.length < 10 && Number(page) === 1
                  ? 1
                  : Math.max(1, userData.pagination.totalPage || userData.pagination.totalPages || 1)
              }
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        user={deleteTargetUser}
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetUser(null);
        }}
        onConfirm={handleConfirmDeleteUser}
        isDeleting={isDeletingUser}
      />

      {/* Edit Profile Picture & Details Modal */}
      <UserEditProfileModal
        user={editTargetUser}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditTargetUser(null);
        }}
      />
    </div>
  );
};

export default UserManagement;
