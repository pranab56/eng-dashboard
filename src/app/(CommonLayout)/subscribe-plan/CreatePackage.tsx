/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreatePackageMutation, useUpdatePackageMutation } from '@/features/package/packageApi'
import toast from 'react-hot-toast'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Plus, Trash2, Check, X } from 'lucide-react'

const featureItemSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  isIncluded: z.boolean(),
})

const packageSchema = z.object({
  title: z.string().min(1, "Plan name is required"),
  description: z.string().min(1, "Description is required"),
  userType: z.enum(['Player', 'Other', 'Manager', 'Club', 'Referee', 'Tournament Player', 'Trial Player', 'OTHER_CLUBS']),
  price: z.number().min(0, "Price must be at least 0"),
  duration: z.enum(['1 month', '3 months', '6 months', '1 year']),
  paymentType: z.string().min(1, "Payment type is required"),
  packageType: z.enum(['Semi Pro', 'Professional']),
  credit: z.number().min(0, "Credit must be at least 0"),
  features: z.array(featureItemSchema),
})

type PackageFormValues = z.infer<typeof packageSchema>

const userTypeOptions = [
  { label: "Regular Player", value: "Player" },
  { label: "Tournament Player", value: "Tournament Player" },
  { label: "Trial Player", value: "Trial Player" },
]

const packageTypeOptions = [
  { label: "Semi Pro", value: "Semi Pro" },
  { label: "Professional", value: "Professional" },
]

const durationOptions = [
  { label: "1 month", value: "1 month" },
  { label: "3 months", value: "3 months" },
  { label: "6 months", value: "6 months" },
  { label: "1 year", value: "1 year" },
]


const normalizeDuration = (dur?: string): '1 month' | '3 months' | '6 months' | '1 year' => {
  if (!dur) return '1 month';
  const clean = dur.trim().toLowerCase();
  if (clean === '1 year' || clean === '1year' || clean === 'yearly' || clean === '12 months' || clean === '12 month') return '1 year';
  if (clean === '6 months' || clean === '6months' || clean === '6 month' || clean === 'half-yearly') return '6 months';
  if (clean === '3 months' || clean === '3months' || clean === '3 month' || clean === 'quarterly') return '3 months';
  if (clean === '1 month' || clean === '1month' || clean === 'monthly') return '1 month';
  return '1 month';
};

interface CreatePackageProps {
  initialData?: any
  onSuccess?: () => void
}

