/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import SubmitButton from '@/components/buttons/SubmitButton'
import InputField from '@/components/form/InputField'
import TextareaField from '@/components/form/TextareaField'
import SelectField from '@/components/form/SelectField'
import { closeCustomModal } from '@/components/modals/CustomModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreateNotificationMutation } from '@/features/notification/notificationApi'
import { toast } from 'react-hot-toast'
import * as z from 'zod'

const notificationCategories = [
  { label: "📰 General News", value: "GENERAL_NEWS" },
  { label: "⇄ Transfers Gossip", value: "TRANSFERS_GOSSIP" },
  { label: "🏆 Player of the Week", value: "PLAYER_OF_THE_WEEK" },
  { label: "🎯 Match Updates", value: "MATCH_UPDATE" },
]

// Form Validation Schema
const notificationSchema = z.object({
  title: z.string().min(2, "Title is required").max(100),
  category: z.enum(["GENERAL_NEWS", "TRANSFERS_GOSSIP", "PLAYER_OF_THE_WEEK", "MATCH_UPDATE"]),
  message: z.string().min(1, "Message is required"),
});

type NotificationFormValues = z.infer<typeof notificationSchema>

const SendNotification = () => {
  const [createNotification] = useCreateNotificationMutation()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      title: '',
      category: 'GENERAL_NEWS',
      message: '',
    }
  })

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      const res = await createNotification(data).unwrap();
      if (res.success) {
        toast.success(res.message || "Notification sent successfully");
        closeCustomModal();
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send notification");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-5">
        <InputField name="title" title="Title" placeholder="Enter notification title ..." register={register} error={errors.title} />
        
        <SelectField
          name="category"
          label="Category"
          control={control}
          options={notificationCategories}
          error={errors.category as any}
        />

        <TextareaField name="message" title="Message" placeholder="Type your message here ..." register={register} error={errors.message} />
      </div>
      <div className="flex items-center justify-end space-x-5 pt-4">
        <SubmitButton isSubmitting={isSubmitting} title="Send Notification" />
      </div>
    </form>
  )
}

export default SendNotification
