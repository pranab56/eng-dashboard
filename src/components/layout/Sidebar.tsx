"use client"


import { deleteCookie } from 'cookies-next/client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { sidebarData, TMenuItem } from '@/constants/sidebarData'
import { logo } from '@/assets/assets'
import { MdLogout } from "react-icons/md";

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };


  const handleLogout = () => {
    toast.loading("Logging out...", {
      id: "logout",
    });

    deleteCookie('accessToken');
    toast.success('Logged out successfully', { id: 'logout' });
    router.push('/login');
  }

  return (
    <div className=''>
      <div className='w-full flex items-center justify-center py-4 cursor-pointer border-b border-gray-700'>
        {logo && <Image src={logo} width={1000} height={300} alt="ENG Logo" className='w-[140px] h-auto' />}
      </div>
      <div className='flex flex-col gap-1 py-1 px-2'>
        {sidebarData?.map((item: TMenuItem) => {
          const isItemActive = isActive(item?.label);
          const Icon = item.icon;

          return (
            <Link
              href={item?.label}
              key={item.id}
              className={`flex gap-2 items-center py-3 px-4 rounded-md transition-colors duration-300 cursor-pointer ${isItemActive
                ? "text-white bg-[#373737] border-l-4 border-[#EABB00]"
                : "text-white border-l-4 border-transparent"
                }`}
            >
              <Icon
                className={`w-6 h-6 ${isItemActive ? "text-[#EABB00]" : "text-gray-400"
                  }`}
              />
              <span className={`${isItemActive ? "text-[#EABB00]" : "text-gray-400"
                }`}>{item.title}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className='flex gap-2 items-center py-2 px-4 hover:bg-red-300 transition-colors duration-300 rounded-md cursor-pointer'
        >
          <span className='font-bold text-2xl'>
            <MdLogout />
          </span>
          <span className='font-semibold text-lg text-gray-700'>Log Out</span>
        </button>
      </div>
    </div>
  )
}

export default Sidebar;
