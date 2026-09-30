/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  sidebarSections,
  getAuthorizedNavigation,
  TMenuItem,
  TSubMenuItem,
} from "@/constants/sidebarData";
import { logo } from "@/assets/assets";
import { getFirstPermittedRoute } from "@/constants/permissions";
import {
  ChevronDown,
  Search,
  X,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Sliders,
  User,
} from "lucide-react";

import { logout } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { removeAuthCookie } from "../../app/actions/auth";
import LogoutConfirmModal from "../modals/LogoutConfirmModal";
import { useGetProfileQuery } from "@/features/profile/profileApi";
import { formatImagePath } from "@/utils/formatImagePath";
import { useSidebar } from "@/context/SidebarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isMobile?: boolean;
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { isCollapsed, toggleCollapse, closeMobile } = useSidebar();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string | number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: profileData } = useGetProfileQuery({});
  const user = profileData?.data;

  // Compute authorized navigation sections based on user role and permissions
  const authorizedSections = useMemo(() => {
    return getAuthorizedNavigation(sidebarSections, user?.role, user?.permissions);
  }, [user?.role, user?.permissions]);

  // Compute dynamic logo destination matching admin's permissions
  const logoHref = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return "/";
    const perms = Array.isArray(user?.permissions) ? user.permissions : [];
    if (perms.length === 0 || perms.includes("OVERVIEW")) {
      return "/";
    }
    return getFirstPermittedRoute(perms, user?.role) || "/";
  }, [user?.role, user?.permissions]);

  // Route matching
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

  // Auto-expand parent section if a child route is active
  useEffect(() => {
    authorizedSections.forEach((section) => {
      section.items.forEach((item) => {
        if (item.children && isChildActive(item.children)) {
          setOpenSubMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      });
    });
  }, [pathname, authorizedSections, isChildActive]);

  const toggleSubMenu = (id: string | number) => {
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

  // Filter sections by search query when search is active
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return authorizedSections;

    const query = searchQuery.toLowerCase().trim();
    return authorizedSections
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
  }, [authorizedSections, searchQuery]);

  // Handle link click in mobile drawer to auto-close
  const handleLinkClick = () => {
    if (isMobile) {
      closeMobile();
    }
  };

  // Determine if collapsed mode applies (mobile drawer is never collapsed)
  const collapsed = !isMobile && isCollapsed;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="h-full flex flex-col bg-[#0b0c10] text-slate-300 select-none overflow-hidden">
        {/* Top Header: Brand & Collapse Toggle */}
        <div className="h-16 px-3 flex items-center justify-between border-b border-white/[0.08] bg-[#07080a] shrink-0">
          {!collapsed ? (
            <>
              <Link
                href={logoHref}
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 min-w-0 group cursor-pointer"
              >
                {logo ? (
                  <Image
                    src={logo}
                    width={180}
                    height={48}
                    alt="ENG Sports"
                    className="w-[105px] h-auto object-contain transition-transform duration-200 group-hover:scale-102"
                    priority
                  />
                ) : (
                  <span className="font-bold text-sm tracking-wider text-white">ENG ADMIN</span>
                )}
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  PORTAL
                </span>
              </Link>

              {/* Toggle or Close Button */}
              {isMobile ? (
                <button
                  type="button"
                  onClick={closeMobile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                  title="Close sidebar"
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleCollapse}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      aria-label="Collapse sidebar"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Collapse sidebar</TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            /* Collapsed Header */
            <div className="w-full flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Quick Menu Search (Expanded Only) */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search navigation..."
                className="w-full bg-white/[0.04] hover:bg-white/[0.06] focus:bg-white/[0.08] text-xs text-white placeholder-slate-500 rounded-lg pl-8 pr-7 py-2 border border-white/[0.08] focus:border-amber-500/50 focus:outline-hidden transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Section List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-3 min-h-0 custom-sidebar-scroll">
          {filteredSections.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching pages found
            </div>
          ) : (
            filteredSections.map((section, sIdx) => (
              <div key={section.id} className="space-y-0.5">
                {/* Section Header */}
                {!collapsed ? (
                  <div className="px-2 pt-2 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      {section.title}
                    </span>
                    <span className="text-[9px] font-semibold text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {section.items.length}
                    </span>
                  </div>
                ) : (
                  sIdx > 0 && <div className="my-1.5 border-t border-white/[0.06]" />
                )}

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item: TMenuItem) => {
                    const Icon = item.icon;
                    const hasChildren = Boolean(item.children && item.children.length > 0);
                    const isParentActive = hasChildren
                      ? isChildActive(item.children)
                      : isActive(item.label);
                    const isOpen = Boolean(openSubMenus[item.id]);

                    // ============================================================
                    // 1. COLLAPSED ICON-ONLY VIEW
                    // ============================================================
                    if (collapsed) {
                      if (hasChildren) {
                        return (
                          <DropdownMenu key={item.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    type="button"
                                    className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                      isParentActive
                                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                        : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                                    }`}
                                    aria-label={item.title}
                                  >
                                    <Icon className="w-4 h-4 shrink-0" />
                                  </button>
                                </DropdownMenuTrigger>
                              </TooltipTrigger>
                              <TooltipContent side="right">{item.title}</TooltipContent>
                            </Tooltip>

                            <DropdownMenuContent
                              side="right"
                              sideOffset={12}
                              className="w-48 bg-slate-900 border border-slate-700/80 text-slate-100 p-1 rounded-lg shadow-xl"
                            >
                              <DropdownMenuLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                                {item.title}
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-800 my-1" />
                              {item.children?.map((child) => {
                                const isSubActive = isActive(child.label);
                                const ChildIcon = child.icon;
                                return (
                                  <DropdownMenuItem key={child.id} asChild>
                                    <Link
                                      href={child.label}
                                      onClick={handleLinkClick}
                                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                                        isSubActive
                                          ? "bg-amber-500/15 text-amber-400 font-semibold"
                                          : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                      }`}
                                    >
                                      {ChildIcon && <ChildIcon className="w-3.5 h-3.5 shrink-0" />}
                                      <span className="truncate">{child.title}</span>
                                    </Link>
                                  </DropdownMenuItem>
                                );
                              })}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        );
                      }

                      return (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.label || "#"}
                              onClick={handleLinkClick}
                              className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                isParentActive
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
                              }`}
                              aria-label={item.title}
                            >
                              <Icon className="w-4 h-4 shrink-0" />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <div className="flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {isParentActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    // ============================================================
                    // 2. EXPANDED VIEW WITH LABELS & ACCORDION
                    // ============================================================
                    if (hasChildren) {
                      return (
                        <div key={item.id} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => toggleSubMenu(item.id)}
                            className={`group w-full flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors cursor-pointer text-xs ${
                              isParentActive
                                ? "bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-400"
                                : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`p-1 rounded transition-colors ${
                                  isParentActive
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-slate-400 group-hover:text-slate-200"
                                }`}
                              >
                                <Icon className="w-4 h-4 shrink-0" />
                              </span>
                              <span className="truncate">{item.title}</span>
                            </div>
                            <ChevronDown
                              className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                                isOpen
                                  ? "rotate-180 text-amber-400"
                                  : "text-slate-500 group-hover:text-slate-300"
                              }`}
                            />
                          </button>

                          {/* Nested Submenu */}
                          <div
                            className={`overflow-hidden transition-all duration-200 ease-in-out ${
                              isOpen ? "max-h-60 opacity-100 mt-1 mb-1" : "max-h-0 opacity-0"
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
                                    onClick={handleLinkClick}
                                    className={`group flex items-center gap-2 py-1.5 px-2.5 rounded-md text-xs transition-colors ${
                                      isSubActive
                                        ? "text-amber-400 font-semibold bg-white/[0.08]"
                                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                                    }`}
                                  >
                                    {ChildIcon ? (
                                      <ChildIcon
                                        className={`w-3.5 h-3.5 shrink-0 ${
                                          isSubActive ? "text-amber-400" : "text-slate-500"
                                        }`}
                                      />
                                    ) : (
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                          isSubActive ? "bg-amber-400" : "bg-slate-600"
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
                        onClick={handleLinkClick}
                        className={`group flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors cursor-pointer text-xs ${
                          isParentActive
                            ? "bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-400"
                            : "text-slate-300 hover:text-white hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`p-1 rounded transition-colors ${
                              isParentActive
                                ? "text-amber-400 bg-amber-500/10"
                                : "text-slate-400 group-hover:text-slate-200"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0" />
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>

                        {/* Active Accent Dot */}
                        {isParentActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom User / Account Section */}
        <div className="p-3 border-t border-white/[0.08] bg-[#07080a] shrink-0">
          {!collapsed ? (
            /* Expanded User Section */
            <div className="space-y-2">
              <Link
                href="/profile"
                onClick={handleLinkClick}
                className="flex items-center gap-2.5 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors group cursor-pointer border border-white/[0.06]"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 border border-white/10 shrink-0 flex items-center justify-center">
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
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide truncate">
                      {user?.role?.replace("_", " ") || "Administrator"}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-colors cursor-pointer font-semibold text-xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            /* Collapsed User Section */
            <div className="flex flex-col items-center gap-2">
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 border-2 border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer flex items-center justify-center"
                        aria-label="User account menu"
                      >
                        {user?.profile ? (
                          <Image
                            src={formatImagePath(user.profile)}
                            width={48}
                            height={48}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShieldCheck className="w-4 h-4 text-amber-400" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {user?.userName || user?.firstName || "Admin Account"}
                  </TooltipContent>
                </Tooltip>

                <DropdownMenuContent
                  side="right"
                  sideOffset={12}
                  className="w-56 bg-slate-900 border border-slate-700/80 text-slate-100 p-1 rounded-lg shadow-xl"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-semibold text-white truncate">
                      {user?.userName || user?.firstName || "ENG Admin"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@eng.com"}</p>
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                      {user?.role?.replace("_", " ") || "Administrator"}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-800 my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-slate-400" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-800 my-1" />
                  <DropdownMenuItem
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        isLoading={isLoggingOut}
      />
    </TooltipProvider>
  );
}
