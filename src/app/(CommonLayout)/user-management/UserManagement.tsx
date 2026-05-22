/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import CustomPagination from '@/components/cui/CustomPagination';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import TableHeader from '@/components/cui/TableHeader';
import CustomTable from '@/components/table/CustomTable';
import { useDeleteUserMutation, useGetUserQuery, useUpdateStatusMutation } from '@/features/userManagement/userApi';
import { useHeaders } from '@/hooks/useHeaders';
import { getUsersColumns } from '@/tableColumns/usersColumns';
import { TUserManagement } from '@/types/columnTypes';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import toast from 'react-hot-toast';


const UserManagement = () => {
  const { setHeaders } = useHeaders();
  const searchParams = useSearchParams();
  const page = searchParams.get('userPage') || '1';

  const { data: userData, isLoading } = useGetUserQuery(page);
  const [toggleStatus] = useUpdateStatusMutation();
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
      toast.success("User status updated");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update status");
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

  const columns = getUsersColumns(handleToggleStatus, handleDeleteUser);

  return (
    <div className='pt-10 px-8 space-y-4'>
      <GeneralStateCard items={items} className='grid-cols-4' />

      <div className=" bg-white rounded-md py-4 min-h-[600px] flex flex-col">
        <div className='flex-1'>
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4 px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">Loading users...</div>
            ) : (
              <CustomTable<TUserManagement> columns={columns} data={userData?.data || []} />
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
