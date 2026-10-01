import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import Image from "next/image";
import { Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { TGallery } from "@/types/columnTypes";
import { formatImagePath } from "@/utils/formatImagePath";

export const getGalleryColumns = (
  onEdit: (item: TGallery) => void,
  onDelete: (id: string) => void
): ColumnDef<TGallery>[] => [
  {
    accessorKey: "image",
    header: () => <span className="font-semibold text-xs text-slate-700">Preview</span>,
    cell: ({ row }) => {
      const imgUrl = formatImagePath(row.original.image);
      return (
        <div className="flex items-center gap-3">
          {imgUrl ? (
            <div className="relative w-14 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0 shadow-2xs">
              <Image
                src={imgUrl}
                alt="gallery preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-14 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-medium text-xs border border-slate-200 shrink-0">
              <ImageIcon className="w-4 h-4 text-slate-300" />
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => <span className="font-semibold text-xs text-slate-700">Category / Album</span>,
    cell: ({ row }) => {
      const cat = row.original.category as any;
      const sub = row.original.subCategory as any;
      const catName = typeof cat === "object" && cat ? cat.name : typeof cat === "string" ? cat : "";
      const subName = typeof sub === "object" && sub ? sub.name : typeof sub === "string" ? sub : "";

      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            {catName || "General Gallery"}
          </span>
          {subName && (
            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {subName}
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <span className="font-semibold text-xs text-slate-700">Status</span>,
    cell: ({ row }) => {
      const status = (row.original.status || "active").toLowerCase();
      const isActive = status === "active";
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-emerald-500" : "bg-slate-400"
            }`}
          />
          <span className="capitalize">{status}</span>
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => <span className="font-semibold text-xs text-slate-700">Date Added</span>,
    cell: ({ row }) => {
      const dateVal = row.original.createdAt || row.original.updatedAt;
      return (
        <div className="text-xs text-slate-600 font-mono">
          {dateVal ? dayjs(dateVal).format("MMM DD, YYYY · hh:mm A") : "—"}
        </div>
      );
    },
  },
  {
    id: "action",
    header: () => <div className="text-right pr-2 font-semibold text-xs text-slate-700">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <div className="flex items-center justify-end gap-1.5 pr-2">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            title="Edit Gallery Item"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors cursor-pointer"
            title="Delete Gallery Item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      );
    },
  },
];
