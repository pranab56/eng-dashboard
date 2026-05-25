"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// import { setCookie } from "cookies-next/client";


import { logo } from "@/assets/assets";
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
import { useLoginMutation } from "@/features/auth/authApi";
import { setAuthenticated } from '@/features/auth/authSlice';
import { Eye, EyeOff, Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { setAuthCookie } from '../../../actions/auth';

// Schema
const contactUsFormSchema = z
  .object({
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    })
  });

// Type
type ContactUsFormValues = z.infer<typeof contactUsFormSchema>;

const defaultValues: Partial<ContactUsFormValues> = {
  email: "",
  password: "",
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();


  const [login, { isLoading }] = useLoginMutation();

  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: ContactUsFormValues) {
    const payload = {
      email: data.email,
      password: data.password
    }

    try {
      const res = await login(payload).unwrap();
      toast.success(res.message);
      dispatch(setAuthenticated(res.data.accessToken));
      await setAuthCookie(res.data.accessToken);
      router.push('/');
    } catch (error: unknown) {
      console.log(error);
      toast.error(getErrorMessage(error, "Login failed"))
    }
  }


  return (
    <>

      <div className="flex items-center justify-center py-8 bg-gray-800">
        {logo && <Image src={logo} width={200} height={30} alt="dashboard" className="w-[200px] h-[68px]" />}
      </div>
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

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 text-lg">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      variant="borderblack"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      className="pr-10"
                      {...field}
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-600 hover:text-gray-700 z-10"
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Submit Button */}
          <Button variant="blackBtn" type="submit" size="xl" className="w-full">
            {isLoading && <Loader className='w-5 h-5 animate-spin' />} Sign In
          </Button>

          <div className="relative -top-2 flex justify-end items-center">
            <Link href="/auth/forgot-password" className="text-gray-700 hover:text-gray-500 font-semibold">
              Forgot Password
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Login;
