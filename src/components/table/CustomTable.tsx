"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Loader } from "lucide-react"

interface CustomTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
}

function CustomTable<TData>({ data, columns, isLoading }: CustomTableProps<TData>) {

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: data?.length,
      },
    },
  })

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200/60 shadow-2xs">
      <Table className="min-w-full divide-y divide-slate-200/60">
        <TableHeader className="bg-slate-50/90">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-200/80">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="bg-slate-50/90 text-slate-600 font-semibold text-xs uppercase tracking-wider h-11 px-4 text-left"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="divide-y divide-slate-100 bg-white">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="animate-pulse bg-white">
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-3.5 px-4">
                    <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="bg-white hover:bg-slate-50/80 text-slate-800 transition-colors duration-150"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3 px-4 text-sm align-middle">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-3 py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200/60 shadow-xs">
                    <span className="text-xl" aria-hidden="true">📊</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">No records found</p>
                    <p className="text-xs text-slate-500">There are no items to display right now.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default CustomTable
