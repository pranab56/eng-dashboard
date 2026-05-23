/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useAproveTransferMutation, useGetAllTransferQuery, useRejectTransferMutation } from '@/features/transfer/transferApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getTransferColumns } from '@/tableColumns/transferColumns';
import { TTransfer } from '@/types/columnTypes';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import TransferConfirmModal from './TransferConfirmModal';

const TransferManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const { data: transferData, isLoading } = useGetAllTransferQuery(page);
  const [approveTransfer, { isLoading: isApproving }] = useAproveTransferMutation();
  const [rejectTransfer, { isLoading: isRejecting }] = useRejectTransferMutation();

  const [selectedTransfer, setSelectedTransfer] = useState<TTransfer | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  useEffect(() => {
    setHeaders({
      title: "Transfer Management",
      des: "Manage live broadcasts, schedules, and historical match data."
    })
  }, []);

  const handleApproveClick = (transfer: TTransfer) => {
    setSelectedTransfer(transfer);
    setIsApproveModalOpen(true);
  };

  const handleRejectClick = (transfer: TTransfer) => {
    setSelectedTransfer(transfer);
    setIsRejectModalOpen(true);
  };

  const onApproveConfirm = async () => {
    if (!selectedTransfer) return;
    try {
      await approveTransfer({ id: selectedTransfer.id }).unwrap();
      toast.success("Transfer approved successfully");
      setIsApproveModalOpen(false);
    } catch (error) {
      toast.error("Failed to approve transfer");
    }
  };

  const onRejectConfirm = async () => {
    if (!selectedTransfer) return;
    try {
      await rejectTransfer({ id: selectedTransfer.id }).unwrap();
      toast.success("Transfer rejected successfully");
      setIsRejectModalOpen(false);
    } catch (error) {
      toast.error("Failed to reject transfer");
    }
  };

  const columns = getTransferColumns({
    onApprove: handleApproveClick,
    onReject: handleRejectClick
  });

  const items = [
    {
      title: "Total Transfers",
      value: transferData?.data?.meta?.total || 0,
      id: "table1",
      description: "Total player transfer requests"
    },
    {
      title: "Pending Requests",
      value: transferData?.data?.result?.filter((t: TTransfer) => t.status === 'PENDING').length || 0,
      id: "table2",
      description: "Requests awaiting approval"
    }
  ];

  return (
    <div className='pt-10 px-8 space-y-4'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className="bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1 text-left'>
          <TableHeader payload={{ title: "Transfer Request List", url: "" }} />
          <div className="pt-4 px-4 overflow-hidden">
            <CustomTable<TTransfer>
              columns={columns}
              data={transferData?.data?.result || []}
              isLoading={isLoading}
            />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination
            TOTAL_PAGES={transferData?.data?.meta?.totalPages || 1}
            qryName="page"
          />
        </div>
      </div>

      {/* Approve Modal */}
      <TransferConfirmModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        onConfirm={onApproveConfirm}
        title="Approve Transfer"
        description={`Are you sure you want to approve the transfer for ${selectedTransfer?.playerFirstName}?`}
        isLoading={isApproving}
        type="approve"
      />

      {/* Reject Modal */}
      <TransferConfirmModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={onRejectConfirm}
        title="Reject Transfer"
        description={`Are you sure you want to reject the transfer for ${selectedTransfer?.playerFirstName}?`}
        isLoading={isRejecting}
        type="reject"
      />
    </div>
  )
}

export default TransferManagement
