import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { TGallery } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";

export const getGalleryColumns = (
  onEdit: (item: TGallery) => void,
  onDelete: (id: string) => void
): ColumnDef<TGallery>[] => [
    {
      accessorKey: "image",
      header: () => <div>Image Preview</div>,
      cell: ({ row }) => {
        const imgUrl = formatImagePath(row.original.image);
        return (
          <div className="flex items-center gap-3">
            {imgUrl ? (
              <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                <Image
                  src={imgUrl}
                  alt="gallery"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-medium text-xs border border-gray-200">
                No Img
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: () => <div>Category</div>,
      cell: ({ row }) => {
        const cat = row.original.category as any;
        const sub = row.original.subCategory as any;
        const catName = typeof cat === "object" && cat ? cat.name : typeof cat === "string" ? cat : "";
        const subName = typeof sub === "object" && sub ? sub.name : typeof sub === "string" ? sub : "";

        return (
          <div className="font-semibold text-gray-800 capitalize flex items-center gap-1.5 flex-wrap">
            <span>{catName || "General"}</span>
            {subName && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium">
                › {subName}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div>Status</div>,
      cell: ({ row }) => {
        const status = (row.original.status || "active").toLowerCase();
        const isActive = status === "active";
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold . tracking-wider border ${isActive
              ? "bg-green-50 text-green-600 border-green-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: () => <div>Created At</div>,
      cell: ({ row }) => {
        const dateVal = row.original.createdAt || row.original.updatedAt;
        return (
          <div className="text-sm text-gray-600 font-medium">
            {dateVal ? dayjs(dateVal).format("MMM DD, YYYY · hh:mm A") : "N/A"}
          </div>
        );
      },
    },
    {
      id: "action",
      header: () => <div>Action</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-gray-200 transition-colors duration-300 cursor-pointer text-gray-800"
              title="Edit Gallery Item"
            >
              <FiEdit className="size-5 font-medium" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item._id)}
              className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3] hover:bg-red-50 hover:text-red-600 transition-colors duration-300 cursor-pointer"
              title="Delete Gallery Item"
            >
              <FiTrash2 className="size-5 font-medium" />
            </button>
          </div>
        );
      },
    },
  ];
