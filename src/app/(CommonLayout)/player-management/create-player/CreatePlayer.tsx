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
import BackButton from '@/components/buttons/BackButton'

// Form Validation Schema
const playerSchema = z.object({
  playerName: z.string().min(2).max(50),
  position: z.string().min(1),
  club: z.string().min(1),
  goals: z.string().min(1),
  assists: z.string().min(1),
  shots: z.string().min(1),
  shotOnTarget: z.string().min(1),
  dribbleCompleted: z.string().min(1),
  tackles: z.string().min(1),
  interceptions: z.string().min(1),
  clearances: z.string().min(1),
  blocks: z.string().min(1),
  fouls: z.string().min(1),
});

type PlayerFormValues = z.infer<typeof playerSchema>

const CreatePlayer = () => {
  const { setHeaders } = useHeaders()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      playerName: '',
      position: '',
      club: '',
      goals: '',
      assists: '',
      shots: '',
      shotOnTarget: '',
      dribbleCompleted: '',
      tackles: '',
      interceptions: '',
      clearances: '',
      blocks: '',
      fouls: '',
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Create Reward",
      des: "Design a new incentive for your enterprise loyalty ecosystem."
    })
  }, [setHeaders])


  const onSubmit = async (data: PlayerFormValues) => {
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
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      {/* Application Identity Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Player Information</h2>

        <div className="space-y-8">
          {/* App Name Input */}
          <InputField name="playerName" title="Name" placeholder="Enter reward name" register={register} error={errors.playerName} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Language Select */}
            <InputField name="club" title="Club" placeholder="Enter club name" register={register} error={errors.club} />

            <InputField name="position" type="number" title="Position" placeholder="Enter position" register={register} error={errors.position} />
          </div>

        </div>

      </section>
      {/* Application Identity Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Offensive Stats</h2>
          {/* App Name Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField name="goals" type="number" title="Goals" placeholder="" register={register} error={errors.goals} />
            <InputField name="assists" type="number" title="Assists" placeholder="" register={register} error={errors.assists} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <InputField name="shots" type="number" title="Shots" placeholder="" register={register} error={errors.shots} />
            <InputField name="shotOnTarget" type="number" title="Shot on Target" placeholder="" register={register} error={errors.shotOnTarget} />
            <InputField name="dribbleCompleted" type="number" title="Shot on Target" placeholder="" register={register} error={errors.dribbleCompleted} />
          </div>

        </div>

      </section>
      {/* Application Identity Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Defensive Stats</h2>
          {/* App Name Input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField name="tackles" type="number" title="Tackles" placeholder="" register={register} error={errors.tackles} />
            <InputField name="interceptions" type="number" title="Interceptions" placeholder="" register={register} error={errors.interceptions} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <InputField name="clearances" type="number" title="clearances" placeholder="" register={register} error={errors.clearances} />
            <InputField name="blocks" type="number" title="Blocks" placeholder="" register={register} error={errors.blocks} />
            <InputField name="fouls" type="number" title="Fouls" placeholder="" register={register} error={errors.fouls} />
          </div>

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

export default CreatePlayer