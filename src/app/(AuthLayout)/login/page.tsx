"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner"
// import { setCookie } from "cookies-next/client";

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
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { logo } from "@/assets/assets";

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
    console.log("Submitted Data:", payload);
    toast.success("Login successful!");
    router.push("/");
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
            Sign In
          </Button>

          <div className="relative -top-2 flex justify-end items-center">
            <Link href="/forgot-password" className="text-gray-700 hover:text-gray-200 font-semibold">
              Forgot Password
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
};

export default Login;