const CreatePackage = ({ initialData, onSuccess }: CreatePackageProps) => {
  const [createPackage, { isLoading: isCreating }] = useCreatePackageMutation()
  const [updatePackage, { isLoading: isUpdating }] = useUpdatePackageMutation()

  const [newFeatureTitle, setNewFeatureTitle] = useState('')
  const [newFeatureIsIncluded, setNewFeatureIsIncluded] = useState(true)

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      title: "",
      description: "",
      userType: "Player",
      price: 0,
      duration: "1 month",
      paymentType: "Monthly",
      packageType: "Semi Pro",
      credit: 0,
      features: [],
    }
  })

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "features",
  })

  const selectedDuration = watch("duration")

  useEffect(() => {
    if (selectedDuration === "1 month") {
      setValue("paymentType", "Monthly")
    } else if (selectedDuration === "3 months") {
      setValue("paymentType", "Quarterly")
    } else if (selectedDuration === "6 months") {
      setValue("paymentType", "Half-Yearly")
    } else if (selectedDuration === "1 year") {
      setValue("paymentType", "Yearly")
    }
  }, [selectedDuration, setValue])

  useEffect(() => {
    if (initialData) {
      const formattedFeatures = Array.isArray(initialData.features)
        ? initialData.features.map((f: any) =>
          typeof f === 'string'
            ? { title: f, isIncluded: true }
            : { title: f?.title || "", isIncluded: f?.isIncluded ?? true }
        )
        : []

      const dur = normalizeDuration(initialData.duration)
      let payType = initialData.paymentType || "Monthly"
      if (payType === "One-time" || !payType) {
        if (dur === "1 month") payType = "Monthly"
        else if (dur === "3 months") payType = "Quarterly"
        else if (dur === "6 months") payType = "Half-Yearly"
        else if (dur === "1 year") payType = "Yearly"
      }

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        userType: initialData.userType || "Player",
        price: initialData.price ?? 0,
        duration: dur,
        paymentType: payType,
        packageType: initialData.packageType || "Semi Pro",
        credit: initialData.credit ?? 0,
        features: formattedFeatures,
      })
    }
  }, [initialData, reset])

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) {
      toast.error("Please enter a benefit title")
      return
    }
    appendFeature({ title: newFeatureTitle.trim(), isIncluded: newFeatureIsIncluded })
    setNewFeatureTitle('')
    setNewFeatureIsIncluded(true)
  }

  const onSubmit = async (data: PackageFormValues) => {
    try {
      if (initialData?._id) {
        await updatePackage({ id: initialData._id, data }).unwrap()
        toast.success("Package updated successfully")
      } else {
        await createPackage(data).unwrap()
        toast.success("Package created successfully")
      }
      onSuccess?.()
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save package")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
      {/* 1. Basic Plan Configuration */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Plan Overview
        </h4>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Plan Title <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              placeholder="e.g. ENG Professional Season 26/27"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
            {errors.title && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              {...register("description")}
              rows={2}
              placeholder="Brief overview of audience eligibility, member privileges, etc."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors resize-none"
            />
            {errors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Audience <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="userType"
                control={control}
                render={({ field }) => (
                  <Select 
                    key={`userType-select-${field.value || 'empty'}`}
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer">
                      <SelectValue placeholder="Select audience">
                        {userTypeOptions.find(o => o.value === field.value)?.label || field.value || "Select audience"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-md shadow-md z-50">
                      {userTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.userType && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.userType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tier Level <span className="text-rose-500">*</span>
              </label>
              <Controller
                name="packageType"
                control={control}
                render={({ field }) => (
                  <Select 
                    key={`packageType-select-${field.value || 'empty'}`}
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer">
                      <SelectValue placeholder="Select tier">
                        {packageTypeOptions.find(o => o.value === field.value)?.label || field.value || "Select tier"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-slate-200 rounded-md shadow-md z-50">
                      {packageTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.packageType && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.packageType.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pricing & Economics */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
          Pricing & Allocation
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Price (£) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                £
              </span>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full h-9 pl-6 pr-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>
            {errors.price && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Billing Duration <span className="text-rose-500">*</span>
            </label>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <Select 
                  key={`duration-select-${field.value || 'empty'}`} 
                  value={field.value || '1 month'} 
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 cursor-pointer">
                    <SelectValue placeholder="Select duration">
                      {durationOptions.find(o => o.value === field.value)?.label || field.value || "Select duration"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 rounded-md shadow-md z-50">
                    {durationOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs cursor-pointer">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.duration && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Coin Allowance <span className="text-rose-500">*</span>
            </label>
            <input
              {...register("credit", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="e.g. 5000"
              className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
            {errors.credit && (
              <p className="text-[11px] text-rose-600 mt-1">{errors.credit.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 3. Included Benefits List */}
      <div className="space-y-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Benefits & Features
          </h4>
          <span className="text-[11px] text-slate-400">
            {featureFields.length} configured
          </span>
        </div>

        {/* Add Feature Inline Control */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. Real-Time Performance Analytics"
            value={newFeatureTitle}
            onChange={(e) => setNewFeatureTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddFeature()
              }
            }}
            className="flex-1 h-8.5 px-3 text-xs bg-white border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
          />

          <label className="flex items-center gap-1.5 px-2.5 h-8.5 text-xs text-slate-700 bg-slate-50 border border-slate-300 rounded-md cursor-pointer select-none">
            <input
              type="checkbox"
              checked={newFeatureIsIncluded}
              onChange={(e) => setNewFeatureIsIncluded(e.target.checked)}
              className="rounded text-slate-900 focus:ring-slate-900 h-3.5 w-3.5"
            />
            <span>Included</span>
          </label>

          <button
            type="button"
            onClick={handleAddFeature}
            className="inline-flex items-center gap-1 h-8.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* List of Configured Features */}
        {featureFields.length > 0 ? (
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {featureFields.map((field, index) => {
              const isIncluded = watch(`features.${index}.isIncluded`)
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="shrink-0">
                      {isIncluded ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
                      )}
                    </span>
                    <input
                      {...register(`features.${index}.title` as const)}
                      className="w-full text-xs bg-transparent text-slate-900 focus:outline-none focus:bg-white px-1 py-0.5 rounded"
                    />
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        {...register(`features.${index}.isIncluded` as const)}
                        className="rounded text-slate-900 focus:ring-slate-900 h-3 w-3"
                      />
                      <span className="text-[11px]">Included</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                      title="Remove benefit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-1">
            No benefits configured yet. Enter a benefit title above and click Add.
          </p>
        )}
      </div>

      {/* Form Action Controls - Pinned Sticky Footer */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-slate-200 flex items-center justify-end gap-2.5 z-20">
        <button
          type="button"
          onClick={() => onSuccess?.()}
          className="h-8.5 px-3.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isCreating || isUpdating}
          className="h-8.5 px-4 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-md transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>{initialData ? "Save Changes" : "Create Plan"}</span>
        </button>
      </div>
    </form>
  )
}

export default CreatePackage
