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
import TextareaField from '@/components/form/TextareaField'
import { newsTypeOptions, publishStatusOptions } from '@/constants/selectData'

// Form Validation Schema
const newsSchema = z.object({
  newsTitle: z.string().min(2).max(50),
  description: z.string().min(1),
  category: z.string().min(1),
  logo: z.any().optional(),
  pubStatus: z.string().min(1),
  pubDate: z.string().min(1),
  pubTime: z.string().min(1),
});

type newsFormValues = z.infer<typeof newsSchema>

const CreateNews = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<newsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      newsTitle: '',
      description: '',
      category: '',
      logo: '',
      pubStatus: '',
      pubDate: '',
      pubTime: '',
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Create Reward",
      des: "Design a new incentive for your enterprise loyalty ecosystem."
    })
  }, [setHeaders])

  const onSubmit = async (data: newsFormValues) => {
    console.log("submitting")
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data)
      toast.success("Reward created successfully")
    } catch (error: any) {
      toast.error("Failed to create reward", error.message)
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-6xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='basis-[70%] space-y-8'>
          {/* Application Identity Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Basic Information</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <InputField name="newsTitle" title="News Title" placeholder="Enter a compelling headline" register={register} error={errors.newsTitle} />
              <SelectField name="category" label="Category" control={control} error={errors.category} options={newsTypeOptions} />

              <TextareaField name="description" title="Description" placeholder="Brief summary of the broadcast content..." register={register} error={errors.description} />

            </div>

          </section>

          {/* Regional Preferences Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Thumbnail & Media</h2>


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
        </div>
        <div className='basis-[30%]'>

          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Scheduling</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <SelectField name="pubStatus" label="Publishing Status" control={control} error={errors.pubStatus} options={publishStatusOptions} />
              <InputField name="pubDate" type='date' title="Publish Date" placeholder="Enter a compelling headline" register={register} error={errors.pubDate} />
              <InputField name="pubTime" type='time' title="Publish Time" placeholder="Enter a compelling headline" register={register} error={errors.pubTime} />

            </div>

          </section>
        </div>

      </div>
    </form>
  )
}

export default CreateNews