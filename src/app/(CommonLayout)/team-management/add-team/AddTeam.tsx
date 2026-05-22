/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { useCreateTeamMutation, useGetSingleTeamQuery, useUpdateTeamMutation } from '@/features/teamManagement/teamApi'
import { baseURL } from '@/utils/BaseURL'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import SubmitButton from '../../../../components/buttons/SubmitButton'

// Form Validation Schema
const addTeamSchema = z.object({
  logo: z.any().optional(),
  teamName: z.string().min(1, "Team Name is required"),
  shortName: z.string().min(1, "Short Name is required"),
  teamType: z.string().min(1, "Team Type is required"),
  stadiumName: z.string().min(1, "Stadium Name is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

type AddTeamFormValues = z.infer<typeof addTeamSchema>

const teamTypeOptions = [
  { label: "Football", value: "Football" },
  { label: "Cricket", value: "Cricket" },
]


const AddTeam = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = searchParams.get("id")
  const isEditMode = !!teamId

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation()
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation()
  const { data: teamData, isFetching } = useGetSingleTeamQuery(teamId, { skip: !isEditMode })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<AddTeamFormValues>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      teamName: "",
      shortName: "",
      teamType: "Football",
      stadiumName: "",
      city: "",
      country: "",
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Team" : "Add New Team",
      des: isEditMode ? "Modify existing squad details and brand identity." : "Register a new team into the league management system."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (teamData?.data) {
      const team = teamData.data;
      reset({
        teamName: team.teamName,
        shortName: team.shortName,
        teamType: team.teamType,
        stadiumName: team.stadiumName,
        city: team.city,
        country: team.country,
        logo: team.teamLogo ? `${baseURL}${team.teamLogo}` : undefined,
      });
    }
  }, [teamData, reset])


  const onSubmit = async (data: AddTeamFormValues) => {
    try {
      const formData = new FormData();

      const jsonData = {
        teamName: data.teamName,
        shortName: data.shortName,
        teamType: data.teamType,
        stadiumName: data.stadiumName,
        city: data.city,
        country: data.country
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateTeam({ id: teamId, data: formData }).unwrap();
        if (res.success) {
          toast.success(res.message || "Team updated successfully");
          router.push("/team-management");
        }
      } else {
        const res = await createTeam(formData).unwrap();
        if (res.success) {
          toast.success(res.message || "Team created successfully");
          router.push("/team-management");
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} team`);
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading team data...</div>
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className=" py-5 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className='flex items-center justify-between'>
        <BackButton />

        <div className="">
          <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Team" : "Create Team"} />
        </div>
      </div>
      <div className='w-full flex gap-4'>
        <div className='flex-1 space-y-4'>
          {/* General Details Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">General Details</h2>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField name="teamName" type="string" title="Team Name" placeholder="e.g. Manchester Kings" register={register} error={errors.teamName} />
                <InputField name="shortName" type="string" title="Short Name" placeholder="MKFC" register={register} error={errors.shortName} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectField name="teamType" label="Team Type" control={control} error={errors.teamType} options={teamTypeOptions} />
              </div>
            </div>
          </section>

          {/* Location Details Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Location & Stadium</h2>

            <div className="space-y-8">
              <InputField name="stadiumName" title="Stadium Name" placeholder="Enter stadium name" register={register} error={errors.stadiumName} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InputField name="city" title="City" placeholder="Enter city" register={register} error={errors.city} />
                <InputField name="country" type="string" title="Country" placeholder="Enter country" register={register} error={errors.country} />
              </div>
            </div>
          </section>

          {/* Form Actions */}

        </div>

        {/* Right Side - Media */}
        <div className='basis-[30%] space-y-4'>
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Team Brand</h2>

            {/* Logo Upload */}
            <div className="w-full">
              <ImageUploadField name="logo" label="Team Logo" control={control} error={errors.logo as any}>
                <ImageChildrenComponent maxSizeMB={5} />
              </ImageUploadField>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default AddTeam;