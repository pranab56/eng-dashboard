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
import { Plus, Trash2, Check, X } from 'lucide-react'

const featureItemSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  isIncluded: z.boolean(),
})

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userType: z.enum(['Player', 'Manager', 'Club', 'Referee', 'Other']),
  price: z.number().min(0, "Price must be at least 0"),
  duration: z.enum(['1 month', '3 months', '6 months', '1 year']),
  paymentType: z.string().min(1, "Payment type is required"),
  packageType: z.enum(['Semi Pro', 'Professional', 'Other']),
  credit: z.number().min(0, "Credit must be at least 0"),
  features: z.array(featureItemSchema),
})

type PackageFormValues = z.infer<typeof packageSchema>

const userTypeOptions = [
  { label: "Player", value: "Player" },
  { label: "Manager", value: "Manager" },
  { label: "Club", value: "Club" },
  { label: "Referee", value: "Referee" },
  { label: "Other", value: "Other" },
]

const paymentTypeOptions = [
  { label: "Monthly", value: "Monthly" },
  { label: "Quarterly", value: "Quarterly" },
  { label: "Yearly", value: "Yearly" },
  { label: "One-time", value: "One-time" },
]

const packageTypeOptions = [
  { label: "Semi Pro", value: "Semi Pro" },
  { label: "Professional", value: "Professional" },
  { label: "Other", value: "Other" },
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

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm<PackageFormValues>({
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

  useEffect(() => {
    if (initialData) {
      const formattedFeatures = Array.isArray(initialData.features)
        ? initialData.features.map((f: any) =>
          typeof f === 'string'
            ? { title: f, isIncluded: true }
            : { title: f?.title || "", isIncluded: f?.isIncluded ?? true }
        )
        : []

      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        userType: initialData.userType || "Player",
        price: initialData.price || 0,
        duration: initialData.duration || "1 month",
        paymentType: initialData.paymentType || "Monthly",
        packageType: initialData.packageType || "Semi Pro",
        credit: initialData.credit || 0,
        features: formattedFeatures,
      })
    }
  }, [initialData, reset])

  const handleAddFeature = () => {
    if (!newFeatureTitle.trim()) {
      toast.error("Please enter a feature name")
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
      toast.error(error?.data?.message || "Something went wrong")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2 pb-0">
      <InputField name="title" title="Plan Title" placeholder="e.g. Premium Plan" register={register} error={errors.title} />
      <TextareaField name="description" title="Description" placeholder="Best subscription package" register={register} error={errors.description} />

      <div className="grid grid-cols-3 gap-4">
        <SelectField name="userType" label="User Type" control={control} options={userTypeOptions} error={errors.userType} />
        <SelectField name="paymentType" label="Payment Type" control={control} options={paymentTypeOptions} error={errors.paymentType} />
        <SelectField name="packageType" label="Package Type" control={control} options={packageTypeOptions} error={errors.packageType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField name="price" title="Price (£)" type="number" register={register} error={errors.price} registerOptions={{ valueAsNumber: true }} />
        <SelectField name="duration" label="Duration" control={control} options={durationOptions} error={errors.duration} />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <InputField name="credit" title="Eng Coins" type="number" register={register} error={errors.credit} registerOptions={{ valueAsNumber: true }} />
      </div>

      {/* Dynamic Features Section after loginLimit */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <label className="block text-sm font-semibold text-gray-700">
          Package Features
        </label>

        {/* Add Feature Form Controls */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Enter feature title (e.g. Unlimited Match Entries)"
            value={newFeatureTitle}
            onChange={(e) => setNewFeatureTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddFeature()
              }
            }}
            className="flex-1 px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 px-3 py-3.5 rounded-lg hover:bg-gray-100 transition-colors select-none">
            <input
              type="checkbox"
              checked={newFeatureIsIncluded}
              onChange={(e) => setNewFeatureIsIncluded(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span>Included</span>
          </label>
          <button
            type="button"
            onClick={handleAddFeature}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {/* Feature list display */}
        {featureFields.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {featureFields.map((field, index) => {
              const isIncluded = watch(`features.${index}.isIncluded`)
              return (
                <div
                  key={field.id}
                  className="flex items-center justify-between gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200 group hover:border-blue-200 transition-all"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className={`p-1 rounded-full text-xs ${isIncluded
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                        }`}
                    >
                      {isIncluded ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <input
                      {...register(`features.${index}.title` as const)}
                      className="w-full text-sm bg-transparent font-medium text-gray-800 focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded focus:ring-1 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 cursor-pointer text-xs text-gray-500 hover:text-gray-700 select-none">
                      <input
                        type="checkbox"
                        {...register(`features.${index}.isIncluded` as const)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span className="text-[11px] font-medium">Included</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No features added yet. Type a feature name above and click Add.</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton title={initialData ? "Update Package" : "Create Package"} isSubmitting={isCreating || isUpdating} />
      </div>
    </form>
  )
}

export default CreatePackage
