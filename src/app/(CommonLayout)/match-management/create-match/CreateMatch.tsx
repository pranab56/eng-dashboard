/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useEffect, useState } from 'react'
import { useHeaders } from '@/hooks/useHeaders'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import BackButton from '@/components/buttons/BackButton'
import { TeamCard } from './MatchupSelector'
import { durationOptions, languageSelectOptions, seasonOptions, statusOptions } from '@/constants/selectData'

// Form Validation Schema
const createMatchSchema = z.object({
  venueName: z.string(),
  season: z.string(),
  status: z.string(),
  duration: z.string(),
  date: z.string(),
  time: z.string(),
  // team1: z.string(),
  // team2: z.string(),
});

type CreateMatchFormValues = z.infer<typeof createMatchSchema>

export interface Team {
  value: string;
  name: string;
  logo: string;
}
const teams: Team[] = [
  { value: '1', name: 'TITANS FC', logo: 'https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562641/ENG/team_a_eqfrsy.png' },
  { value: '2', name: 'PHOENIX UTDS', logo: 'https://res.cloudinary.com/dbq7y6byo/image/upload/v1775562640/ENG/team_b_yiavwk.png' },
];


const CreateMatch = () => {

  const [homeTeam, setHomeTeam] = useState<Team>(teams[0]);
  const [awayTeam, setAwayTeam] = useState<Team>(teams[1]);
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      venueName: "",
      season: "",
      status: "",
      duration: "",
      date: "",
      time: "",
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Create Reward",
      des: "Design a new incentive for your enterprise loyalty ecosystem."
    })
  }, [setHeaders])


  const onSubmit = async (data: CreateMatchFormValues) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Form Data:', data, homeTeam, awayTeam)
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Location</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <SelectField name="venueName" label="Venue Name" control={control} error={errors.venueName} options={languageSelectOptions} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Language Select */}
                <SelectField name="season" label="Season" control={control} error={errors.season} options={seasonOptions} />
                <SelectField name="status" label="Status" control={control} error={errors.status} options={statusOptions} />
              </div>
            </div>
          </section>
          {/* Application Identity Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Match Details</h2>
            <div className="flex items-center justify-center gap-8 p-8 bg-white rounded-2xl max-w-4xl mx-auto">

              {/* Home Team Card */}
              <div>
                <TeamCard
                  teams={teams}
                  label="TEAM A (HOME)"
                  selectedTeam={homeTeam}
                  onSelect={setHomeTeam}
                />
              </div>

              {/* VS Badge */}
              <div className="z-10 -my-4 md:my-0 md:-mx-6">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                  VS
                </div>
              </div>

              {/* Away Team Card */}
              <div>
                <TeamCard
                  teams={teams}
                  label="TEAM B (AWAY)"
                  selectedTeam={awayTeam}
                  onSelect={setAwayTeam}
                />
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
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">General Details</h2>

            <div className="space-y-8">
              {/* App Name Input */}
              <div className="grid grid-cols-1 gap-4">
                {/* Language Select */}

                <InputField name="date" type='date' title="Match Date" register={register} error={errors.date} />
                <InputField name="time" type='time' title="Kick-off Time" register={register} error={errors.time} />
                <SelectField name="duration" label="Duration" control={control} error={errors.duration} options={durationOptions} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default CreateMatch