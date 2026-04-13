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
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import TextareaField from '@/components/form/TextareaField'
import { closeCustomModal } from '@/components/modals/CustomModal'
import { alertTypeOptions } from '@/constants/selectData'

// Form Validation Schema
const rewardsSchema = z.object({
  notificationTitle: z.string().min(2).max(50),
  notificationDescription: z.string().min(1),
  notificationType: z.string().min(1),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>

const SendNotification = () => {
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
      notificationTitle: '',
      notificationDescription: '',
      notificationType: '',
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Create Reward",
      des: "Design a new incentive for your enterprise loyalty ecosystem."
    })
  }, [setHeaders])


  const onSubmit = async (data: RewardsFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data)
      toast.success("Reward created successfully")
      // document.getElementById("close_custom_modal")?.click()
      closeCustomModal()
    } catch (error: any) {
      toast.error("Failed to create reward", error.message)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-8">
        {/* App Name Input */}
        <InputField name="notificationTitle" title="Title" placeholder="Enter notification title ..." register={register} error={errors.notificationTitle} />
        <TextareaField name="notificationDescription" title="Description" placeholder="Type your description here ..." register={register} error={errors.notificationDescription} />
        <SelectField name="notificationType" label="Notification Type" control={control} error={errors.notificationType} options={alertTypeOptions} />

      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-5">
        <CancelButton onClick={reset} title="Reset" />
        <SubmitButton isSubmitting={isSubmitting} title="Save" />
      </div>
    </form>
  )
}

export default SendNotification