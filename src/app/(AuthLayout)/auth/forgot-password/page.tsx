"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useForgotEmailMutation } from "../../../../features/auth/authApi";

// Schema
const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const defaultValues: Partial<ForgotPasswordFormValues> = {
  email: "",
};

const ForgotPassword = () => {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotEmailMutation();

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    try {
      const res = await forgotPassword({ email: data.email }).unwrap();
      if (res.success) {
        toast.success(res.message || "Reset code sent successfully");
        router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; data?: { message?: string } };
      console.error("Reset error:", err);
      toast.error(err?.data?.message || err?.message || "Failed to send reset code");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center py-12 px-4 sm:px-6 antialiased overflow-hidden">
      {/* Subtle Ambient Light Mesh & Radiance (No Black) */}
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
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Password Recovery</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Forgot Password
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Enter your admin email and we will send you a 6-digit verification code.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Address */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5 text-left">
                  <FormLabel className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="email"
                        autoComplete="email"
                        placeholder="admin@engsports.com"
                        className="h-11 text-sm pl-10 pr-3 rounded-lg border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors placeholder:text-slate-400"
                        {...field}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  <span>Sending Code...</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </button>

            {/* Back to Sign In Link */}
            <div className="pt-2 flex justify-center items-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        </Form>

        {/* Security Footer */}
        <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Enterprise Access &bull; Strict Role Authorization</span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
