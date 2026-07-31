/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import { publishStatusOptions } from '@/constants/selectData'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '@/utils/getErrorMessage'
import { toast } from 'sonner'
import * as z from 'zod'

import { useCreateEventMutation, useEditeventMutation, useSingleEventQuery } from '@/features/eventManagement/eventApi'
import { baseURL } from '@/utils/BaseURL'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'

// Form Validation Schema
const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  logo: z.any().optional(),
  status: z.string().min(1, "Status is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  pubDate: z.string().min(1, "Publish date is required"),
  pubTime: z.string().min(1, "Publish time is required"),
});

type EventFormValues = z.infer<typeof eventSchema>

const CreateEvent = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")
  const isEditMode = !!eventId

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useEditeventMutation()
  const { data: eventData, isFetching } = useSingleEventQuery(eventId, { skip: !isEditMode })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      status: 'publish',
      eventDate: dayjs().format("YYYY-MM-DD"),
      eventTime: dayjs().format("HH:mm"),
      pubDate: dayjs().format("YYYY-MM-DD"),
      pubTime: dayjs().format("HH:mm"),
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Event" : "Create New Event",
      des: isEditMode ? "Modify existing event details and schedules." : "Organize and post a new event for the club network."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (eventData?.data) {
      const eventVal = eventData.data;
      reset({
        title: eventVal.title,
        description: eventVal.description,
        location: eventVal.location,
        status: eventVal.status,
        eventDate: dayjs(eventVal.eventDate).format("YYYY-MM-DD"),
        eventTime: dayjs(eventVal.eventDate).format("HH:mm"),
        pubDate: dayjs(eventVal.publishDateTime).format("YYYY-MM-DD"),
        pubTime: dayjs(eventVal.publishDateTime).format("HH:mm"),
        logo: eventVal.image ? baseURL + eventVal.image : undefined,
      });
    }
  }, [eventData, reset])

  const onSubmit = async (data: EventFormValues) => {
    try {
      const formData = new FormData();

      const eventDateStr = `${data.eventDate}T${data.eventTime}:00.000Z`;
      const publishDateTimeStr = `${data.pubDate}T${data.pubTime}:00.000Z`;

      const jsonData = {
        title: data.title,
        description: data.description,
        location: data.location,
        status: data.status,
        eventDate: eventDateStr,
        publishDateTime: publishDateTimeStr
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateEvent({ id: eventId, data: formData }).unwrap();
        if (res.success) {
          toast.success(res.message || "Event updated successfully");
          router.push("/event-management");
        }
      } else {
        const res = await createEvent(formData).unwrap();
        if (res.success) {
          toast.success(res.message || "Event created successfully");
          router.push("/event-management");
        }
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, `Failed to ${isEditMode ? 'update' : 'create'} event`));
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading event data...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full py-5 px-6 space-y-8">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='basis-[70%] space-y-8'>
          {/* Basic Information Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Event Content Mode</h2>

            <div className="space-y-8">
              <InputField name="title" title="Event Title" placeholder="Enter dynamic event name" register={register} error={errors.title} />
              <InputField name="location" title="Event Location" placeholder="Enter location details / address" register={register} error={errors.location} />
              <TextareaField name="description" title="Event Description" placeholder="Enter detailed copy for the event..." register={register} error={errors.description} />
            </div>
          </section>

          {/* Media Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Cover Media</h2>

            <div className="w-full">
              <ImageUploadField name="logo" label="Event Thumbnail" control={control} error={errors.logo as any}>
                <ImageChildrenComponent maxSizeMB={5} />
              </ImageUploadField>
            </div>
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
            <CancelButton onClick={() => reset()} title="Reset" />
            <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Event" : "Publish Event"} />
          </div>
        </div>

        {/* Scheduling Sidebar */}
        <div className='basis-[30%] space-y-6'>
          {/* Scheduling Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Publish Settings</h2>

            <div className="space-y-8">
              <SelectField name="status" label="Publishing Status" control={control} error={errors.status} options={publishStatusOptions} />
              <div className="space-y-4">
                <p className="text-xs font-black text-gray-400 . tracking-widest">Release Date & Time</p>
                <InputField name="pubDate" type='date' title="Release Date" register={register} error={errors.pubDate} />
                <InputField name="pubTime" type='time' title="Release Time" register={register} error={errors.pubTime} />
              </div>
            </div>
          </section>

          {/* Event Timing Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-medium text-gray-900 mb-8">Event Schedule</h2>

            <div className="space-y-6">
              <InputField name="eventDate" type='date' title="Event Date" register={register} error={errors.eventDate} />
              <InputField name="eventTime" type='time' title="Event Time" register={register} error={errors.eventTime} />
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default CreateEvent;
