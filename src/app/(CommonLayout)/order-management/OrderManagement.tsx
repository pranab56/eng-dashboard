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
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Total Orders
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? "—" : totalOrders}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Pending Orders
            </p>
            <p className="text-2xl font-bold text-amber-600">
              {isLoading ? "—" : pendingCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Approved
            </p>
            <p className="text-2xl font-bold text-green-600">
              {isLoading ? "—" : approvedCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
              Rejected
            </p>
            <p className="text-2xl font-bold text-red-600">
              {isLoading ? "—" : rejectedCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-4 flex flex-col min-h-[500px]">
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
