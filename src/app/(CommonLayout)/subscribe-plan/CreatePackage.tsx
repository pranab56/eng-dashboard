/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreatePackageMutation, useUpdatePackageMutation } from '@/features/package/packageApi'
import toast from 'react-hot-toast'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import SubmitButton from '@/components/buttons/SubmitButton'
import { Plus, Trash2, Check, X, Info, Sparkles, Shield, Coins } from 'lucide-react'

const featureItemSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  isIncluded: z.boolean(),
})

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
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

const paymentTypeOptions = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Half-Yearly", value: "Half-Yearly" },
  { label: "Yearly", value: "Yearly" },
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

  // Auto-sync paymentType based on duration to prevent user confusion
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

      const dur = initialData.duration || "1 month"
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
        price: initialData.price || 0,
        duration: dur,
        paymentType: payType,
        packageType: initialData.packageType || "Semi Pro",
        credit: initialData.credit || 0,
        features: formattedFeatures,
      })
    }
  }, [initialData, reset])

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) {
      toast.error("Please enter a benefit or feature description")
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-1 pb-1">
      {/* Section 1: Basic Plan Information */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5 text-slate-500" />
          <span>General Configuration</span>
        </div>

        <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
          <InputField 
            name="title" 
            title="Plan Name" 
            placeholder="e.g. ENG Professional Season 26/27" 
            register={register} 
            error={errors.title} 
          />

          <TextareaField 
            name="description" 
            title="Plan Description" 
            placeholder="Brief overview of who this membership package is designed for..." 
            register={register} 
            error={errors.description} 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField 
              name="userType" 
              label="Target Audience" 
              control={control} 
              options={userTypeOptions} 
              error={errors.userType} 
            />
            <SelectField 
              name="packageType" 
              label="Tier Level" 
              control={control} 
              options={packageTypeOptions} 
              error={errors.packageType} 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Pricing & Coins Economy */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Coins className="w-3.5 h-3.5 text-slate-500" />
          <span>Billing & Coins Allocation</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80">
          <InputField 
            name="price" 
            title="Subscription Price (£)" 
            type="number" 
            register={register} 
            error={errors.price} 
            registerOptions={{ valueAsNumber: true }} 
          />
          <SelectField 
            name="duration" 
            label="Billing Interval" 
            control={control} 
            options={durationOptions} 
            error={errors.duration} 
          />
          <SelectField 
            name="paymentType" 
            label="Cycle (Auto-Synced)" 
            control={control} 
            options={paymentTypeOptions} 
            error={errors.paymentType} 
            disabled={true} 
          />

          <div className="sm:col-span-3">
            <InputField 
              name="credit" 
              title="ENG Coins Granted Upon Subscription" 
              type="number" 
              register={register} 
              error={errors.credit} 
              registerOptions={{ valueAsNumber: true }} 
            />
          </div>
        </div>
      </div>

      {/* Section 3: Feature Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            <span>Benefits & Feature List</span>
          </div>
          <span className="text-[11px] font-normal text-slate-500">
            {featureFields.length} features configured
          </span>
        </div>

        <div className="bg-slate-50/50 p-3.5 rounded-lg border border-slate-200/80 space-y-3">
          {/* Add New Feature Row */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. Real-Time Market Value Rating"
              value={newFeatureTitle}
              onChange={(e) => setNewFeatureTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddFeature()
                }
              }}
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg placeholder:text-slate-400 text-slate-900 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
            
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors select-none">
              <input
                type="checkbox"
                checked={newFeatureIsIncluded}
                onChange={(e) => setNewFeatureIsIncluded(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              <span>Included</span>
            </label>

            <button
              type="button"
              onClick={handleAddFeature}
              className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* List of Features */}
          {featureFields.length > 0 ? (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {featureFields.map((field, index) => {
                const isIncluded = watch(`features.${index}.isIncluded`)
                return (
                  <div
                    key={field.id}
                    className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span
                        className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                          isIncluded
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isIncluded ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : (
                          <X className="w-2.5 h-2.5 stroke-[2.5]" />
                        )}
                      </span>
                      <input
                        {...register(`features.${index}.title` as const)}
                        className="w-full text-xs bg-transparent font-medium text-slate-800 focus:outline-none focus:bg-slate-50 px-1 py-0.5 rounded"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="flex items-center gap-1 cursor-pointer text-xs text-slate-600 hover:text-slate-900 select-none">
                        <input
                          type="checkbox"
                          {...register(`features.${index}.isIncluded` as const)}
                          className="rounded text-blue-600 focus:ring-blue-500 h-3 w-3"
                        />
                        <span className="text-[11px]">Included</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove feature"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-slate-400">
              No benefits added yet. Type a benefit above and press Add.
            </div>
          )}
        </div>
      </div>

      {/* Form Action Controls */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <SubmitButton 
          title={initialData ? "Save Changes" : "Create Plan"} 
          isSubmitting={isCreating || isUpdating} 
        />
      </div>
    </form>
  )
}

export default CreatePackage
