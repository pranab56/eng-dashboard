"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 antialiased"><div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Forgot Password</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter your admin email and we will send you a 6-digit verification code
        </p>
      </div>

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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none mt-2"
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

      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Enterprise Access &bull; Strict Role Authorization</span>
      </div>
    </div></div>
  );
};

export default ForgotPassword;
