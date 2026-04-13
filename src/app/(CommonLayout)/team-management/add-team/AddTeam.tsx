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
const addTeamSchema = z.object({
  logo: z.any().optional(),
  teamName: z.string().min(2).max(50),
  shortName: z.string().min(2).max(50),
  season: z.string().min(2).max(50),
  teamType: z.string().min(2).max(50),
  stadiumName: z.string().min(2).max(50),
  city: z.string().min(2).max(50),
  country: z.string().min(2).max(50),
  managerName: z.string().min(2).max(50),
  managerRole: z.string().min(2).max(50),
});

type AddTeamFormValues = z.infer<typeof addTeamSchema>

const AddTeam = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AddTeamFormValues>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      teamName: "",
      shortName: "",
      season: "",
      teamType: "",
      stadiumName: "",
      city: "",
      country: "",
      managerName: "",
      managerRole: "",
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


  const onSubmit = async (data: AddTeamFormValues) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='flex-1 space-y-4'>
          {/* Application Identity Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">General Details</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Select */}

                <InputField name="teamName" type="string" title="Team Name" placeholder="e.g. Manchester Kings" register={register} error={errors.teamName} />

                <InputField name="shortName" type="string" title="Short Name" placeholder="MKFC" register={register} error={errors.shortName} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
              </div>
              {/* App Name Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Select */}
                <SelectField name="season" label="Season" control={control} error={errors.season} options={languageSelectOptions} />

                <SelectField name="teamType" label="Team Type" control={control} error={errors.teamType} options={languageSelectOptions} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
              </div>
            </div>
          </section>

          {/* Application Identity Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Location</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <SelectField name="stadiumName" label="Stadium Name" control={control} error={errors.stadiumName} options={languageSelectOptions} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Select */}
                <SelectField name="city" label="City" control={control} error={errors.city} options={languageSelectOptions} />

                <InputField name="country" type="string" title="Country" placeholder="Enter country" register={register} error={errors.country} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8"></div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
            <CancelButton onClick={reset} title="Reset" />
            <SubmitButton isSubmitting={isSubmitting} title="Save" />
          </div>
        </div>

        {/* Right Side */}
        <div className='basis-[30%] space-y-4'>
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
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">General Details</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <div className="grid grid-cols-1 gap-4">
                {/* Language Select */}
                <SelectField name="managerName" label="Manager Name" control={control} error={errors.managerName} options={languageSelectOptions} />

                <SelectField name="managerRole" label="Role" control={control} error={errors.managerRole} options={languageSelectOptions} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default AddTeam