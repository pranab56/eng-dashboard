/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import { newsTypeOptions, publishStatusOptions } from '@/constants/selectData'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { useCreateNewsMutation, useGetSingleNewsQuery, useUpdateNewsMutation } from '@/features/news/newsApi'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'

import { baseURL } from '@/utils/BaseURL'

// Form Validation Schema
const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  logo: z.any().optional(),
  status: z.string().min(1, "Status is required"),
  pubDate: z.string().min(1, "Publish date is required"),
  pubTime: z.string().min(1, "Publish time is required"),
});

type NewsFormValues = z.infer<typeof newsSchema>

const CreateNews = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter()
  const searchParams = useSearchParams()
  const newsId = searchParams.get("id")
  const isEditMode = !!newsId

  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation()
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation()
  const { data: newsData, isFetching } = useGetSingleNewsQuery(newsId, { skip: !isEditMode })

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'Match',
      status: 'publish',
      pubDate: dayjs().format("YYYY-MM-DD"),
      pubTime: dayjs().format("HH:mm"),
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Article" : "Create New Article",
      des: isEditMode ? "Modify existing editorial content and publishing schedules." : "Draft a new broadcast update for the community network."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (newsData?.data) {
      const news = newsData.data;
      reset({
        title: news.title,
        description: news.description,
        category: news.category,
        status: news.status,
        pubDate: dayjs(news.publishDateTime).format("YYYY-MM-DD"),
        pubTime: dayjs(news.publishDateTime).format("HH:mm"),
        logo: news.image ? baseURL + news.image : undefined,
      });
    }
  }, [newsData, reset])


  const onSubmit = async (data: NewsFormValues) => {
    try {
      const formData = new FormData();

      const publishDateTime = `${data.pubDate}T${data.pubTime}:00Z`;

      const jsonData = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        publishDateTime: publishDateTime
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateNews({ id: newsId, data: formData }).unwrap();
        if (res.success) {
          toast.success(res.message || "News article updated successfully");
          router.push("/news-management");
        }
      } else {
        const res = await createNews(formData).unwrap();
        if (res.success) {
          toast.success(res.message || "News article created successfully");
          router.push("/news-management");
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} news article`);
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading article data...</div>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Editorial Content</h2>

            <div className="space-y-8">
              <InputField name="title" title="Headline" placeholder="Enter a compelling headline" register={register} error={errors.title} />
              <SelectField name="category" label="Article Category" control={control} error={errors.category} options={newsTypeOptions} />
              <TextareaField name="description" title="Article Body" placeholder="Draft your content here..." register={register} error={errors.description} />
            </div>
          </section>

          {/* Media Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Cover Media</h2>

            <div className="w-full">
              <ImageUploadField name="logo" label="Article Thumbnail" control={control} error={errors.logo as any}>
                <ImageChildrenComponent maxSizeMB={5} />
              </ImageUploadField>
            </div>
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
            <CancelButton onClick={() => reset()} title="Reset" />
            <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Article" : "Publish Article"} />
          </div>
        </div>

        {/* Scheduling Sidebar */}
        <div className='basis-[30%]'>
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Scheduling</h2>

            <div className="space-y-8">
              <SelectField name="status" label="Publishing Status" control={control} error={errors.status} options={publishStatusOptions} />
              <div className="space-y-4">
                <InputField name="pubDate" type='date' title="Release Date" register={register} error={errors.pubDate} />
                <InputField name="pubTime" type='time' title="Release Time" register={register} error={errors.pubTime} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default CreateNews;