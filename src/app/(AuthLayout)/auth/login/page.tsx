"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from "lucide-react";

import { logo } from "@/assets/assets";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLoginMutation } from "@/features/auth/authApi";
import { setAuthenticated } from "@/features/auth/authSlice";
import { setAuthCookie } from "../../../actions/auth";
import { decodeRoleFromToken } from "@/components/layout/AdminGuard";
import { getFirstPermittedRoute } from "@/constants/permissions";

// Schema
const loginFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

const defaultValues: Partial<LoginFormValues> = {
  email: "",
  password: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: LoginFormValues) {
    const payload = {
      email: data.email,
      password: data.password,
    };

    try {
      const res = await login(payload).unwrap();
      const accessToken =
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.accessToken ||
        res?.token;
      const refreshToken =
        res?.data?.refreshToken ||
        res?.refreshToken;

      if (!accessToken) {
        toast.error(res?.message || "Login failed: Token not received from server");
        return;
      }

      // 🛑 Role check: strictly allow ADMIN & SUPER_ADMIN only
      const userRole =
        decodeRoleFromToken(accessToken) ||
        (res?.data?.role || res?.role || "").toUpperCase();
      if (userRole && userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        toast.error("Access Denied: Only Administrator and Super Admin accounts can access the dashboard.");
        return;
      }

      toast.success(res?.message || "Login successful");
      dispatch(setAuthenticated({ accessToken, refreshToken }));
      if (typeof window !== "undefined") {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      }
      await setAuthCookie(accessToken, refreshToken);

      // Smart landing redirect based on permissions
      const permissions = res?.data?.permissions || [];
      if (
        userRole === "ADMIN" &&
        Array.isArray(permissions) &&
        permissions.length > 0 &&
        !permissions.includes("OVERVIEW")
      ) {
        const targetRoute = getFirstPermittedRoute(permissions, userRole);
        window.location.replace(targetRoute);
      } else {
        window.location.replace("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    }
  }

  return (
    <div className="w-full">
      {/* Brand & Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center justify-center bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800 shadow-2xs mb-4">
          {logo ? (
            <Image
              src={logo}
              width={140}
              height={36}
              alt="ENG Sports"
              className="h-7 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-bold text-white tracking-wider text-sm">ENG SPORTS</span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Admin Sign In</h1>
        <p className="text-xs text-slate-500 mt-1">Enter your credentials to access the administration portal</p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5 text-left">
                <FormLabel className="text-xs font-semibold text-slate-700">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="admin@engsports.com"
                      className="h-10 text-sm pl-9 pr-3 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                      {...field}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </FormControl>
                <FormMessage className="text-[11px] text-red-600 font-medium mt-1" />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-slate-700">Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      className="h-10 text-sm pl-9 pr-10 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                      {...field}
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[11px] text-red-600 font-medium mt-1" />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </Form>

      {/* Security notice */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Enterprise Access &bull; Strict Role Authorization</span>
      </div>
    </div>
  );
};

export default Login;
