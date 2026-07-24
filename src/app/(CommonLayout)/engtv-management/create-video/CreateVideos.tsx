/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import ImageUploadField, { ImageChildrenComponent } from '@/components/form/ImageUploadField'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import TextareaField from '@/components/form/TextareaField'
import { matchTypeOptions, publishStatusOptions } from '@/constants/selectData'
import {
  useCreateVideoMutation,
  useGetSingleVideoQuery,
  useLazyFrontEndVideoQuery,
  useUpdateVideoMutation,
} from '@/features/engTVManagement/engApi'
import { useHeaders } from '@/hooks/useHeaders'
import { baseURL } from '@/utils/BaseURL'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import SubmitButton from '../../../../components/buttons/SubmitButton'

// Form Validation Schema
const videoSchema = z.object({
  videoTitle: z.string().min(2).max(100),
  description: z.string().min(1),
  category: z.string().min(1),
  logo: z.any().optional(),
  video: z.any().optional(),
  pubStatus: z.string().min(1),
  pubDate: z.string().optional(),
  pubTime: z.string().optional(),
});

type videoFormValues = z.infer<typeof videoSchema>

const CreateVideos = () => {
  const { setHeaders } = useHeaders()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const router = useRouter()

  const { data: singleVideoData, isLoading: isFetchingSingle } = useGetSingleVideoQuery(id, { skip: !id })
  const [fetchPresignedUrl] = useLazyFrontEndVideoQuery()
  const [createVideo] = useCreateVideoMutation()
  const [updateVideo] = useUpdateVideoMutation()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<videoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      videoTitle: '',
      description: '',
      category: '',
      logo: '',
      pubStatus: 'draft',
      pubDate: '',
      pubTime: '',
    }
  })

  // Watch for local video selection
  const watchedVideo = useWatch({ control, name: 'video' });
  const [localVideoPreview, setLocalVideoPreview] = React.useState<string | null>(null);

  useEffect(() => {
    if (watchedVideo && watchedVideo[0] instanceof File) {
      const url = URL.createObjectURL(watchedVideo[0]);
      setLocalVideoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalVideoPreview(null);
    }
  }, [watchedVideo])

  useEffect(() => {
    setHeaders({
      title: id ? "Edit Video" : "Create Video",
      des: id ? "Update your broadcast content details." : "Design a new broadcast for your ENG TV audience."
    })
  }, [setHeaders, id])

  useEffect(() => {
    if (singleVideoData?.data) {
      const video = singleVideoData.data;
      const pubDate = video.publishDateTime ? dayjs(video.publishDateTime).format('YYYY-MM-DD') : '';
      const pubTime = video.publishDateTime ? dayjs(video.publishDateTime).format('HH:mm') : '';

      reset({
        videoTitle: video.title,
        description: video.description,
        category: video.category,
        pubStatus: video.status, // Matches 'draft' or 'publish'
        pubDate: pubDate,
        pubTime: pubTime,
        logo: video.thumbnail ? (video.thumbnail.startsWith('http') ? video.thumbnail : baseURL + video.thumbnail) : ''
      })
    }
  }, [singleVideoData, reset])

  const onSubmit = async (data: videoFormValues) => {
    if (!id && (!data.video || data.video.length === 0)) {
      toast.error("Video file is required");
      return;
    }

    let finalVideoUrl = singleVideoData?.data?.videoUrl || "";

    // 1. If a new video file is selected, handle S3 presigned URL upload
    if (data.video?.[0] instanceof File) {
      const videoFile = data.video[0];
      const toastId = toast.loading("Uploading video file...");

      try {
        // Step A: Get presigned upload URL from backend
        const presignedRes = await fetchPresignedUrl({
          fileName: videoFile.name,
          contentType: videoFile.type || "video/mp4",
        }).unwrap();

        const uploadUrl = presignedRes?.data?.uploadUrl;
        const videoUrl = presignedRes?.data?.videoUrl;

        if (!uploadUrl || !videoUrl) {
          throw new Error("Failed to generate upload URL");
        }

        // Step B: Upload file directly to S3 via PUT request
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": videoFile.type || "video/mp4",
          },
          body: videoFile,
        });

        if (!uploadRes.ok) {
          throw new Error(`Video upload to S3 failed (${uploadRes.status})`);
        }

        finalVideoUrl = videoUrl;
        toast.success("Video file uploaded successfully", { id: toastId });
      } catch (err: any) {
        toast.error(err?.message || "Failed to upload video file", { id: toastId });
        return;
      }
    }

    // Step C: Prepare video JSON payload
    const videoPayload: Record<string, any> = {
      title: data.videoTitle,
      category: data.category,
      description: data.description,
      videoUrl: finalVideoUrl,
      status: data.pubStatus,
    };

    if (data.pubDate && data.pubTime) {
      videoPayload.publishDateTime = `${data.pubDate}T${data.pubTime}:00.000Z`;
    }

    try {
      if (data.logo instanceof File) {
        const formData = new FormData();
        formData.append("data", JSON.stringify(videoPayload));
        formData.append("image", data.logo);

        if (id) {
          await updateVideo({ id, data: formData }).unwrap();
          toast.success("Video updated successfully");
        } else {
          await createVideo(formData).unwrap();
          toast.success("Video created successfully");
        }
      } else {
        if (id) {
          await updateVideo({ id, data: videoPayload }).unwrap();
          toast.success("Video updated successfully");
        } else {
          await createVideo(videoPayload).unwrap();
          toast.success("Video created successfully");
        }
      }
      router.push('/engtv-management');
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save video");
    }
  }

  if (isFetchingSingle) return <div className="p-10 text-center">Loading video data...</div>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full py-10 px-6 space-y-8">
      <div className='flex items-center justify-between'>
        <BackButton />
      </div>
      <div className='w-full flex gap-4 flex-col lg:flex-row'>
        <div className='basis-full space-y-8 flex w-full items-start justify-between gap-10'>
          {/* Application Identity Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 h-full w-8/12 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Basic Information</h2>

            <div className="space-y-8">
              <InputField name="videoTitle" title="Video Title" placeholder="e.g. Manchester Derby - High Intensity Highlights" register={register} error={errors.videoTitle} />
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <SelectField name="category" label="Content Category" control={control} error={errors.category} options={matchTypeOptions} />
                <SelectField name="pubStatus" label="Publishing Status" control={control} error={errors.pubStatus} options={publishStatusOptions} />
              </div>
              <TextareaField name="description" title="Description" placeholder="Brief summary of the broadcast content..." register={register} error={errors.description} />
            </div>
          </section>

          {/* Regional Preferences Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 w-4/12 h-full border border-gray-50 shadow-xl shadow-gray-200/50 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Thumbnail & Media</h2>

            <div className="space-y-6">
              {/* Video Preview Section */}
              {(localVideoPreview || (id && singleVideoData?.data?.videoUrl)) && (
                <div className="w-full bg-black rounded-2xl overflow-hidden aspect-video border border-gray-100 shadow-inner group relative">
                  <video
                    key={localVideoPreview || singleVideoData?.data?.videoUrl}
                    src={
                      localVideoPreview ||
                      (singleVideoData?.data?.videoUrl?.startsWith('http')
                        ? singleVideoData.data.videoUrl
                        : baseURL + singleVideoData?.data?.videoUrl)
                    }
                    controls
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-tighter border border-white/20">
                    {localVideoPreview ? 'Preview: Selected File' : 'Current Broadcast Video'}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[15px] font-semibold text-gray-800">Choose Broadcast Video {!id && <span className="text-red-500">*</span>}</label>
                <input
                  type="file"
                  accept="video/*"
                  {...register("video")}
                  className="w-full bg-[#f3f4f6] border-2 rounded-lg py-3 px-6 text-gray-900 font-medium placeholder:text-gray-400 outline-none transition-all hover:bg-[#ecedf0]"
                />
                {id && <p className="text-xs text-gray-500 italic">💡 Leave blank if you don&apos;t want to replace current video.</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-4">
              <ImageUploadField name="logo" label="Video Thumbnail" control={control} error={errors.logo as any}>
                <ImageChildrenComponent maxSizeMB={5} />
              </ImageUploadField>
            </div>
          </section>
        </div>
      </div>
      <div className='w-full flex justify-end'>
        <SubmitButton isSubmitting={isSubmitting} title={id ? "Update Video" : "Save Video"} />
      </div>
    </form>
  )
}

export default CreateVideos
