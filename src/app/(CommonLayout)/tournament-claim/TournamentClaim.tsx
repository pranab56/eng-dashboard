"use client";

import CustomPagination from "@/components/cui/CustomPagination";
import GeneralStateCard from "@/components/cui/GeneralStateCard";
import CustomTable from "@/components/table/CustomTable";
import TableTitle from "@/components/titles/TableTitle";
import {
  useGetAllTournamentClaimQuery,
  useUpdateTournamentClaimStatusMutation,
} from "@/features/tournamentClaim/tournamentClaimApi";
import { useHeaders } from "@/hooks/useHeaders";
import { getTournamentClaimColumns } from "@/tableColumns/tournamentClaimColumns";
import { TTournamentClaim } from "@/types/columnTypes";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import TournamentClaimViewModal from "./TournamentClaimViewModal";

export default function TournamentClaim() {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "1";

  // API Hooks
  const { data: claimRes, isLoading } = useGetAllTournamentClaimQuery(page);
  const [updateTournamentClaimStatus, { isLoading: isUpdating }] =
    useUpdateTournamentClaimStatusMutation();

  // Selection & Modal States
  const [selectedClaim, setSelectedClaim] = useState<TTournamentClaim | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Tournament Claim",
      des: "Review, approve, or reject user rank claim submissions.",
    });
  }, [setHeaders]);

  const rawClaims: TTournamentClaim[] = useMemo(
    () => claimRes?.data || [],
    [claimRes]
  );

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return rawClaims.filter((claim) => {
      const userName = claim.user?.userName || "";
      const email = claim.user?.email || "";
      const tournamentTitle = claim.tournament?.title || "";
      const rankName = claim.claimedPositionName || "";

      const matchesSearch =
        !searchTerm.trim() ||
        userName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        tournamentTitle.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        rankName.toLowerCase().includes(searchTerm.toLowerCase().trim());

      const matchesStatus =
        statusFilter === "ALL" ||
        (claim.status || "pending").toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [rawClaims, searchTerm, statusFilter]);

  // Handlers
  const handleView = (claim: TTournamentClaim) => {
    setSelectedClaim(claim);
    setIsViewModalOpen(true);
  };

  const handleStatusUpdate = async (
    id: string,
    status: "approved" | "rejected" | "pending"
  ) => {
    try {
      setUpdatingId(id);
      const res = await updateTournamentClaimStatus({
        id: id,
        body: { status: status },
      }).unwrap();

      if (res?.success !== false) {
        toast.success(
          res?.message || `Tournament claim ${status} successfully`
        );
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, `Failed to update claim status to ${status}`));
    } finally {
      setUpdatingId(null);
    }
  };

  const totalClaims = claimRes?.pagination?.total || rawClaims.length;

  const cardItems = [
    {
      title: "Total Claims",
      value: totalClaims,
      id: "tc1",
      description: "User tournament rank claim submissions",
    },
  ];

  return (
    <div className="py-10 px-8 space-y-6 pb-16">
      {/* State Banner Card */}
      <div className="flex items-end">
        <div className="w-full">
          <GeneralStateCard items={cardItems} className="grid-cols-4" />
        </div>
      </div>

      {/* Table Registry Container */}
      <div className="bg-white rounded-2xl py-4 flex flex-col border border-gray-100 shadow-sm space-y-4">
        {/* Table Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 pt-2">
          <TableTitle payload={{ title: "Tournament Registry" }} />

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, rank or tournament..."
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all"
              />
            </div>

            {/* Status Filter Combobox */}
            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="h-12 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-between gap-2 hover:bg-gray-100 transition-all cursor-pointer min-w-[125px]"
                >
                  <span className="capitalize">
                    {statusFilter === "ALL" ? "All Status" : statusFilter}
                  </span>
                  <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-36 p-1 bg-white border border-gray-200 shadow-xl rounded-xl z-50">
                {[
                  { label: "All Status", value: "ALL" },
                  { label: "Pending", value: "pending" },
                  { label: "Approved", value: "approved" },
                  { label: "Rejected", value: "rejected" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setStatusPopoverOpen(false);
                    }}
                    className={`w-full px-3 py-3 text-xs rounded-lg flex items-center justify-between transition-colors cursor-pointer text-left ${statusFilter === opt.value
                        ? "bg-black text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Custom Table Component */}
        <div className="pt-2">
          <CustomTable<TTournamentClaim>
            columns={getTournamentClaimColumns(
              handleView,
              handleStatusUpdate,
              updatingId
            )}
            data={filteredClaims}
            isLoading={isLoading}
          />
        </div>

        {/* Pagination Footer */}
        <div className="pt-6 px-4">
          <CustomPagination
            TOTAL_PAGES={claimRes?.pagination?.totalPage || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* View Details & Action Modal */}
      <TournamentClaimViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        claim={selectedClaim}
        onStatusUpdate={handleStatusUpdate}
        isLoading={isUpdating}
      />
    </div>
  );
}
