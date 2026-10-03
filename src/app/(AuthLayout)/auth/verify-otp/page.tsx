"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Loader2, RotateCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useResendOTPMutation, useVerifyEmailMutation } from "../../../../features/auth/authApi";

const verifyOtpSchema = z.object({
  verifyOtp: z.string().min(6, { message: "Please enter all 6 digits." }),
});

type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

const defaultValues: Partial<VerifyOtpFormValues> = {
  verifyOtp: "",
};

const VerifyOtp = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const router = useRouter();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [reSendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();

  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: VerifyOtpFormValues) {
    try {
      const res = await verifyEmail({ email, oneTimeCode: data.verifyOtp }).unwrap();
      if (res.success) {
        toast.success(res.message || "Code verified successfully");
        router.push(`/auth/reset-password?token=${encodeURIComponent(res.data)}`);
      }
    } catch (error: unknown) {
      const err = error as { message?: string; data?: { message?: string } };
      console.error("Verification error:", err);
      toast.error(err?.data?.message || err?.message || "Verification failed");
    }
  }

  const handleResendOTP = async () => {
    try {
      const res = await reSendOTP({ email }).unwrap();
      if (res.success) {
        toast.success(res.message || "OTP resent successfully");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center py-12 px-4 sm:px-6 antialiased"><div className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Verify Code</h1>
        <p className="text-xs text-slate-500 mt-1">
          Enter the 6-digit verification code sent to{" "}
          <strong className="text-slate-800 font-semibold">{email || "your email"}</strong>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="verifyOtp"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center">
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-10 h-11 text-base rounded-md border-slate-200" />
                      <InputOTPSlot index={1} className="w-10 h-11 text-base rounded-md border-slate-200" />
                      <InputOTPSlot index={2} className="w-10 h-11 text-base rounded-md border-slate-200" />
                      <InputOTPSlot index={3} className="w-10 h-11 text-base rounded-md border-slate-200" />
                      <InputOTPSlot index={4} className="w-10 h-11 text-base rounded-md border-slate-200" />
                      <InputOTPSlot index={5} className="w-10 h-11 text-base rounded-md border-slate-200" />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage className="text-[11px] text-red-600 font-medium mt-1" />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-10 rounded-lg bg-slate-900 hover:bg-slate-800 active:bg-black text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify Code</span>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Did not receive the code?</span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendLoading}
              className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <RotateCw className={`w-3 h-3 ${isResendLoading ? "animate-spin" : ""}`} />
              <span>{isResendLoading ? "Sending..." : "Resend"}</span>
            </button>
          </div>

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

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="text-center p-6 text-slate-400 text-xs">Loading verification...</div>}>
      <VerifyOtp />
    </Suspense>
  );
}
