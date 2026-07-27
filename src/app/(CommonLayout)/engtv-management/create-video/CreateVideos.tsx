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
import { getYouTubeEmbedUrl } from '@/utils/getYouTubeEmbedUrl'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { FaYoutube } from 'react-icons/fa'
import { FiRotateCcw, FiVideo } from 'react-icons/fi'
import { HiOutlineTrash } from 'react-icons/hi'
import { toast } from 'sonner'
import * as z from 'zod'
import SubmitButton from '../../../../components/buttons/SubmitButton'

// Form Validation Schema
const videoSchema = z.object({
  videoTitle: z.string().min(2, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  logo: z.any().optional(),
  video: z.any().optional(),
  youtubeUrl: z.string().optional(),
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

  const [videoSourceType, setVideoSourceType] = useState<'file' | 'youtube'>('file')
  const [isExistingVideoRemoved, setIsExistingVideoRemoved] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<videoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      videoTitle: '',
      description: '',
      category: '',
      logo: '',
      youtubeUrl: '',
      pubStatus: 'draft',
      pubDate: '',
      pubTime: '',
    }
  })

  // Watch fields for live preview
  const watchedVideo = useWatch({ control, name: 'video' });
  const watchedYoutubeUrl = useWatch({ control, name: 'youtubeUrl' });
  const [localVideoPreview, setLocalVideoPreview] = useState<string | null>(null);

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

      const isYoutube = !!getYouTubeEmbedUrl(video.videoUrl);
      if (isYoutube) {
        setVideoSourceType('youtube');
      } else {
        setVideoSourceType('file');
      }

      reset({
        videoTitle: video.title || '',
        description: video.description || '',
        category: video.category || '',
        pubStatus: video.status || 'draft',
        pubDate: pubDate,
        pubTime: pubTime,
        youtubeUrl: isYoutube ? video.videoUrl : '',
        logo: video.thumbnail ? (video.thumbnail.startsWith('http') ? video.thumbnail : baseURL + video.thumbnail) : ''
      })
      setIsExistingVideoRemoved(false);
    }
  }, [singleVideoData, reset])

  const handleRemoveExistingVideo = () => {
    setIsExistingVideoRemoved(true);
    setValue('youtubeUrl', '');
    setValue('video', undefined);
    setLocalVideoPreview(null);
    toast.info("Existing video removed. Please choose a new video option.");
  }

  const handleRestoreExistingVideo = () => {
    setIsExistingVideoRemoved(false);
    if (singleVideoData?.data?.videoUrl) {
      const isYoutube = !!getYouTubeEmbedUrl(singleVideoData.data.videoUrl);
      if (isYoutube) {
        setVideoSourceType('youtube');
        setValue('youtubeUrl', singleVideoData.data.videoUrl);
      } else {
        setVideoSourceType('file');
      }
    }
    toast.success("Existing video restored");
  }

  const onSubmit = async (data: videoFormValues) => {
    let finalVideoUrl = "";

    const existingVideoUrl = singleVideoData?.data?.videoUrl;
    const existingIsYoutube = existingVideoUrl ? !!getYouTubeEmbedUrl(existingVideoUrl) : false;

    if (videoSourceType === 'file') {
      if (data.video?.[0] instanceof File) {
        const videoFile = data.video[0];
        const toastId = toast.loading("Uploading video file...");

        try {
          const presignedRes = await fetchPresignedUrl({
            fileName: videoFile.name,
            contentType: videoFile.type || "video/mp4",
          }).unwrap();

          const uploadUrl = presignedRes?.data?.uploadUrl;
          const videoUrl = presignedRes?.data?.videoUrl;

          if (!uploadUrl || !videoUrl) {
            throw new Error("Failed to generate upload URL");
          }

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
      } else if (id && !isExistingVideoRemoved && existingVideoUrl && !existingIsYoutube) {
        finalVideoUrl = existingVideoUrl;
      } else {
        toast.error("Broadcast video file is required");
        return;
      }
    } else if (videoSourceType === 'youtube') {
      const urlInput = data.youtubeUrl?.trim();
      if (urlInput) {
        const embedCheck = getYouTubeEmbedUrl(urlInput);
        if (!embedCheck) {
          toast.error("Please enter a valid YouTube video URL");
          return;
        }
        finalVideoUrl = urlInput;
      } else if (id && !isExistingVideoRemoved && existingVideoUrl && existingIsYoutube) {
        finalVideoUrl = existingVideoUrl;
      } else {
        toast.error("YouTube video link is required");
        return;
      }
    }

    if (!finalVideoUrl) {
      toast.error("Video is required");
      return;
    }

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
      const formData = new FormData();
      formData.append("data", JSON.stringify(videoPayload));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (id) {
        await updateVideo({ id, data: formData }).unwrap();
        toast.success("Video updated successfully");
      } else {
        await createVideo(formData).unwrap();
        toast.success("Video created successfully");
      }
      router.push('/engtv-management');
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save video");
    }
  }

  if (isFetchingSingle) return <div className="p-10 text-center font-medium text-gray-600">Loading video details...</div>

  const existingVideoUrl = singleVideoData?.data?.videoUrl;
  const existingYoutubeEmbed = getYouTubeEmbedUrl(existingVideoUrl);
  const liveYoutubeEmbed = getYouTubeEmbedUrl(watchedYoutubeUrl);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full py-10 px-6 space-y-8">
      <div className='flex items-center justify-between'>
        <BackButton />
      </div>
      <div className='w-full flex gap-4 flex-col lg:flex-row'>
        <div className='basis-full space-y-8 flex w-full items-start justify-between gap-10'>
          {/* Basic Information Card */}
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

          {/* Video & Thumbnail Preferences Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 w-4/12 h-full border border-gray-50 shadow-xl shadow-gray-200/50 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Thumbnail & Media</h2>

            {/* Existing Video Section in Edit Mode */}
            {id && existingVideoUrl && !isExistingVideoRemoved && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Current Video</span>
                  <button
                    type="button"
                    onClick={handleRemoveExistingVideo}
                    className="flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash className="size-4" />
                    <span>Remove Video</span>
                  </button>
                </div>
                <div className="w-full bg-black rounded-xl overflow-hidden aspect-video relative border border-gray-200 shadow-inner">
                  {existingYoutubeEmbed ? (
                    <iframe
                      src={existingYoutubeEmbed}
                      title="Existing YouTube Video"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={existingVideoUrl.startsWith('http') ? existingVideoUrl : baseURL + existingVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Notification if existing video removed */}
            {id && isExistingVideoRemoved && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-amber-800">
                  <span className="text-xs font-semibold">⚠️ Existing video removed</span>
                  <button
                    type="button"
                    onClick={handleRestoreExistingVideo}
                    className="flex items-center gap-1 text-xs font-bold text-amber-900 underline hover:no-underline cursor-pointer"
                  >
                    <FiRotateCcw className="size-3" />
                    <span>Undo</span>
                  </button>
                </div>
                <p className="text-xs text-amber-700">Please choose a new video option below to replace it.</p>
              </div>
            )}

            {/* Video Option Choice Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-800">
                Choose Video Source {!id || isExistingVideoRemoved ? <span className="text-red-500">*</span> : null}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('file')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${videoSourceType === 'file'
                      ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <FiVideo className="size-4" />
                  <span>Broadcast Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceType('youtube')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${videoSourceType === 'youtube'
                      ? 'bg-white text-red-600 shadow-sm border border-red-100'
                      : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <FaYoutube className="size-4 text-red-600" />
                  <span>YouTube Link</span>
                </button>
              </div>
            </div>

            {/* Video Inputs & Live Preview */}
            <div className="space-y-4">
              {videoSourceType === 'file' ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-gray-700">Upload Video File</label>
                  </div>
                  <input
                    type="file"
                    accept="video/*"
                    {...register("video")}
                    className="w-full bg-[#f3f4f6] border-2 border-gray-200 rounded-lg py-2.5 px-4 text-sm text-gray-900 font-medium placeholder:text-gray-400 outline-none transition-all hover:bg-[#ecedf0]"
                  />
                  {localVideoPreview && (
                    <div className="w-full bg-black rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-inner relative group">
                      <video
                        src={localVideoPreview}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
                        New Selected File
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <InputField
                    name="youtubeUrl"
                    title="YouTube Video Link"
                    placeholder="https://www.youtube.com/watch?v=..."
                    register={register}
                    error={errors.youtubeUrl}
                  />
                  {watchedYoutubeUrl && liveYoutubeEmbed && (
                    <div className="w-full bg-black rounded-xl overflow-hidden aspect-video border border-gray-100 shadow-inner relative">
                      <iframe
                        src={liveYoutubeEmbed}
                        title="YouTube Preview"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <div className="absolute top-2 left-2 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider text-white">
                        YouTube Preview
                      </div>
                    </div>
                  )}
                  {watchedYoutubeUrl && !liveYoutubeEmbed && (
                    <p className="text-xs text-red-500">Please enter a valid YouTube video link (e.g. https://www.youtube.com/watch?v=...)</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-8 pt-2">
              <ImageUploadField name="logo" label="Video Thumbnail" control={control} error={errors.logo as any}>
                <ImageChildrenComponent />
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
