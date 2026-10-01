/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import BackButton from "@/components/buttons/BackButton";
import SubmitButton from "@/components/buttons/SubmitButton";
import ImageUploadField, {
  ImageChildrenComponent,
} from "@/components/form/ImageUploadField";
import { useHeaders } from "@/hooks/useHeaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import {
  useCreateRewordMutation,
  useGetSingleRewordQuery,
  useUpdateRewordMutation,
} from "@/features/rewordProduct/rewordApi";
import { baseURL } from "@/utils/BaseURL";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Coffee,
  Package,
  QrCode,
  Truck,
  Loader2,
} from "lucide-react";

// Form Validation Schema
const rewardsSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  point: z.number().min(1, "Points must be at least 1"),
  productType: z.string().min(1, "Product type is required"),
  logo: z.any().optional(),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>;

const CreateReward = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rewardId = searchParams.get("id");
  const isEditMode = !!rewardId;

  const [createReward, { isLoading: isCreating }] = useCreateRewordMutation();
  const [updateReward, { isLoading: isUpdating }] = useUpdateRewordMutation();
  const { data: rewardData, isFetching } = useGetSingleRewordQuery(rewardId, {
    skip: !isEditMode,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      brand: "",
      point: 100,
      productType: "Coffee",
    },
  });

  const watchedPoint = watch("point");

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Reward Item" : "Create New Reward",
      des: isEditMode
        ? "Modify existing reward item and coin valuation."
        : "Add a new redeemable item to the player ecosystem.",
    });
  }, [setHeaders, isEditMode]);

  useEffect(() => {
    if (rewardData?.data) {
      const reward = rewardData.data;
      const initialLogo = reward.image ? `${baseURL}${reward.image}` : undefined;
      reset({
        brand: reward.brand,
        point: reward.point,
        productType: reward.productType,
        logo: initialLogo,
      });
    }
  }, [rewardData, reset]);

  const onSubmit = async (data: RewardsFormValues) => {
    try {
      const formData = new FormData();

      const jsonData = {
        brand: data.brand,
        point: data.point,
        productType: data.productType,
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateReward({ id: rewardId, data: formData }).unwrap();
        if (res.success) {
          toast.success(res.message || "Reward updated successfully");
          router.push("/rewards-redemption");
        }
      } else {
        const res = await createReward(formData).unwrap();
        if (res.success) {
          toast.success(res.message || "Reward created successfully");
          router.push("/rewards-redemption");
        }
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || `Failed to ${isEditMode ? "update" : "create"} reward`
      );
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] space-y-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-600" />
        <p className="text-xs font-medium text-slate-500">Loading reward details...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-4">
      {/* Header Bar */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200">
        <BackButton />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
              {isEditMode ? "Edit Item" : "New Item"}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            {isEditMode ? "Update Reward Valuation" : "Create New Reward Item"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Basic Information Card */}
        <section className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Basic Information
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Specify brand title, fulfillment method, and point valuation.
            </p>
          </div>

          <div className="space-y-4">
            {/* Brand / Product Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 block">
                Brand / Item Title <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("brand")}
                type="text"
                placeholder="e.g. Starbucks Latte, ENG Socks, Adidas Gym Towel..."
                className={`w-full h-9 px-3 bg-white border rounded-md text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors ${
                  errors.brand ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {errors.brand && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.brand.message}
                </p>
              )}
            </div>

            {/* Product Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Product Category & Fulfillment <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="productType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Coffee Option */}
                    <button
                      type="button"
                      onClick={() => field.onChange("Coffee")}
                      className={`p-3.5 rounded-md border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                        field.value === "Coffee"
                          ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded border border-amber-200 bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        <Coffee className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">
                          Coffee / Instant QR
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-700 shrink-0" />
                          <span>Scannable in-app QR code</span>
                        </p>
                      </div>
                    </button>

                    {/* Non-Coffee Option */}
                    <button
                      type="button"
                      onClick={() => field.onChange("nonCoffee")}
                      className={`p-3.5 rounded-md border text-left transition-colors cursor-pointer flex items-start gap-3 ${
                        field.value === "nonCoffee"
                          ? "bg-slate-50 border-slate-900 ring-1 ring-slate-900"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="w-8 h-8 rounded border border-slate-200 bg-slate-50 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Package className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">
                          Physical Merchandise
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-500 shrink-0" />
                          <span>Order dispatch and fulfillment</span>
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              />
              {errors.productType && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.productType.message}
                </p>
              )}
            </div>

            {/* Points Required Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 block">
                  Points Required (ENG Coins) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-medium text-slate-500 tabular-nums">
                  Approx. £{((watchedPoint || 0) * 0.01).toFixed(2)} valuation
                </span>
              </div>
              <input
                {...register("point", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 1500"
                min="1"
                className={`w-full h-9 px-3 bg-white border rounded-md text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors tabular-nums ${
                  errors.point ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {errors.point && (
                <p className="text-[11px] font-medium text-rose-500">
                  {errors.point.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Media & Artwork Card */}
        <section className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 space-y-4 shadow-2xs">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Reward Media & Graphic
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Upload high-resolution brand logo or product imagery.
            </p>
          </div>

          <div className="w-full">
            <ImageUploadField
              name="logo"
              label="Upload Artwork"
              control={control}
              error={errors.logo as any}
            >
              <ImageChildrenComponent maxSizeMB={5} />
            </ImageUploadField>
          </div>
        </section>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => router.push("/rewards-redemption")}
            className="h-9 px-4 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <SubmitButton
            isSubmitting={isCreating || isUpdating}
            title={isEditMode ? "Save Changes" : "Publish Reward"}
          />
        </div>
      </form>
    </div>
  );
};

export default CreateReward;
