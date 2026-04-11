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

// Form Validation Schema
const settingsSchema = z.object({
  appName: z.string().min(2).max(50),
  timezone: z.string().min(1),
  language: z.string().min(1),
  logo: z.any().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>

const Settings = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      appName: '',
      timezone: "UTC",
      language: '',
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Settings",
      des: "Manage your application industrial identity and regional preferences."
    })
  }, [setHeaders])

  const languageSelectOptions = [
    { label: "English (US)", value: "English (US)" },
    { label: "Bengali", value: "Bengali" },
    { label: "Spanish", value: "Spanish" },
  ]

  const timezoneSelectOptions = [
    { label: "UTC (Coordinated Universal Time)", value: "UTC" },
    { label: "EST (Eastern Standard Time)", value: "EST" },
    { label: "PST (Pacific Standard Time)", value: "PST" },
  ]


  const onSubmit = async (data: SettingsFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data)
      toast.success("Settings updated successfully")
    } catch (error:any) {
      toast.error("Failed to update settings", error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Application Identity Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Application Identity</h2>

        <div className="space-y-8">
          {/* App Name Input */}
          <InputField name="appName" title="App Name" placeholder="Enter app name" register={register} error={errors.appName} />

          {/* Logo Upload */}
          <div className="w-full">
            {/* <ImageUploadField name="logo" label="Logo Upload" control={control} error={errors.logo as any} children={<ImageChildrenComponent maxSizeMB={5} />} /> */}
            <ImageUploadField name="logo" label="Logo Upload" control={control} error={errors.logo as any}>
              <ImageChildrenComponent maxSizeMB={5} />
            </ImageUploadField>
          </div>
        </div>

      </section>

      {/* Regional Preferences Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Regional Preferences</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Timezone Select */}
          <SelectField name="timezone" label="Timezone" control={control} error={errors.timezone} options={timezoneSelectOptions} />

          {/* Language Select */}
          <SelectField name="language" label="Language" control={control} error={errors.language} options={languageSelectOptions} />
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

export default Settings