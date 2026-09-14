"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  sidebarSections,
  TMenuItem,
  TSubMenuItem,
  } from "@/constants/sidebarData";
import { logo } from "@/assets/assets";
import { MdLogout } from "react-icons/md";
import {
  ChevronDown,
  Search,
  X,
    ShieldCheck,
} from "lucide-react";

import { logout } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { removeAuthCookie } from "../../app/actions/auth";
import LogoutConfirmModal from "../modals/LogoutConfirmModal";
import { useGetProfileQuery } from "@/features/profile/profileApi";
import { formatImagePath } from "@/utils/formatImagePath";

const Sidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profileData } = useGetProfileQuery({});
  const user = profileData?.data;

  const isActive = useCallback(
    (url?: string) => {
      if (!url) return false;
      if (url === "/") return pathname === "/";
      return pathname === url || pathname.startsWith(`${url}/`);
    },
    [pathname]
  );

  const isChildActive = useCallback(
    (children?: TSubMenuItem[]) => {
      if (!children) return false;
      return children.some((child) => isActive(child.label));
    },
    [isActive]
  );

  // Auto-expand parent if active child route is loaded
  useEffect(() => {
    sidebarSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && isChildActive(item.children)) {
          setOpenSubMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      });
    });
  }, [pathname, isChildActive]);

  const toggleSubMenu = (id: number) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

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

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sidebarSections;

    const query = searchQuery.toLowerCase().trim();
    return sidebarSections
      .map((section) => {
        const matchingItems = section.items.filter((item) => {
          const matchTitle = item.title.toLowerCase().includes(query);
          const matchChildren = item.children?.some((child) =>
            child.title.toLowerCase().includes(query)
          );
          return matchTitle || matchChildren;
        });

        return {
          ...section,
          items: matchingItems,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [searchQuery]);

  return (
    <>
      <div className="h-full flex flex-col bg-[#0b0c10] text-gray-300 select-none border-r border-white/[0.06] overflow-hidden">
        {/* Brand Header */}
        <div className="p-4 flex flex-col items-center justify-center border-b border-white/[0.07] bg-[#07080a] flex-shrink-0 relative">
          <Link href="/" className="flex flex-col items-center group cursor-pointer">
            {logo && (
              <Image
                src={logo}
                width={240}
                height={70}
                alt="ENG Logo"
                className="w-[125px] h-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            )}
            <div className="mt-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-amber-300">
                ADMIN PORTAL
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Menu Search */}
        <div className="px-3 pt-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className="w-full bg-white/[0.04] hover:bg-white/[0.07] focus:bg-white/[0.08] text-xs text-white placeholder-gray-500 rounded-xl pl-8 pr-7 py-2 border border-white/[0.06] focus:border-amber-500/50 focus:outline-none transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation List by Structured Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4 min-h-0 custom-sidebar-scroll">
          {filteredSections.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No matching pages found
            </div>
          ) : (
            filteredSections.map((section) => (
              <div key={section.id} className="space-y-1">
                {/* Section Header */}
                <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400/90 font-mono">
                    {section.title}
                  </span>
                  <span className="text-[9px] font-semibold text-gray-500 bg-white/[0.04] px-1.5 py-0.2 rounded-md">
                    {section.items.length}
                  </span>
                </div>

                {/* Section Items */}
                <div className="space-y-0.5">
                  {section.items.map((item: TMenuItem) => {
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
                            className={`group w-full flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer ${
                              isParentActive
                                ? "bg-amber-500/15 text-amber-300 font-semibold border-l-2 border-amber-400 shadow-sm"
                                : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`p-1 rounded-lg transition-colors duration-200 ${
                                  isParentActive
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-gray-400 group-hover:text-gray-200 group-hover:bg-white/[0.05]"
                                }`}
                              >
                                <Icon className="w-4 h-4 shrink-0" />
                              </span>
                              <span className="text-xs truncate">{item.title}</span>
                            </div>
                            <ChevronDown
                              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                                isOpen
                                  ? "rotate-180 text-amber-400"
                                  : "text-gray-500 group-hover:text-gray-300"
                              }`}
                            />
                          </button>

                          {/* Nested Submenu */}
                          <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out ${
                              isOpen ? "max-h-48 opacity-100 mt-1 mb-1" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="ml-4 pl-3 border-l border-white/[0.08] space-y-0.5">
                              {item.children?.map((child) => {
                                const isSubActive = isActive(child.label);
                                const ChildIcon = child.icon;

                                return (
                                  <Link
                                    href={child.label}
                                    key={child.id}
                                    className={`group flex items-center gap-2 py-1.5 px-2.5 rounded-lg text-xs transition-all duration-150 ${
                                      isSubActive
                                        ? "text-amber-400 font-semibold bg-white/[0.07]"
                                        : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                                  >
                                    {ChildIcon ? (
                                      <ChildIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isSubActive ? "text-amber-400" : "text-gray-500"
                                        }`}
                                      />
                                    ) : (
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isSubActive ? "bg-amber-400" : "bg-gray-600"
                                        }`}
                                      />
                                    )}
                                    <span className="truncate">{child.title}</span>
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
                        className={`group flex items-center justify-between py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer text-xs ${
                          isParentActive
                            ? "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 font-semibold border-l-2 border-amber-400 shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`p-1 rounded-lg transition-colors duration-200 ${
                              isParentActive
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-gray-400 group-hover:text-gray-200 group-hover:bg-white/[0.05]"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>

                        {/* Active Pill Glow */}
                        {isParentActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(234,187,0,0.9)] shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area: User Card & Refined Logout */}
        <div className="p-3 border-t border-white/[0.07] bg-[#07080a] flex-shrink-0 flex flex-col gap-2">
          {/* Admin User Mini Info */}
          <Link
            href="/profile"
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-200 group cursor-pointer border border-white/[0.04]"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 border border-white/10 shrink-0 flex items-center justify-center">
              {user?.profile ? (
                <Image
                  src={formatImagePath(user.profile)}
                  width={64}
                  height={64}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                {user?.userName || user?.firstName || "ENG Admin"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-gray-400 uppercase tracking-wide truncate">
                  {user?.role?.replace("_", " ") || "Administrator"}
                </span>
              </div>
            </div>
          </Link>

          {/* Aesthetic Logout Button */}
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/30 transition-all duration-200 cursor-pointer font-semibold text-xs tracking-wider"
          >
            <MdLogout className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default Sidebar;
