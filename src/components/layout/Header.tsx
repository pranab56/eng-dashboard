"use client";

import { useHeaders } from '@/hooks/useHeaders';
import Image from 'next/image';

import { useGetProfileQuery } from '@/features/profile/profileApi';
import { useNotificationUnReadCountQuery } from '@/features/notification/notificationApi';
import { Bell, Menu, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { formatImagePath } from '@/utils/formatImagePath';
import { useSidebar } from '@/context/SidebarContext';

const Header = () => {
  const { headers } = useHeaders();
  const { toggleMobile, toggleCollapse, isCollapsed } = useSidebar();
  const { data: profileData } = useGetProfileQuery({});
  const { data: unreadData } = useNotificationUnReadCountQuery(undefined);

  const user = profileData?.data;
  const unreadCount = unreadData?.data?.unreadCount || 0;

  return (
    <div className="h-full flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 bg-white select-none">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button (< lg) */}
        <button
          type="button"
          onClick={toggleMobile}
          className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open sidebar navigation"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse/Expand Toggle (>= lg) */}
        <button
          type="button"
          onClick={toggleCollapse}
          className="hidden lg:flex p-2 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          
          <div className="min-w-0">
            <h1 className="font-semibold text-base sm:text-lg text-slate-900 truncate">
              {headers?.title || "Dashboard"}
            </h1>
            {headers?.des && (
              <p className="text-xs text-slate-500 truncate hidden md:block">
                {headers?.des}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell Button */}
        <Link
          href="/push-notification"
          className="relative p-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors flex items-center justify-center cursor-pointer"
          aria-label="Push notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full px-1 border border-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* Profile Link */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors group cursor-pointer"
        >
          <div className="text-right hidden sm:block min-w-0">
            <p className="font-semibold text-xs text-slate-900 truncate group-hover:text-amber-600 transition-colors">
              {user?.userName || user?.firstName || "Admin User"}
            </p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide truncate">
              {user?.role?.replace("_", " ") || "Administrator"}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-100 flex items-center justify-center rounded-lg border border-slate-200 overflow-hidden shrink-0 group-hover:border-slate-300 transition-colors">
            {user?.profile ? (
              <Image
                src={formatImagePath(user.profile)}
                width={80}
                height={80}
                alt="profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-bold text-xs text-slate-400">
                {(user?.userName || user?.firstName || "A").slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Header;
