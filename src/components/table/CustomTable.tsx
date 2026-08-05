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
  isSortable?: boolean;
  onDragEnd?: (startIndex: number, endIndex: number) => void;
}

function CustomTable<TData>({
  data,
  columns,
  isLoading,
  isSortable = false,
  onDragEnd,
}: CustomTableProps<TData>) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null);

  const tableColumns = React.useMemo(() => {
    if (!isSortable) return columns;

    const dragColumn: ColumnDef<TData> = {
      id: "drag-handle",
      header: () => <div className="w-8"></div>,
      cell: () => (
        <div className="flex justify-center items-center cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      ),
    };
    return [dragColumn, ...columns];
  }, [columns, isSortable]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination: {
        pageIndex: 0,
        pageSize: data?.length,
      },
    },
  });

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== index && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onDragEnd?.(draggedIndex, index);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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
            table.getRowModel().rows.map((row, index) => {
              let rowClassName = "bg-white hover:bg-slate-50/80 text-slate-800 transition-colors duration-150";
              if (index === draggedIndex) {
                rowClassName += " opacity-40 bg-slate-100";
              } else if (index === dragOverIndex) {
                rowClassName += " bg-indigo-50 border-t-2 border-indigo-400";
              }

              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={rowClassName}
                  draggable={isSortable}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragLeave={() => {
                    if (dragOverIndex === index) {
                      setDragOverIndex(null);
                    }
                  }}
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
              );
            })
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
