import React from 'react'

export type TableTitleProps = {
  title: string;
  des?: string;
}

const TableTitle = ({ payload }: { payload: TableTitleProps }) => {
  return (
    <div className="py-1">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{payload.title}</h2>
      {payload.des && <p className="text-xs text-slate-500 font-normal mt-0.5">{payload.des}</p>}
    </div>
  );
};

export default TableTitle