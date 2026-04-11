import { ColumnDef } from "@tanstack/react-table"
import { FiEye } from "react-icons/fi";
import { AiOutlineStop } from "react-icons/ai";
import { TUser } from "@/types/columnTypes";
import { toast } from "sonner";
import Image from "next/image";
import { CustomModal } from "@/components/modals/CustomModal";
import UserDetails from "@/app/(CommonLayout)/user-management/UserDetails";

const handleDelete = (id: string) => {
  console.log("delete", id);
  toast.success("User deleted successfully");
};

export const usersColumns: ColumnDef<TUser>[] = [
  {
    accessorKey: "name",
    header: () => <div className="">Name</div>,
    cell: ({ row }) => (
      <div>
        <div className="flex gap-2">
          <Image src={process.env.NEXT_PUBLIC_PROFILE_IMAGE_URL!} alt="profilePic" width={400} height={400} className="w-10 h-10 rounded-sm mb-1" />
          <p className="flex flex-col flex-start items-start ">
            <span className="font-semibold">{row.getValue("name")}</span>
            <span className="text-[12px] text-gray-400">{row.original.email}</span>
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: () => <div className="">Role</div>,
    cell: ({ row }) => (
      <div className="">{row.getValue("role")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="">Status</div>,
    cell: ({ row }) => (
      <div className="">{row.getValue("status")}</div>
    ),
  },
  {
    id: "action",
    header: () => <div className="">Action</div>,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <CustomModal
          title="Write a New Review"
          className="sm:max-w-[720px]"
          trigger={<button className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#F3F3F3]  transition-colors duration-300 cursor-pointer">
          <FiEye  className="text-2xl font-bold text-gray-800 transition-colors duration-300" />
        </button>}
        >
          <UserDetails />
        </CustomModal>
        <button onClick={() => handleDelete(row.getValue("id"))} className="flex items-center justify-center h-9 w-9 rounded-sm bg-[#FDEEEE] transition-colors duration-300 cursor-pointer">
          <AiOutlineStop  className="text-2xl font-bold text-red-600 transition-colors duration-300" />
        </button>
      </div>
    ),
  }
]