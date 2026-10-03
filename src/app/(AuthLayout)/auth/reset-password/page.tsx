"use client";

import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
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
import { useResetPasswordMutation } from "../../../../features/auth/authApi";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const defaultValues: Partial<ResetPasswordFormValues> = {
  password: "",
  confirmPassword: "",
};

const ResetPassword = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ResetPasswordFormValues) {
    try {
      const res = await resetPassword({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap();
      if (res.success) {
        toast.success(res.message || "Password updated successfully");
        router.push("/auth/login");
      }
    } catch (error: unknown) {
      const err = error as { message?: string; data?: { message?: string } };
      console.error("Reset error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to reset password");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 antialiased overflow-hidden">
      {/* Subtle Ambient Light Mesh & Radiance */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[520px] h-[300px] bg-gradient-to-b from-emerald-100/50 via-slate-100/60 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="relative z-10 mb-6 flex flex-col items-center">
        {logo ? (
          <Image
            src={logo}
            width={140}
            height={36}
            alt="ENG Sports"
            className="h-8 w-auto object-contain"
            priority
          />
        ) : (
          <span className="font-extrabold tracking-wider text-base text-slate-900">ENG SPORTS</span>
        )}
      </div>

      {/* Clean White Elevated Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Reset Password</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Set New Password</h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Create a secure password for your administrator account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5 text-left">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        className="h-11 text-sm pl-10 pr-10 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                        {...field}
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5 text-left">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder="Confirm new password"
                        className="h-11 text-sm pl-10 pr-10 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                        {...field}
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-0.5"
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              className="w-full h-11 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        </Form>

        <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Enterprise Access &bull; Strict Role Authorization</span>
        </div>
      </div>
    </div>
  );
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-6 text-slate-400 text-xs">Loading password reset...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
