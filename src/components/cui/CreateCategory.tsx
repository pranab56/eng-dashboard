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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

// ✅ Zod Schema
const createIndustrySchema = z.object({
  name: z.string().min(1, "Industry name is required"),
  image: z
    .any()
    .refine(
      (file) => file instanceof File && file.type.startsWith("image/"),
      "Please upload a valid image file"
    )
    .optional(),
});

// ✅ Type
type CreateIndustryValues = z.infer<typeof createIndustrySchema>;

const defaultValues: Partial<CreateIndustryValues> = {
  name: "",
};

const CreateCategory = () => {
  const form = useForm<CreateIndustryValues>({
    resolver: zodResolver(createIndustrySchema),
    defaultValues,
    mode: "onChange",
  });

  // ✅ Submit Handler
  async function onSubmit(data: CreateIndustryValues) {
    const payload = {
      name: data.name,
      image: data.image
    }
    console.log("Submitted Data:", payload);
    toast.success("Industry created successfully");
  }

  return (
    <div className="w-full max-w-[1200px] p-4 rounded-lg shadow-md bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter Category Name"
                      className="bg-gray-200 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image */}
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                        id="profileImgCtrl"
                        type="file"
                        accept="image/*"
                        className="h-12 py-2"
                        onChange={e => {
                          field.onChange(e.target.files?.[0]);
                        }}
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="block w-full max-w-40 mx-auto text-base md:text-lg py-2 h-12 bg-[#836AB1]"
            >
              {form.formState.isSubmitting ? "Submitting..." : "Add Category"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateCategory;
