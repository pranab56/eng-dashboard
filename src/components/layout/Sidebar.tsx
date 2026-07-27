"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { sidebarData, TMenuItem } from '@/constants/sidebarData'
import { logo } from '@/assets/assets'
import { MdLogout } from "react-icons/md";

import { logout } from '@/features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { removeAuthCookie } from '../../app/actions/auth';
import LogoutConfirmModal from '../modals/LogoutConfirmModal';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.loading("Logging out...", {
      id: "logout",
    });

    try {
      await removeAuthCookie();
      dispatch(logout());
      toast.success('Logged out successfully', { id: 'logout' });
      window.location.replace('/auth/login');
    } catch (error) {
      toast.error('Failed to log out', { id: 'logout' });
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <div className='h-full flex flex-col overflow-hidden'>
        <div className='w-full flex items-center justify-center py-4 cursor-pointer border-b border-gray-700 flex-shrink-0'>
          {logo && <Image src={logo} width={1000} height={300} alt="ENG Logo" className='w-[140px] h-auto' />}
        </div>
        <div className='flex-1 overflow-y-auto hide-scrollbar flex flex-col justify-between min-h-0'>
          <div className='flex flex-col gap-1 py-1 px-2'>
            {sidebarData?.map((item: TMenuItem) => {
              const isItemActive = isActive(item?.label);
              const Icon = item.icon;

              return (
                <Link
                  href={item?.label}
                  key={item.id}
                  className={`flex gap-2 items-center py-3 px-4 rounded-md transition-colors duration-300 cursor-pointer ${
                    isItemActive
                      ? "text-white bg-[#373737] border-l-4 border-[#EABB00]"
                      : "text-white border-l-4 border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isItemActive ? "text-[#EABB00]" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`${
                      isItemActive ? "text-[#EABB00]" : "text-gray-400"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className='sticky bottom-0 flex flex-col gap-1 px-2 py-4 bg-black flex-shrink-0'>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className='flex gap-2 items-center py-2 px-4 bg-red-500 hover:bg-red-600 transition-colors duration-300 rounded-md cursor-pointer'
            >
              <span className='font-bold text-2xl'>
                <MdLogout className='text-white' />
              </span>
              <span className='font-semibold text-lg text-white'>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  )
}

export default Sidebar;
