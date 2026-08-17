/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import {
  useDeleteUserMutation,
  useGetIncompleteUsersQuery,
  useUpdateStatusMutation,
  useUpdateUserStatusMutation,
} from '@/features/userManagement/userApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getUsersColumns } from '@/tableColumns/usersColumns';
import { TUserManagement } from '@/types/columnTypes';
import { Check, ChevronsUpDown, Filter, RotateCcw, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import UserVerificationModal from '../user-management/UserVerificationModal';
import AssignTeamsModal from '../user-management/AssignTeamsModal';
import DeleteConfirmationModal from '../user-management/DeleteConfirmationModal';
import UserEditProfileModal from '../user-management/UserEditProfileModal';

const IncompleteAccounts = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get('userPage') || '1';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [statusPopoverOpen, setStatusPopoverOpen] = useState<boolean>(false);

  const [selectedUser, setSelectedUser] = useState<TUserManagement | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState<boolean>(false);

  const [assignTargetUser, setAssignTargetUser] = useState<TUserManagement | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const [deleteTargetUser, setDeleteTargetUser] = useState<TUserManagement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  const [editTargetUser, setEditTargetUser] = useState<TUserManagement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  const { data: incompleteData, isLoading } = useGetIncompleteUsersQuery({
    pageNumber: page,
    searchValue: searchTerm,
  });

  const [toggleStatus] = useUpdateStatusMutation();
  const [updateUserStatus, { isLoading: isUpdatingUserStatus }] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "Incomplete & Abandoned Accounts",
      des: "Review accounts with unverified emails, rejected applications, or incomplete registration setups."
    });
  }, [setHeaders]);

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

  const rawList = incompleteData?.data || [];

  // Count breakdowns
  const totalIncomplete = incompleteData?.pagination?.total ?? rawList.length;
  const unverifiedCount = rawList.filter((u: any) => u.verified === false).length;
  const verifiedCount = rawList.filter((u: any) => u.verified === true).length;
  const rejectedCount = rawList.filter((u: any) => (u.status || '').toUpperCase() === 'REJECTED').length;
  const pendingCount = rawList.filter((u: any) => (u.status || '').toUpperCase() === 'PENDING').length;

  // Filter in real-time by status and search input
  const displayTableData = rawList.filter((user: any) => {
    // Status Filter
    if (statusFilter === 'UNVERIFIED' && user.verified !== false) return false;
    if (statusFilter === 'VERIFIED' && user.verified !== true) return false;
    if (statusFilter === 'REJECTED' && (user.status || '').toUpperCase() !== 'REJECTED') return false;
    if (statusFilter === 'PENDING' && (user.status || '').toUpperCase() !== 'PENDING') return false;

    // Search Filter
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    const fullName = (user.userName || user.name || `${user.firstName || ''} ${user.lastName || ''}`).toLowerCase();
    const emailMatch = (user.email || '').toLowerCase().includes(q);
    const roleMatch = (user.role || '').toLowerCase().includes(q);
    const phoneMatch = (user.phone || user.phoneNumber || '').toLowerCase().includes(q);
    const reasonMatch = (user.incompleteReason || '').toLowerCase().includes(q);

    return fullName.includes(q) || emailMatch || roleMatch || phoneMatch || reasonMatch;
  });

  const handleDeleteUserClick = (id: string) => {
    const target = rawList.find((u: any) => u._id === id);
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

  const handleEditProfile = (user: TUserManagement) => {
    setEditTargetUser(user);
    setIsEditModalOpen(true);
  };

  const items = [
    {
      title: "Total Incomplete Accounts",
      value: totalIncomplete,
      description: "Accounts requiring cleanup or completion",
      id: "inc1",
    },
    {
      title: "Unverified Email Signups",
      value: unverifiedCount,
      description: "Signups without OTP verification",
      id: "inc2",
    },
    {
      title: "Rejected Applications",
      value: rejectedCount,
      description: "Profiles rejected by platform admin",
      id: "inc3",
    },
    {
      title: "Actionable Accounts",
      value: totalIncomplete,
      description: "Safe to delete to allow clean re-registration",
      id: "inc4",
    },
  ];

  const tableHeaderPayload = {
    title: "Incomplete / Abandoned & Rejected Accounts",
    des: "Delete abandoned signups or rejected registrations so parents/users can re-register cleanly.",
    url: "#"
  };

  const columns = getUsersColumns(
    handleToggleStatus,
    handleUpdateUserStatus,
    handleDeleteUserClick,
    handleViewUser,
    handleAssignTeams,
    "INCOMPLETE",
    handleEditProfile
  );

  return (
    <div className='py-10 px-8 space-y-6 pb-16'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className="bg-white rounded-md py-4 flex flex-col space-y-4 shadow-sm border border-gray-100">
        {/* Table Header */}
        <div className="px-6">
          <TableHeader payload={tableHeaderPayload} />
        </div>

        {/* Status Filter Tabs & Controls Toolbar */}
        <div className="px-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2 pb-2 border-y border-gray-100 bg-slate-50/50">
          {/* Status Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Accounts', count: rawList.length },
              { id: 'UNVERIFIED', label: 'Unverified Email', count: unverifiedCount },
              { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
              { id: 'PENDING', label: 'Pending Approval', count: pendingCount },
              { id: 'VERIFIED', label: 'Verified', count: verifiedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-gray-200 hover:border-gray-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id
                      ? 'bg-white/20 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 font-semibold'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Custom Styled Status Filter Popover */}
            {(() => {
              const statusOptions = [
                { value: 'ALL', label: 'All Statuses', count: rawList.length, dotColor: 'bg-slate-400' },
                { value: 'UNVERIFIED', label: 'Unverified Email', count: unverifiedCount, dotColor: 'bg-amber-500' },
                { value: 'REJECTED', label: 'Rejected Status', count: rejectedCount, dotColor: 'bg-rose-500' },
                { value: 'PENDING', label: 'Pending Approval', count: pendingCount, dotColor: 'bg-blue-500' },
                { value: 'VERIFIED', label: 'Verified Email', count: verifiedCount, dotColor: 'bg-emerald-500' },
              ];
              const selectedOpt = statusOptions.find(o => o.value === statusFilter) || statusOptions[0];

              return (
                <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="h-9 px-3.5 bg-white border border-gray-200 hover:border-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center justify-between gap-2.5 shadow-2xs hover:bg-slate-50 transition-all cursor-pointer min-w-[170px]"
                    >
                      <div className="flex items-center gap-2">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div className={`w-2 h-2 rounded-full ${selectedOpt.dotColor}`} />
                        <span className="truncate">{selectedOpt.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 text-slate-400">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                          {selectedOpt.count}
                        </span>
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-1.5 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Filter by Status
                    </div>
                    {statusOptions.map((opt) => {
                      const isSelected = statusFilter === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(opt.value);
                            setStatusPopoverOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 text-xs rounded-lg flex items-center justify-between transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'bg-slate-900 text-white font-bold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : opt.dotColor}`} />
                            <span>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {opt.count}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </div>
                        </button>
                      );
                    })}
                  </PopoverContent>
                </Popover>
              );
            })()}

            {/* Search Bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
              <input
                type="text"
                placeholder="Search by name, email, role or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Reset Filters Button */}
            {(statusFilter !== 'ALL' || searchTerm !== '') && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSearchTerm('');
                }}
                className="px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            )}
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

          {incompleteData?.pagination && (
            <CustomPagination
              TOTAL_PAGES={incompleteData.pagination.totalPage || 1}
              qryName="userPage"
            />
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {selectedUser && (
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
      )}

      {/* Assign Teams Modal */}
      {assignTargetUser && (
        <AssignTeamsModal
          user={assignTargetUser}
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssignTargetUser(null);
          }}
        />
      )}

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

      {/* Edit Profile Modal */}
      {editTargetUser && (
        <UserEditProfileModal
          user={editTargetUser}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditTargetUser(null);
          }}
        />
      )}
    </div>
  );
};

export default IncompleteAccounts;
