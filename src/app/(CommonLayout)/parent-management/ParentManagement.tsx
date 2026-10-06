/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, RotateCcw, RefreshCw, Users, Shield, CreditCard } from "lucide-react";
import CustomPagination from "@/components/cui/CustomPagination";
import CustomTable from "@/components/table/CustomTable";
import { useHeaders } from "@/hooks/useHeaders";
import { getParentColumns } from "@/tableColumns/parentColumns";
import { TUserManagement } from "@/types/columnTypes";
import { toast } from "sonner";
import {
  useDeleteUserMutation,
  useGetAllParentsQuery,
  useGetParentOverviewQuery,
} from "@/features/userManagement/userApi";
import ParentViewModal from "./ParentViewModal";
import DeleteConfirmationModal from "../user-management/DeleteConfirmationModal";

const ParentManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const pageNumber = searchParams.get("userPage") || "1";

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedParent, setSelectedParent] = useState<TUserManagement | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [deleteTargetParent, setDeleteTargetParent] = useState<TUserManagement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Paginated parent list
  const {
    data: userData,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllParentsQuery({
    pageNumber: Number(pageNumber),
    searchValue: searchTerm.trim(),
  });

  // Dedicated backend overview query (100% pagination-independent MongoDB count)
  const {
    data: overviewRes,
    isFetching: isFetchingOverview,
    refetch: refetchOverview,
  } = useGetParentOverviewQuery(undefined);

  const overview = overviewRes?.data;

  const [deleteUser, { isLoading: isDeletingUser }] = useDeleteUserMutation();

  useEffect(() => {
    setHeaders({
      title: "Parent & Family Management",
      des: "Review parent account owners, their linked child players, and active subscriptions.",
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
      refetch();
      refetchOverview();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete parent account");
    }
  };

  const rawParents = useMemo(() => userData?.data || [], [userData?.data]);
  const pagination = userData?.pagination || { totalPage: 1, total: rawParents.length };

  // Overview metric cards powered directly by backend DB aggregation
  const totalParentsCount = overview?.totalParents ?? (pagination.total || rawParents.length);
  const totalLinkedChildren = overview?.totalLinkedChildren ?? 0;
  const totalSubscribedChildren = overview?.subscribedChildren ?? 0;

  // Filter list by search locally if needed for instant responsiveness
  const displayParents = useMemo(() => {
    if (!searchTerm.trim()) return rawParents;
    const q = searchTerm.toLowerCase().trim();
    return rawParents.filter((parent: any) => {
      const fullName = `${parent.firstName || ""} ${parent.lastName || ""}`.toLowerCase();
      const userName = (parent.userName || "").toLowerCase();
      const email = (parent.email || "").toLowerCase();
      const phone = (parent.phone || "").toLowerCase();
      const childrenNames = (parent.myPlayers || parent.children || [])
        .map((c: any) => `${c.firstName || ""} ${c.lastName || ""} ${c.userName || ""}`.toLowerCase())
        .join(" ");

      return (
        fullName.includes(q) ||
        userName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        childrenNames.includes(q)
      );
    });
  }, [rawParents, searchTerm]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Parent & Family Management
            </h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {totalParentsCount.toLocaleString()} parents
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review registered family owners, linked child rosters, and subscription entitlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              refetch();
              refetchOverview();
            }}
            disabled={isFetching || isFetchingOverview}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh parent list"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isFetching || isFetchingOverview ? "animate-spin text-slate-500" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Metric Strips (Powered 100% by Backend DB Overview API) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Total Parent Accounts
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalParentsCount.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Linked Child Players
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalLinkedChildren.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <Shield className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
              Subscribed Child Players
            </span>
            <span className="text-xl font-bold text-slate-900 tabular-nums">
              {totalSubscribedChildren.toLocaleString()}
            </span>
          </div>
          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600">
            <CreditCard className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col">
        {/* Search Toolbar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by parent name, email, phone, or child name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8.5 pl-8.5 pr-8 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="inline-flex items-center gap-1.5 h-8.5 px-2.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors cursor-pointer"
                title="Reset search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 w-full overflow-x-auto">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-white">
            <span className="font-semibold text-slate-700">Parent Directory</span>
            <span className="tabular-nums">
              Showing {displayParents.length} of {pagination.total || 0} registered parents
            </span>
          </div>

          <CustomTable<TUserManagement>
            columns={getParentColumns(handleViewParent, handleDeleteParentClick)}
            data={displayParents}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/50">
          <CustomPagination
            TOTAL_PAGES={
              searchTerm.trim() !== "" && displayParents.length < 10 && Number(pageNumber) === 1
                ? 1
                : Math.max(1, pagination.totalPage || 1)
            }
            qryName="userPage"
          />
        </div>
      </div>

      {/* View Details Modal */}
      <ParentViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedParent(null);
        }}
        parent={selectedParent}
      />

      {/* Delete Confirmation Modal */}
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
