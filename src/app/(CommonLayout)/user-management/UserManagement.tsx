/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Users,
  Clock,
  CheckCircle2,
  Shield,
  Search,
  X,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import {
  useDeleteUserMutation,
  useGetUserAnalyticsQuery,
  useGetUserQuery,
  useUpdateStatusMutation,
  useUpdateUserStatusMutation,
} from "@/features/userManagement/userApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getUsersColumns } from "@/tableColumns/usersColumns";
import { TUserManagement } from "@/types/columnTypes";

import UserVerificationModal from "./UserVerificationModal";
import AssignTeamsModal from "./AssignTeamsModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import UserEditProfileModal from "./UserEditProfileModal";

const ROLE_TABS = [
  { label: "All Members", value: "ALL" },
  { label: "Pending Approvals", value: "PENDING_REQUESTS" },
  { label: "Players", value: "PLAYER" },
  { label: "Trial Players", value: "OTHER_CLUBS" },
  { label: "Tournament Players", value: "TOURNAMENT_PLAYER" },
  { label: "Managers", value: "MANAGER" },
  { label: "Referees", value: "REFEREE" },
];

const UserManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeRole, setActiveRole] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [emailStatusFilter, setEmailStatusFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Keep local page state in sync with URL page parameter
  useEffect(() => {
    const p = searchParams.get("userPage") || "1";
    setCurrentPage(parseInt(p, 10));
  }, [searchParams]);

  const resetPageInUrl = () => {
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams.toString());
    params.set("userPage", "1");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    resetPageInUrl();
  };

  const handleRoleChange = (role: string) => {
    setActiveRole(role);
    resetPageInUrl();
  };

  // Modals State
  const [selectedUser, setSelectedUser] = useState<TUserManagement | null>(
    null,
  );
  const [isVerificationModalOpen, setIsVerificationModalOpen] =
    useState<boolean>(false);

  const [assignTargetUser, setAssignTargetUser] =
    useState<TUserManagement | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);

  const [deleteTargetUser, setDeleteTargetUser] =
    useState<TUserManagement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isDeletingUser, setIsDeletingUser] = useState<boolean>(false);

  const [editTargetUser, setEditTargetUser] = useState<TUserManagement | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Queries
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    isFetching: isAnalyticsFetching,
    refetch: refetchAnalytics,
  } = useGetUserAnalyticsQuery({});

  const {
    data: userData,
    isLoading,
    isFetching,
    refetch: refetchUsers,
  } = useGetUserQuery({
    pageNumber: currentPage.toString(),
    searchValue: searchTerm,
    role: activeRole,
  });

  const isRefreshing = isFetching || isAnalyticsFetching;

  const handleRefresh = () => {
    refetchAnalytics();
    refetchUsers();
    toast.success("User directory refreshed");
  };

  // Keep selected user details in sync when list refetches
  useEffect(() => {
    if (selectedUser) {
      const list = Array.isArray(userData?.data)
        ? userData.data
        : userData?.data?.result || [];
      const updated = list.find(
        (u: any) =>
          (u._id || u.id) ===
          ((selectedUser as any)._id || (selectedUser as any).id),
      );
      if (updated) {
        setSelectedUser(updated);
      }
    }
  }, [userData, selectedUser]);

  const [toggleStatus] = useUpdateStatusMutation();
  const [updateUserStatus, { isLoading: isUpdatingUserStatus }] =
    useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "User Management & Player Approval",
      des: "Review pending player registrations, role permissions, and member verification.",
    });
  }, [setHeaders]);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus({ id }).unwrap();
      toast.success("User verification status updated");
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to update verification status",
      );
    }
  };

  const handleUpdateUserStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) => {
    try {
      await updateUserStatus({
        id,
        data: { status, rejectionReason },
      }).unwrap();
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

  const handleRejectVerification = async (
    id: string,
    rejectionReason?: string,
  ) => {
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
      toast.success(
        "Account deleted successfully! Email is now free to register again.",
      );
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

  // Filter users based on role, subscription, search, and secondary filters
  const filteredUsers = (userData?.data || []).filter((user: any) => {
    const userRole = (user.role || "").toUpperCase();
    const userStatus = (user.status || "").toUpperCase();
    const isChildPlayer =
      !!user.parentId ||
      user.password === null ||
      !user.email ||
      (userRole === "PLAYER" &&
        (!!user.position ||
          !!user.dateOfBirth ||
          !!user.ageGroup ||
          !!user.selectTeam));
    const isParent =
      !isChildPlayer &&
      !user.parentId &&
      !!user.email &&
      ![
        "MANAGER",
        "REFEREE",
        "CLUB",
        "CLUBS",
        "OTHER_CLUBS",
        "ADMIN",
        "SUPER_ADMIN",
      ].includes(userRole) &&
      !user.position &&
      !user.dateOfBirth;

    // Always exclude Parent accounts from User Management tables
    if (isParent) return false;

    // Require active subscription / paid access for player profiles (PLAYER, OTHER_CLUBS, TOURNAMENT_PLAYER)
    // EXCEPT when reviewing PENDING requests or PENDING status
    const isPlayerRole =
      ["PLAYER", "OTHER_CLUBS", "CLUB", "CLUBS", "TOURNAMENT_PLAYER"].includes(
        userRole,
      ) || isChildPlayer;
    const isPaid = Boolean(
      user.subscription || user.activeSubscription || user.isPaid,
    );

    if (activeRole === "PENDING_REQUESTS") {
      if (userStatus !== "PENDING") return false;
    } else {
      if (isPlayerRole && !isPaid && userStatus !== "PENDING") return false;
      if (activeRole === "PLAYER") {
        if (!isChildPlayer && userRole !== "PLAYER") return false;
      } else if (activeRole === "OTHER_CLUBS") {
        if (
          userRole !== "OTHER_CLUBS" &&
          userRole !== "CLUB" &&
          userRole !== "CLUBS"
        )
          return false;
      } else if (activeRole === "TOURNAMENT_PLAYER") {
        if (userRole !== "TOURNAMENT_PLAYER") return false;
      } else if (activeRole !== "ALL") {
        if (userRole !== activeRole && !userRole.includes(activeRole))
          return false;
      }
    }

    // Secondary Filter: Status
    if (statusFilter !== "ALL") {
      if (userStatus !== statusFilter) return false;
    }

    // Secondary Filter: Email Verification
    if (emailStatusFilter !== "ALL") {
      const isVerified = Boolean(user.verified);
      if (emailStatusFilter === "VERIFIED" && !isVerified) return false;
      if (emailStatusFilter === "UNVERIFIED" && isVerified) return false;
    }

    // Search Term matching
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const fullName = (
        user.userName ||
        user.name ||
        `${user.firstName || ""} ${user.lastName || ""}`
      ).toLowerCase();
      const emailMatch = (user.email || "").toLowerCase().includes(q);
      const roleMatch = (user.role || "").toLowerCase().includes(q);
      const phoneMatch = (user.phone || user.phoneNumber || "")
        .toLowerCase()
        .includes(q);

      return fullName.includes(q) || emailMatch || roleMatch || phoneMatch;
    }

    return true;
  });

  const analytics = analyticsData?.data || {};
  const pendingCount =
    analytics.pendingRequests ??
    (userData?.data || []).filter(
      (u: any) => (u.status || "").toUpperCase() === "PENDING",
    ).length;

  const columns = getUsersColumns(
    handleToggleStatus,
    handleUpdateUserStatus,
    handleDeleteUserClick,
    handleViewUser,
    handleAssignTeams,
    activeRole,
    handleEditProfile,
  );

  const displayTableData = [...filteredUsers].sort((a: any, b: any) => {
    const statusA = (a.status || "").toUpperCase();
    const statusB = (b.status || "").toUpperCase();
    if (statusA === "PENDING" && statusB !== "PENDING") return -1;
    if (statusA !== "PENDING" && statusB === "PENDING") return 1;
    return (
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
    );
  });

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("ALL");
    setEmailStatusFilter("ALL");
    setActiveRole("ALL");
    resetPageInUrl();
    toast.info("Filters reset to default");
  };

  const hasActiveFilters =
    activeRole !== "ALL" ||
    statusFilter !== "ALL" ||
    emailStatusFilter !== "ALL" ||
    Boolean(searchTerm.trim());

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16 max-w-[1600px] mx-auto text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            User Directory & Player Approval
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review pending registrations, manage verified player profiles, and
            control role permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh member lists and analytics"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip (Static Non-Clickable Display) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Members */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Members
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isAnalyticsLoading
                ? "—"
                : (analytics.totalUsers ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">accounts</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Registered players, managers & staff
          </p>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              Pending Approvals
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-700">
              {isAnalyticsLoading ? "—" : pendingCount.toLocaleString()}
            </span>
            <span className="text-xs text-amber-700 font-medium">
              awaiting review
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Youth registrations requiring admin approval
          </p>
        </div>

        {/* Approved Players */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Players
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isAnalyticsLoading
                ? "—"
                : (analytics.approvedPlayers ?? 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">verified youth</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Confirmed league squad members
          </p>
        </div>

        {/* Staff & Officials */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Staff & Officials
            </span>
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isAnalyticsLoading
                ? "—"
                : (
                    (analytics.totalManagers ?? 0) +
                    (analytics.totalReferees ?? 0)
                  ).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">
              {analytics.totalManagers ?? 0} mgrs •{" "}
              {analytics.totalReferees ?? 0} refs
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Team managers and match referees
          </p>
        </div>
      </div>

      {/* Main Directory Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-0">
        {/* Role Segment Tabs */}
        <div className="px-4 sm:px-6 pt-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 -mb-px">
            {ROLE_TABS.map((tab) => {
              const isPendingTab = tab.value === "PENDING_REQUESTS";
              const isSelected = activeRole === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleRoleChange(tab.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 select-none ${
                    isSelected
                      ? "bg-slate-900 text-white shadow-2xs"
                      : isPendingTab && pendingCount > 0
                        ? "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.label}</span>

                  {isPendingTab && pendingCount > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isSelected
                          ? "bg-amber-400 text-slate-950"
                          : "bg-amber-200 text-amber-900"
                      }`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar & Secondary Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          {/* Left: Search input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search member by name, email, phone..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-8 pl-8 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Secondary Filters & Reset */}
          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            {/* Approval Status Filter */}
            {activeRole !== "PENDING_REQUESTS" && (
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  resetPageInUrl();
                }}
                className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
              >
                <option value="ALL">Status: All</option>
                <option value="APPROVED">Approved / Active</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            )}

            {/* Email Verified Filter */}
            <select
              value={emailStatusFilter}
              onChange={(e) => {
                setEmailStatusFilter(e.target.value);
                resetPageInUrl();
              }}
              className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded-md text-slate-700 hover:bg-slate-50 focus:outline-hidden focus:ring-1 focus:ring-slate-900 cursor-pointer"
            >
              <option value="ALL">Email: All</option>
              <option value="VERIFIED">Verified</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                title="Reset all search and role filters"
              >
                <X className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 sm:px-6">
          <div className="text-xs text-slate-500 mb-3 flex items-center justify-between">
            <span>
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {displayTableData.length}
              </span>{" "}
              members (Page {currentPage} of{" "}
              {userData?.pagination?.totalPage ||
                userData?.pagination?.totalPages ||
                1}
              )
            </span>
            {hasActiveFilters && (
              <span className="text-slate-600 text-[11px] font-medium">
                Filtered view active
              </span>
            )}
          </div>

          <CustomTable
            columns={columns}
            data={displayTableData}
            isLoading={isLoading}
          />

          {/* Pagination Section */}
          <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Total records:{" "}
              <span className="font-semibold text-slate-900">
                {userData?.pagination?.totalUser ||
                  userData?.pagination?.total ||
                  displayTableData.length}
              </span>
            </p>

            {userData?.pagination && (
              <CustomPagination
                TOTAL_PAGES={
                  (searchTerm.trim() !== "" || activeRole !== "ALL") &&
                  displayTableData.length < 10 &&
                  currentPage === 1
                    ? 1
                    : Math.max(
                        1,
                        userData.pagination.totalPage ||
                          userData.pagination.totalPages ||
                          1,
                      )
                }
                qryName="userPage"
              />
            )}
          </div>
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
        onAssignTeams={(userToAssign) => {
          setAssignTargetUser(userToAssign);
          setIsAssignModalOpen(true);
        }}
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
