import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi";
import { TNews } from "@/types/columnTypes";
import Image from "next/image";

const statusStyle = (status: string): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-500";
    case "Published":
      return "bg-blue-100 text-blue-500";
    default:
      return "bg-gray-500";
  }
};

export const newsColumns: ColumnDef<TNews>[] = [
  {
    accessorKey: "title",
    header: () => <div className="">Title</div>,
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Image src={row.original.image} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-md border-2 border-white" />
        <p className="flex flex-col flex-start items-start ">
          <span className="font-semibold">{row.getValue("title")}</span>
        </p>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="">Category</div>,
    cell: ({ row }) => (
      <div className={`px-4 py-1 rounded-full bg-gray-100 inline-block `}>{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "author",
    header: () => <div className="">Author</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md`}>{row.getValue("author")}</div>
    ),
  },
  {
    accessorKey: "publishDate",
    header: () => <div className="">Publish Date</div>,
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-md`}>{row.getValue("publishDate")}</div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: () => (
      <div className="flex items-center gap-2">
        <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3]  transition-colors duration-300 cursor-pointer">
          <FiEye className="size-5 font-bold text-gray-800 transition-colors duration-300" />
        </button>
        <button className="flex items-center justify-center h-9 w-9 rounded-sm bg-red-100  transition-colors duration-300 cursor-pointer">
          <HiOutlineTrash className="size-5 font-bold text-red-800 transition-colors duration-300" />
        </button>
      </div>
    ),
  }
]