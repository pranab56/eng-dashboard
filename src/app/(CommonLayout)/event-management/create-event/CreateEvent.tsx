/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'

import { baseURL } from '@/utils/BaseURL'
import { useCreateEventMutation, useGetSingleEventQuery, useUpdateEventMutation } from '../../../../features/eventManagement/eventApi'

// Event Status Options
const eventStatusOptions = [
  { value: "publish", label: "Publish" },
  { value: "draft", label: "Draft" },
  { value: "canceled", label: "Canceled" },
]

// Form Validation Schema for Event
const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  image: z.any().optional(),
  status: z.string().min(1, "Status is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
});

type EventFormValues = z.infer<typeof eventSchema>

const CreateEvent = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventId = searchParams.get("id")
  const isEditMode = !!eventId

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation()
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation()
  const { data: eventData, isFetching } = useGetSingleEventQuery(eventId, { skip: !isEditMode })

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
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Event" : "Create New Event",
      des: isEditMode ? "Modify existing event content and schedules." : "Create a new event for the community network."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (eventData?.data) {
      const event = eventData.data;
      reset({
        title: event.title,
        description: event.description,
        location: event.location,
        status: event.status,
        eventDate: dayjs(event.eventDate).format("YYYY-MM-DD"),
        eventTime: dayjs(event.eventDate).format("HH:mm"),
        image: event.image ? baseURL + event.image : undefined,
      });
    }
  }, [eventData, reset])

  const onSubmit = async (data: EventFormValues) => {
    try {
      const formData = new FormData();

      // Combine date and time for eventDate
      const eventDateTime = `${data.eventDate}T${data.eventTime}:00.000Z`;

      const jsonData = {
        title: data.title,
        description: data.description,
        location: data.location,
        status: data.status,
        eventDate: eventDateTime
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.image instanceof File) {
        formData.append("image", data.image);
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
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event`);
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading event data...</div>
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-6xl mx-auto py-5 px-6 space-y-8">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='basis-[70%] space-y-8'>
          {/* Basic Information Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Event Details</h2>

            <div className="space-y-8">
              <InputField name="title" title="Event Title" placeholder="Enter event title" register={register} error={errors.title} />
              <InputField name="location" title="Location" placeholder="Enter event location (e.g., Dhaka)" register={register} error={errors.location} />
              <TextareaField name="description" title="Description" placeholder="Describe your event here..." register={register} error={errors.description} />
            </div>
          </section>

          {/* Media Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Event Image</h2>

            <div className="w-full">
              <ImageUploadField name="image" label="Event Banner/Thumbnail" control={control} error={errors.image as any}>
                <ImageChildrenComponent maxSizeMB={5} />
              </ImageUploadField>
            </div>
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
            <CancelButton onClick={() => reset()} title="Reset" />
            <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Event" : "Create Event"} />
          </div>
        </div>

        {/* Scheduling Sidebar */}
        <div className='basis-[30%]'>
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Event Schedule</h2>

            <div className="space-y-8">
              <SelectField name="status" label="Event Status" control={control} error={errors.status} options={eventStatusOptions} />
              <div className="space-y-4">
                <InputField name="eventDate" type='date' title="Event Date" register={register} error={errors.eventDate} />
                <InputField name="eventTime" type='time' title="Event Time" register={register} error={errors.eventTime} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default CreateEvent