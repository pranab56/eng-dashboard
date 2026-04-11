import React from 'react'
import TableTitle from '../titles/TableTitle';
import ExportButton from '../buttons/ExportButton';

export type TableHeaderProps = {
  title: string;
  des?: string;
  url: string;
}

const TableHeader = ({ payload }: { payload: TableHeaderProps }) => {
  
  return (
    <div className="flex items-center justify-between px-6 py-1">
      <TableTitle payload={{ title: payload.title, des: payload.des }} />
      <ExportButton url={payload.url || ""} />
    </div>
  )
}

export default TableHeader