/* eslint-disable react-hooks/exhaustive-deps */
"use client"


import CustomTable from '@/components/table/CustomTable'
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import TableHeader from '@/components/cui/TableHeader';
import GeneralStateCard from '@/components/cui/GeneralStateCard';
import { tableColumns } from '@/tableColumns/tableColumns';
import { useGetAllTableQuery } from '@/features/tableManagement/tableApi';



const items = [
  {
    title: "Total Teams",
    value: 20,
    id: "table1",
  },
  {
    title: "Leagues Active",
    value: 1,
    id: "table2",
  }
];


const TableManagement = () => {

  const { setHeaders } = useHeaders();
  const { data: tableData, isLoading } = useGetAllTableQuery({});

  useEffect(() => {
    setHeaders({
      title: "Table Management",
      des: "View and manage the league standings and team performance metrics."
    })
  }, [])

  const tableHeaderPayload = {
    title: "Point Table Standings",
    url: "https://example.com/export-users"
  }


  return (
    <div className='pt-10 px-8 space-y-4'>
      <>
        <GeneralStateCard items={items} className='grid-cols-4' />
      </>
      <div className=" bg-white rounded-md py-4 flex flex-col min-h-[600px]">
        <div className='flex-1'>
          <>
            <TableHeader payload={tableHeaderPayload} />
          </>
          <div className="pt-4">
            <CustomTable<any> columns={tableColumns} data={tableData?.data || []} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TableManagement;