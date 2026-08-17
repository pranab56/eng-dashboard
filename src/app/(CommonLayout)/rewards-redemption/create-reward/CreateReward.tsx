/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react'
import BackButton from '@/components/buttons/BackButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import * as z from 'zod'
import { useCreateRewordMutation, useGetSingleRewordQuery, useUpdateRewordMutation } from '@/features/rewordProduct/rewordApi'
import { baseURL } from '@/utils/BaseURL'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Sparkles,
  Gift,
  Coffee,
  Package,
  Coins,
  Upload,
  CheckCircle2,
  Tag,
  QrCode,
  Truck,
  Loader2,
} from 'lucide-react'

// Form Validation Schema
const rewardsSchema = z.object({
  brand: z.string().min(1, "Brand name is required"),
  point: z.number().min(1, "Point must be at least 1"),
  productType: z.string().min(1, "Product type is required"),
  logo: z.any().optional(),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>

const CreateReward = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const rewardId = searchParams.get("id")
  const isEditMode = !!rewardId

  const [createReward, { isLoading: isCreating }] = useCreateRewordMutation()
  const [updateReward, { isLoading: isUpdating }] = useUpdateRewordMutation()
  const { data: rewardData, isFetching } = useGetSingleRewordQuery(rewardId, { skip: !isEditMode })

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors }
  } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      brand: '',
      point: 100,
      productType: 'Coffee',
    }
  })

  // Live watched point for valuation hint
  const watchedPoint = watch('point')

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Reward Item" : "Create New Reward",
      des: isEditMode ? "Modify existing reward item and valuation." : "Add a new redeemable item to the player ecosystem."
    })
  }, [setHeaders, isEditMode])

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
  }, [rewardData, reset])

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
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} reward`);
    }
  }

  if (isEditMode && isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[420px] space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Loading reward details...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header Bar */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-5 rounded-3xl border border-slate-100 shadow-xs">
        <BackButton />
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Reward Catalog
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs font-semibold text-slate-500">
              {isEditMode ? 'Editing Item' : 'New Product'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {isEditMode ? 'Update Reward Valuation' : 'Create New Reward Item'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Gift className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Basic Information</h2>
                <p className="text-xs text-slate-500">Brand title, category and points required</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>

          <div className="space-y-5">
            {/* Brand / Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Brand / Product Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Tag className="w-4 h-4" />
                </div>
                <input
                  {...register("brand")}
                  type="text"
                  placeholder="e.g. Starbucks Latte, Adidas Gym Towel..."
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    errors.brand
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/20"
                      : "border-slate-200/90 hover:border-indigo-300 focus:border-indigo-600 focus:ring-indigo-500/10 focus:bg-white"
                  }`}
                />
              </div>
              {errors.brand && (
                <p className="text-[11px] font-semibold text-rose-500 px-1">
                  {errors.brand.message}
                </p>
              )}
            </div>

            {/* Product Category Custom Cards Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Product Category <span className="text-rose-500">*</span>
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
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        field.value === "Coffee"
                          ? "bg-amber-50/60 border-amber-400/90 ring-4 ring-amber-500/10 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          field.value === "Coffee" ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          <Coffee className="w-4 h-4" />
                        </div>
                        {field.value === "Coffee" && (
                          <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-900">Coffee / Instant QR</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Instant QR Scan Code</span>
                        </p>
                      </div>
                    </button>

                    {/* Non-Coffee Option */}
                    <button
                      type="button"
                      onClick={() => field.onChange("nonCoffee")}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        field.value === "nonCoffee"
                          ? "bg-indigo-50/60 border-indigo-400/90 ring-4 ring-indigo-500/10 shadow-xs"
                          : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          field.value === "nonCoffee" ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"
                        }`}>
                          <Package className="w-4 h-4" />
                        </div>
                        {field.value === "nonCoffee" && (
                          <CheckCircle2 className="w-4.5 h-4.5 text-indigo-600" />
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-900">Physical Merchandise</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Truck className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>Delivery & Order Dispatch</span>
                        </p>
                      </div>
                    </button>
                  </div>
                )}
              />
              {errors.productType && (
                <p className="text-[11px] font-semibold text-rose-500 px-1">
                  {errors.productType.message}
                </p>
              )}
            </div>

            {/* Points Required Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Points Required (ENG Coins) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  ~ £{((watchedPoint || 0) * 0.01).toFixed(2)} Valuation
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none">
                  <Coins className="w-4 h-4" />
                </div>
                <input
                  {...register("point", { valueAsNumber: true })}
                  type="number"
                  placeholder="e.g. 500"
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50/80 border rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all ${
                    errors.point
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/20"
                      : "border-slate-200/90 hover:border-amber-300 focus:border-amber-500 focus:ring-amber-500/10 focus:bg-white"
                  }`}
                />
              </div>
              {errors.point && (
                <p className="text-[11px] font-semibold text-rose-500 px-1">
                  {errors.point.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Media Card */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl shadow-slate-200/40 text-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <Upload className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Reward Media & Graphic</h2>
                <p className="text-xs text-slate-500">High-resolution brand logo or product photo</p>
              </div>
            </div>
          </div>

          <div className="w-full">
            <ImageUploadField name="logo" label="Upload Artwork" control={control} error={errors.logo as any}>
              <ImageChildrenComponent maxSizeMB={5} />
            </ImageUploadField>
          </div>
        </section>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/rewards-redemption')}
            className="px-5 py-3 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all cursor-pointer"
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
  )
}

export default CreateReward;