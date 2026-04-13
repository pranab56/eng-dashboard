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
import { useRouter } from "next/navigation";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

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
  const router = useRouter();

  const form = useForm<ContactUsFormValues>({
    resolver: zodResolver(contactUsFormSchema),
    defaultValues,
    mode: "onChange",
  });

  function onSubmit(data: ContactUsFormValues) {
    const payload = {
      otp: data.verifyOtp
    }
    console.log("Submitted Data:", payload);
    toast.success("OTP verified successfully!");
    router.push("/reset-password");
  }


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
            Submit
          </Button>

        </form>
      </Form>
    </>
  );
};

export default VerifyOtp;
