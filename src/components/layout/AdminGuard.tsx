"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { logout } from "@/features/auth/authSlice";
import { removeAuthCookie } from "@/app/actions/auth";
import { toast } from "sonner";

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
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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

    const role = decodeRoleFromToken(token);

    if (role && role !== "ADMIN" && role !== "SUPER_ADMIN") {
      toast.error("Access Denied: Dashboard access is restricted to Administrators only.");
      dispatch(logout());
      removeAuthCookie();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      setIsAuthorized(false);
      window.location.replace("/auth/login");
    } else {
      setIsAuthorized(true);
    }
  }, [dispatch]);

  if (isAuthorized === false) {
    return null;
  }

  return <>{children}</>;
}
