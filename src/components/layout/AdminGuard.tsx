"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { removeAuthCookie } from "@/app/actions/auth";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useGetProfileQuery } from "@/features/profile/profileApi";
import {
  getFirstPermittedRoute,
  isRouteAllowedForAdmin,
} from "@/constants/permissions";

export const decodeRoleFromToken = (token: string): string | null => {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const base64 = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const parsed = JSON.parse(jsonPayload);
    return (parsed?.role || parsed?.userRole || "").toString().toUpperCase();
  } catch {
    return null;
  }
};

const getCookieValue = (name: string): string | null => {
  if (typeof window === "undefined" || !document.cookie) return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const { data: profileData } = useGetProfileQuery({});
  const profileUser = profileData?.data;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token =
      getCookieValue("alexandertel-admin-token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token");

    if (!token) {
      setIsAuthorized(true);
      return;
    }

    const role = (
      profileUser?.role ||
      decodeRoleFromToken(token) ||
      ""
    ).toUpperCase();

    // 1. Strictly block non-admin accounts from the dashboard
    if (role && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      toast.error("Access Denied: Dashboard access is restricted to Administrators only.");
      dispatch(logout());
      removeAuthCookie();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      setIsAuthorized(false);
      window.location.replace("/auth/login");
      return;
    }

    // 2. Super Admin always has full unrestricted access
    if (role === "SUPER_ADMIN") {
      setIsAuthorized(true);
      return;
    }

    // 3. Granular permission checking for ADMIN
    if (role === "ADMIN" && profileUser) {
      const permissions: string[] = Array.isArray(profileUser.permissions)
        ? profileUser.permissions
        : [];

      // If this admin has custom assigned permissions:
      if (permissions.length > 0) {
        // If landing on root overview '/' without OVERVIEW permission, redirect to their first permitted route
        if (pathname === "/" && !permissions.includes("OVERVIEW")) {
          const target = getFirstPermittedRoute(permissions, role);
          if (target && target !== "/") {
            setIsAuthorized(true);
            router.replace(target);
            return;
          }
        }

        // If trying to access a page that is not permitted, block and redirect back
        if (!isRouteAllowedForAdmin(pathname, permissions, role)) {
          toast.error("Access Denied: You do not have permission to view this page.");
          const target = getFirstPermittedRoute(permissions, role);
          router.replace(target || "/");
          return;
        }
      }
    }

    setIsAuthorized(true);
  }, [dispatch, router, pathname, profileUser]);

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Verifying Session...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
