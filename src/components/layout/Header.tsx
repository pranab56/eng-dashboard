/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useHeaders } from "@/hooks/useHeaders";
import { useSidebar } from "@/context/SidebarContext";
import { useGetProfileQuery } from "@/features/profile/profileApi";
import { useNotificationUnReadCountQuery } from "@/features/notification/notificationApi";
import { formatImagePath } from "@/utils/formatImagePath";
import { removeAuthCookie } from "../../app/actions/auth";
import { logout } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import LogoutConfirmModal from "../modals/LogoutConfirmModal";
import NotificationDropdown from "./NotificationDropdown";

import {
  Bell,
  Menu,
  PanelLeft,
  ChevronRight,
  ChevronDown,
  User,
  Settings,
  Activity,
  LogOut,
  Send,
  Home,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const dispatch = useDispatch();
  const { headers } = useHeaders();
  const { toggleMobile, toggleCollapse, isCollapsed } = useSidebar();
  const { data: profileData } = useGetProfileQuery({});
  const { data: unreadData } = useNotificationUnReadCountQuery(undefined);

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const user = profileData?.data;
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    toast.loading("Logging out...", { id: "logout" });

    try {
      await removeAuthCookie();
      dispatch(logout());
      toast.success("Logged out successfully", { id: "logout" });
      window.location.replace("/auth/login");
    } catch {
      toast.error("Failed to log out", { id: "logout" });
      setIsLoggingOut(false);
    }
  };

  const roleDisplay = user?.role ? user.role.replace(/_/g, " ") : "Administrator";
  const userInitials = (user?.userName || user?.firstName || "A").slice(0, 2).toUpperCase();

  return (
    <>
      <div className="h-full flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 bg-white select-none">
        {/* Left Section: Sidebar Controls & Breadcrumb / Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Mobile Hamburger Toggle (< lg) */}
          <button
            type="button"
            onClick={toggleMobile}
            className="lg:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label="Open sidebar navigation"
            title="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Sidebar Collapse Toggle (>= lg) */}
          <button
            type="button"
            onClick={toggleCollapse}
            className="hidden lg:flex p-1.5 -ml-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Vertical Divider */}
          <div className="hidden sm:block h-4 w-px bg-slate-200 shrink-0" />

          {/* Breadcrumb + Page Title Hierarchy */}
          <div className="min-w-0 flex flex-col justify-center">
            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 leading-none mb-1">
              <Link
                href="/"
                className="hover:text-slate-700 transition-colors flex items-center gap-1"
              >
                <Home className="w-3 h-3" />
                <span>Dashboard</span>
              </Link>
              {headers?.title && headers.title !== "Dashboard" && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="text-slate-700 font-medium truncate max-w-[200px]">
                    {headers.title}
                  </span>
                </>
              )}
            </nav>

            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base text-slate-900 tracking-tight leading-tight truncate">
                {headers?.title || "Dashboard Overview"}
              </h1>
              {headers?.des && (
                <span className="hidden xl:inline-block text-xs text-slate-400 font-normal truncate max-w-sm">
                  — {headers.des}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Utility Pill (Widescreen Only) */}
        <div className="hidden 2xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>Network Live</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Europe / London</span>
        </div>

        {/* Right Section: System Quick Links, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Server Health Quick Pill */}
          <Link
            href="/server-health"
            className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
            title="Inspect server metrics and infrastructure health"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline text-[11px]">System Status</span>
          </Link>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200 shrink-0" />

          {/* Account Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 p-1 sm:pl-1.5 sm:pr-2.5 rounded-md border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer group focus:outline-none"
              >
                {/* User Avatar */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {user?.profile ? (
                    <Image
                      src={formatImagePath(user.profile)}
                      width={64}
                      height={64}
                      alt="profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-[11px] text-slate-500">
                      {userInitials}
                    </span>
                  )}
                </div>

                {/* Name & Role Text */}
                <div className="text-left hidden sm:block min-w-0 max-w-[130px]">
                  <p className="font-semibold text-xs text-slate-900 truncate group-hover:text-slate-950 transition-colors leading-tight">
                    {user?.userName || user?.firstName || "Admin"}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider truncate">
                    {roleDisplay}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors shrink-0 ml-0.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white border border-slate-200 rounded-lg shadow-lg">
              {/* Account Summary Header */}
              <DropdownMenuLabel className="p-2 font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {user?.userName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin Account"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || "admin@engsports.co.uk"}
                  </p>
                  <div className="pt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wide border border-slate-200">
                      {roleDisplay}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              {/* Navigation Items */}
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Match & Rating Rules</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/server-health"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-500" />
                  <span>Server Health & Logs</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  href="/push-notification"
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-slate-500" />
                  <span>Broadcast Notification</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 bg-slate-100" />

              {/* Logout Option */}
              <DropdownMenuItem
                onClick={() => setIsLogoutModalOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="font-medium">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Header;
