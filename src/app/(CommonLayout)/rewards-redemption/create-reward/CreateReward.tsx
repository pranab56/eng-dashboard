/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react'
import { useHeaders } from '@/hooks/useHeaders'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import BackButton from '@/components/buttons/BackButton'

// Form Validation Schema
const rewardsSchema = z.object({
  rewardName: z.string().min(2).max(50),
  points: z.string().min(1),
  rewardType: z.string().min(1),
  logo: z.any().optional(),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>

const CreateReward = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      rewardName: '',
      points: '',
      rewardType: '',
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Create Reward",
      des: "Design a new incentive for your enterprise loyalty ecosystem."
    })
  }, [setHeaders])

  const languageSelectOptions = [
    { label: "English (US)", value: "English (US)" },
    { label: "Bengali", value: "Bengali" },
    { label: "Spanish", value: "Spanish" },
  ]


  const onSubmit = async (data: RewardsFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data)
      toast.success("Reward created successfully")
    } catch (error:any) {
      toast.error("Failed to create reward", error.message)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      {/* Application Identity Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Basic Information</h2>

        <div className="space-y-8">
          {/* App Name Input */}
          <InputField name="rewardName" title="Reward Name" placeholder="Enter reward name" register={register} error={errors.rewardName} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Language Select */}
            <SelectField name="rewardType" label="Reward Type" control={control} error={errors.rewardType} options={languageSelectOptions} />

            <InputField name="points" type="number" title="Points Required" placeholder="Enter points" register={register} error={errors.points} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
          </div>

        </div>

      </section>

      {/* Regional Preferences Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Reward Media</h2>


        {/* Logo Upload */}
        <div className="w-full">
          <ImageUploadField name="logo" label="Reward Image" control={control} error={errors.logo as any}>
            <ImageChildrenComponent maxSizeMB={5} />
          </ImageUploadField>
        </div>
      </section>

      {/* Form Actions */}
      <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
        <CancelButton onClick={reset} title="Reset" />
        <SubmitButton isSubmitting={isSubmitting} title="Save" />
      </div>
    </form>
  )
}

export default CreateReward