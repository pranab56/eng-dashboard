/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreatePackageMutation, useUpdatePackageMutation } from '@/features/package/packageApi'
import toast from 'react-hot-toast'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import SubmitButton from '@/components/buttons/SubmitButton'

const packageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  userType: z.enum(['Player', 'Manager', 'Club', 'Referee', 'Other']),
  price: z.number().min(0, "Price must be at least 0"),
  duration: z.enum(['1 month', '3 months', '6 months', '1 year']),
  paymentType: z.string().min(1, "Payment type is required"),
  packageType: z.enum(['Semi Pro', 'Professional', 'Other']),
  credit: z.number().min(0, "Credit must be at least 0"),
  loginLimit: z.number().min(1, "Login limit must be at least 1"),
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

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PackageFormValues>({
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
      loginLimit: 1,
    }
  })

  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title || "",
        description: initialData.description || "",
        userType: initialData.userType || "Player",
        price: initialData.price || 0,
        duration: initialData.duration || "1 month",
        paymentType: initialData.paymentType || "Monthly",
        packageType: initialData.packageType || "Semi Pro",
        credit: initialData.credit || 0,
        loginLimit: initialData.loginLimit || 1,
      })
    }
  }, [initialData, reset])

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <InputField name="title" title="Plan Title" placeholder="e.g. Premium Plan" register={register} error={errors.title} />
      <TextareaField name="description" title="Description" placeholder="Best subscription package" register={register} error={errors.description} />

      <div className="grid grid-cols-3 gap-4">
        <SelectField name="userType" label="User Type" control={control} options={userTypeOptions} error={errors.userType} />
        <SelectField name="paymentType" label="Payment Type" control={control} options={paymentTypeOptions} error={errors.paymentType} />
        <SelectField name="packageType" label="Package Type" control={control} options={packageTypeOptions} error={errors.packageType} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField name="price" title="Price" type="number" register={register} error={errors.price} registerOptions={{ valueAsNumber: true }} />
        <SelectField name="duration" label="Duration" control={control} options={durationOptions} error={errors.duration} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InputField name="credit" title="Eng Coins" type="number" register={register} error={errors.credit} registerOptions={{ valueAsNumber: true }} />
        <InputField name="loginLimit" title="Login Limit" type="number" register={register} error={errors.loginLimit} registerOptions={{ valueAsNumber: true }} />
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton title={initialData ? "Update Package" : "Create Package"} isSubmitting={isCreating || isUpdating} />
      </div>
    </form>
  )
}

export default CreatePackage
