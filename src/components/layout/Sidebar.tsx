"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { sidebarData, TMenuItem, TSubMenuItem } from '@/constants/sidebarData'
import { logo } from '@/assets/assets'
import { MdLogout } from "react-icons/md";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  const [openSubMenus, setOpenSubMenus] = useState<Record<number, boolean>>({});

  const isActive = (url?: string) => {
    if (!url) return false;
    if (url === "/") return pathname === "/";
    return pathname === url || pathname.startsWith(`${url}/`);
  };

  const isChildActive = (children?: TSubMenuItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.label));
  };

  // Auto-expand parent if active child route is loaded
  useEffect(() => {
    sidebarData.forEach((item) => {
      if (item.children && isChildActive(item.children)) {
        setOpenSubMenus((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [pathname]);

  const toggleSubMenu = (id: number) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
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
              const Icon = item.icon;
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isParentActive = hasChildren
                ? isChildActive(item.children)
                : isActive(item.label);
              const isOpen = Boolean(openSubMenus[item.id]);

              if (hasChildren) {
                return (
                  <div key={item.id} className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => toggleSubMenu(item.id)}
                      className={`flex items-center justify-between py-3 px-4 rounded-md transition-colors duration-300 cursor-pointer ${
                        isParentActive
                          ? "text-white bg-[#373737] border-l-4 border-[#EABB00]"
                          : "text-white border-l-4 border-transparent hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex gap-2.5 items-center">
                        <Icon
                          className={`w-6 h-6 shrink-0 ${
                            isParentActive ? "text-[#EABB00]" : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`${
                            isParentActive ? "text-[#EABB00]" : "text-gray-400"
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180 text-white" : "rotate-0 text-gray-400"
                        }`}
                      />
                    </button>

                    {/* Submenu Accordion with Smooth Transition */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? "max-h-60 opacity-100 mt-1.5 mb-1" : "max-h-0 opacity-0 mt-0 mb-0"
                      }`}
                    >
                      <div className="flex flex-col gap-1 ml-4 pl-3.5 border-l-2 border-gray-700/60">
                        {item.children?.map((child) => {
                          const isSubActive = isActive(child.label);
                          const ChildIcon = child.icon;

                          return (
                            <Link
                              href={child.label}
                              key={child.id}
                              className={`flex gap-3 items-center py-2.5 px-3.5 rounded-lg transition-all duration-200 cursor-pointer text-sm font-medium ${
                                isSubActive
                                  ? "text-[#EABB00] font-semibold bg-[#2a2a2a] shadow-sm"
                                  : "text-gray-400 hover:text-white hover:bg-gray-800/80"
                              }`}
                            >
                              {ChildIcon && (
                                <ChildIcon
                                  className={`w-5 h-5 shrink-0 transition-colors ${
                                    isSubActive ? "text-[#EABB00]" : "text-gray-400"
                                  }`}
                                />
                              )}
                              <span>{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  href={item.label || "#"}
                  key={item.id}
                  className={`flex gap-2 items-center py-3 px-4 rounded-md transition-colors duration-300 cursor-pointer ${
                    isParentActive
                      ? "text-white bg-[#373737] border-l-4 border-[#EABB00]"
                      : "text-white border-l-4 border-transparent hover:bg-gray-800"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isParentActive ? "text-[#EABB00]" : "text-gray-400"
                    }`}
                  />
                  <span
                    className={`${
                      isParentActive ? "text-[#EABB00]" : "text-gray-400"
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
