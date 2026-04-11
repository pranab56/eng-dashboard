import React from 'react'

export type TableTitleProps = {
  title: string;
  des?: string;
}

const TableTitle = ({ payload }: { payload: TableTitleProps }) => {

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800">{payload.title}</h2>
      {payload.des && <p className="text-sm text-gray-500">{payload.des}</p>}
    </div>
  )
}

export default TableTitle