/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect } from 'react'
import { useHeaders } from '@/hooks/useHeaders'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import InputField from '@/components/form/InputField'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import CheckboxGroup from '@/components/form/CheckboxGroup'

// Form Validation Schema
const playerSubSchema = z.object({
  title: z.string().min(2).max(50),
  price: z.string().min(2).max(50),
  features: z.array(z.string()),
});

type PlayerSubFormValues = z.infer<typeof playerSubSchema>

const CreatePlayerSub = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PlayerSubFormValues>({
    resolver: zodResolver(playerSubSchema),
    defaultValues: {
      title: '',
      price: '',
      features: [],
    }
  })

  useEffect(() => {
    setHeaders({
      title: "CreatePlayerSub",
      des: "Manage your application industrial identity and regional preferences."
    })
  }, [setHeaders])

  const languageSelectOptions = [
    { label: "ENG Coins Program", value: "ENG Coins Program" },
    { label: "Player Stats", value: "Player Stats" },
    { label: "ENG Coins with a red cross", value: "ENG Coins with a red cross" },
  ]


  const onSubmit = async (data: PlayerSubFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data)
      toast.success("CreatePlayerSub updated successfully")
    } catch (error: any) {
      toast.error("Failed to update settings", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Application Identity Card */}
      <InputField name="title" title="Title" placeholder="Enter title" register={register} error={errors.title} />
      <InputField name="price" type="number" title="Price" placeholder="Enter price" register={register} error={errors.price} />
      <CheckboxGroup name="features" label="Features" control={control} options={languageSelectOptions} />

      {/* Form Actions */}
      <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
        <CancelButton onClick={reset} title="Cancel" />
        <SubmitButton isSubmitting={isSubmitting} title="Save" />
      </div>
    </form>
  )
}

export default CreatePlayerSub