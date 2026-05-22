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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';
import { useForgotEmailMutation } from '../../../../features/auth/authApi';

// Schema
const contactUsFormSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    })
  });

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  email: "",
};

const ForgotPassword = () => {
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotEmailMutation();

  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ContactUsFormValues) {
    try {
      const res = await forgotPassword({ email: data.email }).unwrap();
      if (res.success) {
        toast.success(res.message);
        router.push(`/auth/verify-otp?email=${data.email}`)
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Reset error:", err?.message);
      toast.error(err?.message || "Something went wrong");
    }


  }


  return (
    <div>
      <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-gray-700 pb-12">Forgot Password</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 text-lg">Email</FormLabel>
                <FormControl>
                  <Input variant="borderblack" placeholder="Enter email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button variant="blackBtn" type="submit" size="xl" className="w-full">
            {isLoading && <Loader className='w-5 h-5 animate-spin' />} Send Reset Code
          </Button>

          <div className="relative -top-2 flex justify-center text-sm items-center">
            <Link href="/auth/login" className="text-gray-700 hover:text-gray-500 font-semibold">
              Back to Login
            </Link>
          </div>

        </form>
      </Form>
    </div>
  );
};

export default ForgotPassword;
