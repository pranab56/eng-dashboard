"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader } from "lucide-react";
import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import toast from 'react-hot-toast';
import { useResendOTPMutation, useVerifyEmailMutation } from '../../../../features/auth/authApi';




// Schema
const contactUsFormSchema = z
  .object({
    verifyOtp: z.string(),
  });

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  verifyOtp: "",
};

const VerifyOtp = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const router = useRouter();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [reSendOTP, { isLoading: isResendLoading }] = useResendOTPMutation();


  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ContactUsFormValues) {
    try {
      const res = await verifyEmail({ email: email, oneTimeCode: data.verifyOtp }).unwrap();
      if (res.success) {
        toast.success(res.message);
        router.push(`/auth/reset-password?token=${res.data}`)
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Verification error:", err?.message);
      toast.error(err?.message || "Verification failed");
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
    <>
      <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-800 pb-12">Verify OTP</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Email */}
          <FormField
            control={form.control}
            name="verifyOtp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup className="">
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button variant="blackBtn" type="submit" size="xl" className="w-full max-w-[450px]">
            {isLoading && <Loader className='w-5 h-5 animate-spin mr-2' />} Submit
          </Button>

          <div className="flex justify-center text-sm items-center gap-1">
            <span className="text-gray-600">Didn't receive the code?</span>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isResendLoading}
              className="text-gray-700 hover:text-gray-900 font-bold disabled:opacity-50"
            >
              {isResendLoading ? "Resending..." : "Resend OTP"}
            </button>
          </div>

          <div className="relative -top-2 flex justify-center text-sm items-center">
            <Link href="/auth/login" className="text-gray-700 hover:text-gray-500 font-semibold">
              Back to Login
            </Link>
          </div>

        </form>
      </Form>
    </>
  );
};

export default VerifyOtp;
