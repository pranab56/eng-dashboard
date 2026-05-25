"use client"
import SubmitButton from '@/components/buttons/SubmitButton'
import InputField from '@/components/form/InputField'
import TextareaField from '@/components/form/TextareaField'
import { closeCustomModal } from '@/components/modals/CustomModal'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useCreateNotificationMutation } from '@/features/notification/notificationApi'
import { toast } from 'react-hot-toast'
import * as z from 'zod'
import { getErrorMessage } from '@/utils/getErrorMessage'

// Form Validation Schema
const rewardsSchema = z.object({
  title: z.string().min(2, "Title is required").max(50),
  message: z.string().min(1, "Message is required"),
});

type RewardsFormValues = z.infer<typeof rewardsSchema>

const SendNotification = () => {
  const [createNotification] = useCreateNotificationMutation()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RewardsFormValues>({
    resolver: zodResolver(rewardsSchema),
    defaultValues: {
      title: '',
      message: '',
    }
  })

  const onSubmit = async (data: RewardsFormValues) => {
    try {
      const res = await createNotification(data).unwrap();
      if (res.success) {
        toast.success(res.message || "Notification sent successfully");
        closeCustomModal();
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to send notification"));
    }
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-8">
        <InputField name="title" title="Title" placeholder="Enter notification title ..." register={register} error={errors.title} />
        <TextareaField name="message" title="Message" placeholder="Type your message here ..." register={register} error={errors.message} />
      </div>
      <div className="flex items-center justify-end space-x-5 pt-4">
        <SubmitButton isSubmitting={isSubmitting} title="Send Notification" />
      </div>
    </form>
  )
}

export default SendNotification
