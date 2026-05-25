import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";
import { EventRecord } from "@/types/dashboard";
import { baseURL } from '../utils/BaseURL';

export const getEventColumns = (
  onView: (event: EventRecord) => void,
  onDelete: (id: string) => void
): ColumnDef<EventRecord>[] => [
  {
    accessorKey: "title",
    header: () => <div className="">Event Title</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.image ? (
          <Image src={baseURL + row.original.image} alt="event cover" width={100} height={100} className="w-12 h-12 rounded-xl border border-gray-100 object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300">VOID</div>
        )}
        <div className="flex flex-col max-w-[280px]">
          <span className="font-bold text-gray-900 leading-tight line-clamp-1">{row.getValue("title")}</span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{row.original.location}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "eventDate",
    header: () => <div className="">Event Date</div>,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-bold text-gray-900">{dayjs(row.getValue("eventDate")).format("DD MMM, YYYY")}</span>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{dayjs(row.getValue("eventDate")).format("hh:mm A")}</span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border inline-block ${status === 'publish' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
          }`}>
          {status}
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          onClick={() => onView(row.original)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800"
        >
          <FiEye className="size-5 font-bold" />
        </button>
        <Link href={`/event-management/create-event?id=${row.original._id}`}>
          <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800">
            <FiEdit className="size-5 font-bold" />
          </button>
        </Link>
        <button
          onClick={() => onDelete(row.original._id)}
          className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
        >
          <FiTrash2 className="size-5 font-bold" />
        </button>
      </div>
    ),
  }
]
