/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import TableHeader from "@/components/cui/TableHeader";
import CustomTable from "@/components/table/CustomTable";
import {
  useAcceptOrderMutation,
  useGetAllOrderQuery,
  useRejectOrderMutation,
} from "@/features/orderManagement/orderApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getOrderColumns } from "@/tableColumns/orderColumns";
import { TOrder } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { ShoppingBag, Search, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const OrderManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: orderData, isLoading } = useGetAllOrderQuery({
    pageNumber: page,
    searchValue: searchTerm,
  });

  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [rejectOrder, { isLoading: isRejecting }] = useRejectOrderMutation();

  const orders: TOrder[] = orderData?.data || [];
  const pagination = orderData?.pagination || { total: 0, totalPage: 1 };

  useEffect(() => {
    setHeaders({
      title: "Order Management",
      des: "Review and process reward redemption orders.",
    });
  }, [setHeaders]);

  const handleAcceptOrder = async (id: string) => {
    try {
      const res = await acceptOrder(id).unwrap();
      if (res.success !== false) {
        toast.success(res.message || "Order approved successfully!");
      } else {
        toast.error(res.message || "Failed to approve order");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to approve order"));
    }
  };

  const handleRejectOrder = async (id: string) => {
    try {
      const res = await rejectOrder(id).unwrap();
      if (res.success !== false) {
        toast.success(res.message || "Order rejected successfully!");
      } else {
        toast.error(res.message || "Failed to reject order");
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to reject order"));
    }
  };

  // Compute stat counts
  const totalOrders = pagination.total || orders.length;
  const pendingCount = orders.filter(
    (o) => (o.status || "").toLowerCase() === "pending"
  ).length;
  const approvedCount = orders.filter(
    (o) =>
      (o.status || "").toLowerCase() === "approved" ||
      (o.status || "").toLowerCase() === "accept"
  ).length;
  const rejectedCount = orders.filter(
    (o) =>
      (o.status || "").toLowerCase() === "rejected" ||
      (o.status || "").toLowerCase() === "reject"
  ).length;

  const tableHeaderPayload = {
    title: "Reward Orders List",
    des: "All user reward redemption requests.",
    url: "",
  };

  const columns = getOrderColumns(
    handleAcceptOrder,
    handleRejectOrder,
    isAccepting,
    isRejecting
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* 1. Executive Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {isLoading ? "—" : totalOrders}
            </span>
            <span className="text-xs text-slate-400">orders</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700 tabular-nums">
              {isLoading ? "—" : pendingCount}
            </span>
            <span className="text-xs text-slate-400">awaiting</span>
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums">
              {isLoading ? "—" : approvedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white border border-slate-200/80 rounded-lg p-3.5 sm:p-4 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-700 tabular-nums">
              {isLoading ? "—" : rejectedCount}
            </span>
            <span className="text-xs text-slate-400">declined</span>
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col">
        <div className="flex-1">
          {/* Header Bar with Title & Search Input */}
          <div className="px-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <TableHeader payload={tableHeaderPayload} />

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<TOrder>
              columns={columns}
              data={orders}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Pagination */}
        {pagination.totalPage > 1 && (
          <div className="pt-4 border-t border-gray-100">
            <CustomPagination TOTAL_PAGES={pagination.totalPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
