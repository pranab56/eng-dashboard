/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { TUser } from '@/types/columnTypes';
import { usersColumns } from '@/tableColumns/usersColumns';
import CustomPagination from '@/components/cui/CustomPagination';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import GeneralStateCard from '@/components/cui/GeneralStateCard';



const items = [
  {
    title: "State 1",
    value: 30,
    description: "Manage ecosystem permissions",
    id: "home1",
  },
  {
    title: "State 2",
    value: 100,
    // description: "Manage ecosystem permissions",
    id: "home2",
  },
  {
    title: "State 3",
    value: 200,
    description: "Manage ecosystem permissions",
    id: "home3",
  },
  {
    title: "State 4",
    value: 300,
    description: "Manage ecosystem permissions",
    id: "home4",
  },
];




const UserManagement = () => {

  const { setHeaders } = useHeaders();
  useEffect(() => {
    setHeaders({
      title: "Users",
      des: "Manage ecosystem permissions and member access levels."
    })
  }, [])

  const allUsers: TUser[] = [
    {
      id: "1",
      profilePic: process.env.NEXT_PUBLIC_PROFILE_PIC!,
      name: "John Doe",
      email: "iDk5U@example.com",
      role: "Player",
      status: "Active",
    },
    {
      id: "2",
      profilePic: process.env.NEXT_PUBLIC_PROFILE_PIC!,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "Manager",
      status: "Block",
    },
    {
      id: "3",
      profilePic: process.env.NEXT_PUBLIC_PROFILE_PIC!,
      name: "Bob Johnson",
      email: "bob.johnson@example.com",
      role: "Admin",
      status: "Suspended",
    }
  ]

  const tableHeaderPayload = {
    title: "Users",
    des: "",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className=" bg-white rounded-md py-4 min-h-[600px] flex flex-col">
        <div className='flex-1'>
          <TableHeader payload={tableHeaderPayload} />
          <div className="pt-4">
            <CustomTable<TUser> columns={usersColumns} data={allUsers} />
          </div>
        </div>
        <div className='pt-8 px-4'>
          <CustomPagination TOTAL_PAGES={15} qryName="userPage" />
        </div>
      </div>
    </div>
  )
}

export default UserManagement