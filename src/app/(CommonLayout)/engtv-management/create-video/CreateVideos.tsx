/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  FiVideo,
  FiRotateCcw,
} from "react-icons/fi";
import { FaYoutube } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import {
  ArrowLeft,
  Tv,
  Calendar,
  Clock,
  Check,
  Star,
  Film,
  Upload,
} from "lucide-react";

import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextareaField from "@/components/form/TextareaField";
import ImageUploadField, {
  ImageChildrenComponent,
} from "@/components/form/ImageUploadField";
import { publishStatusOptions } from "@/constants/selectData";
import {
  useCreateVideoMutation,
  useGetSingleVideoQuery,
  useLazyFrontEndVideoQuery,
  useUpdateVideoMutation,
} from "@/features/engTVManagement/engApi";
import { useGetAllVideoCategoryQuery } from "@/features/categoryManagement/categoryApi";
import { useHeaders } from "@/hooks/useHeaders";
import { baseURL } from "@/utils/BaseURL";
import { getYouTubeEmbedUrl } from "@/utils/getYouTubeEmbedUrl";

// Form Validation Schema
const videoSchema = z.object({
  videoTitle: z.string().min(2, "Title is required").max(100),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  subCategory: z.string().optional(),
  logo: z.any().optional(),
  video: z.any().optional(),
  youtubeUrl: z.string().optional(),
  pubStatus: z.string().min(1),
  pubDate: z.string().optional(),
  pubTime: z.string().optional(),
  isHighlight: z.boolean(),
  order: z.number().min(0, "Order must be at least 0"),
});

type VideoFormValues = z.infer<typeof videoSchema>;

const CreateVideos = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { setHeaders } = useHeaders();

  const [createVideo, { isLoading: isCreating }] = useCreateVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();
  const { data: singleVideoData, isLoading: isFetchingSingle } =
    useGetSingleVideoQuery(id, { skip: !id });
  const { data: categoryData } = useGetAllVideoCategoryQuery({});
  const [fetchPresignedUrl] = useLazyFrontEndVideoQuery();

  const [videoSourceType, setVideoSourceType] = useState<"file" | "youtube">(
    "youtube"
  );
  const [localVideoPreview, setLocalVideoPreview] = useState<string | null>(
    null
  );
  const [isExistingVideoRemoved, setIsExistingVideoRemoved] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<VideoFormValues>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      videoTitle: "",
      description: "",
      category: "",
      subCategory: "",
      pubStatus: "publish",
      pubDate: "",
      pubTime: "",
      isHighlight: false,
      order: 0,
      youtubeUrl: "",
    },
  });

  const selectedCategory = useWatch({ control, name: "category" });
  const watchedVideoFile = useWatch({ control, name: "video" });
  const watchedYoutubeUrl = useWatch({ control, name: "youtubeUrl" });

  useEffect(() => {
    setHeaders({
      title: id ? "Edit Video" : "Add Video",
      des: id
        ? "Modify broadcast content, schedule, and categorization."
        : "Upload or embed new broadcast content for ENG TV.",
    });
  }, [id, setHeaders]);

  // Pre-fill form when editing
  useEffect(() => {
    if (id && singleVideoData?.data) {
      const v = singleVideoData.data;
      setValue("videoTitle", v.title || "");
      setValue("description", v.description || "");
      setValue(
        "category",
        typeof v.category === "object" ? v.category?._id : v.category || ""
      );
      setValue(
        "subCategory",
        typeof v.subCategory === "object"
          ? v.subCategory?._id
          : v.subCategory || ""
      );
      setValue("pubStatus", v.status || "publish");
      setValue("isHighlight", !!v.isHighlight);
      setValue("order", typeof v.order === "number" ? v.order : 0);

      if (v.publishDateTime) {
        setValue("pubDate", dayjs(v.publishDateTime).format("YYYY-MM-DD"));
        setValue("pubTime", dayjs(v.publishDateTime).format("HH:mm"));
      }

      if (v.videoUrl) {
        const isYoutube = !!getYouTubeEmbedUrl(v.videoUrl);
        if (isYoutube) {
          setVideoSourceType("youtube");
          setValue("youtubeUrl", v.videoUrl);
        } else {
          setVideoSourceType("file");
        }
      }
    }
  }, [id, singleVideoData, setValue]);

  // Generate preview for selected local video file
  useEffect(() => {
    if (watchedVideoFile?.[0] instanceof File) {
      const objectUrl = URL.createObjectURL(watchedVideoFile[0]);
      setLocalVideoPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLocalVideoPreview(null);
    }
  }, [watchedVideoFile]);

  // Categories & Subcategories mapping
  const categoryOptions =
    categoryData?.data?.map((cat: any) => ({
      value: cat._id,
      label: cat.name,
    })) || [];

  const activeCategoryObj = categoryData?.data?.find(
    (c: any) => c._id === selectedCategory
  );
  const subCategoriesList = activeCategoryObj?.subCategories || [];
  const subCategoryOptions = subCategoriesList.map((sub: any) => ({
    value: sub._id,
    label: sub.name,
  }));

  const handleRemoveExistingVideo = () => {
    setIsExistingVideoRemoved(true);
    setValue("youtubeUrl", "");
    setValue("video", undefined);
    setLocalVideoPreview(null);
    toast.info("Existing video removed. Please specify a new video source.");
  };

  const handleRestoreExistingVideo = () => {
    setIsExistingVideoRemoved(false);
    if (singleVideoData?.data?.videoUrl) {
      const isYoutube = !!getYouTubeEmbedUrl(singleVideoData.data.videoUrl);
      if (isYoutube) {
        setVideoSourceType("youtube");
        setValue("youtubeUrl", singleVideoData.data.videoUrl);
      } else {
        setVideoSourceType("file");
      }
    }
    toast.success("Existing video restored");
  };

  const onSubmit = async (data: VideoFormValues) => {
    let finalVideoUrl = "";

    const existingVideoUrl = singleVideoData?.data?.videoUrl;
    const existingIsYoutube = existingVideoUrl
      ? !!getYouTubeEmbedUrl(existingVideoUrl)
      : false;

    if (videoSourceType === "file") {
      if (data.video?.[0] instanceof File) {
        const videoFile = data.video[0];
        const toastId = toast.loading("Uploading video file to media storage...");

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
            throw new Error(`Video upload failed (${uploadRes.status})`);
          }

          finalVideoUrl = videoUrl;
          toast.success("Video file uploaded successfully", { id: toastId });
        } catch (err: any) {
          toast.error(err?.message || "Failed to upload video file", {
            id: toastId,
          });
          return;
        }
      } else if (
        id &&
        !isExistingVideoRemoved &&
        existingVideoUrl &&
        !existingIsYoutube
      ) {
        finalVideoUrl = existingVideoUrl;
      } else {
        toast.error("Video file is required");
        return;
      }
    } else if (videoSourceType === "youtube") {
      const urlInput = data.youtubeUrl?.trim();
      if (urlInput) {
        const embedCheck = getYouTubeEmbedUrl(urlInput);
        if (!embedCheck) {
          toast.error("Please enter a valid YouTube video URL");
          return;
        }
        finalVideoUrl = urlInput;
      } else if (
        id &&
        !isExistingVideoRemoved &&
        existingVideoUrl &&
        existingIsYoutube
      ) {
        finalVideoUrl = existingVideoUrl;
      } else {
        toast.error("YouTube video URL is required");
        return;
      }
    }

    if (!finalVideoUrl) {
      toast.error("A valid video source is required");
      return;
    }

    const videoPayload: Record<string, any> = {
      title: data.videoTitle,
      category: data.category,
      description: data.description,
      videoUrl: finalVideoUrl,
      status: data.pubStatus,
      isHighlight: data.isHighlight,
      order: data.order,
    };

    if (data.subCategory) {
      videoPayload.subCategory = data.subCategory;
    }

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
        toast.success("Video published successfully");
      }
      router.push("/engtv-management");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save video");
    }
  };

  if (isFetchingSingle) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 font-medium">
        Loading video details...
      </div>
    );
  }

  const existingVideoUrl = singleVideoData?.data?.videoUrl;
  const existingYoutubeEmbed = getYouTubeEmbedUrl(existingVideoUrl);
  const liveYoutubeEmbed = getYouTubeEmbedUrl(watchedYoutubeUrl);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-6 px-6 sm:px-8 space-y-6 max-w-[1500px] mx-auto"
    >
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ENG TV</span>
        </button>
        <span className="text-xs text-slate-400 font-medium">
          {id ? "Edit Video Mode" : "New Broadcast Video"}
        </span>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Video Details & Synopsis */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Details Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                General Video Information
              </h2>
              <span className="text-[11px] text-slate-400">
                Required fields are indicated
              </span>
            </div>

            <div className="space-y-4">
              <InputField
                name="videoTitle"
                title="Video Title"
                placeholder="e.g. Finals Highlights - Matchday Recap"
                register={register}
                error={errors.videoTitle}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="category"
                  label="Content Category"
                  control={control}
                  error={errors.category}
                  options={categoryOptions}
                  placeholder="Select category"
                  scrollable
                />

                {subCategoriesList.length > 0 ? (
                  <SelectField
                    name="subCategory"
                    label="Sub Category"
                    control={control}
                    error={errors.subCategory}
                    options={subCategoryOptions}
                    placeholder="Select subcategory"
                    scrollable
                  />
                ) : (
                  <SelectField
                    name="pubStatus"
                    label="Publishing Status"
                    control={control}
                    error={errors.pubStatus}
                    options={publishStatusOptions}
                  />
                )}
              </div>

              {subCategoriesList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    name="pubStatus"
                    label="Publishing Status"
                    control={control}
                    error={errors.pubStatus}
                    options={publishStatusOptions}
                  />
                </div>
              )}

              <TextareaField
                name="description"
                title="Description & Synopsis"
                placeholder="Provide a detailed description of the match or event highlights..."
                register={register}
                error={errors.description}
              />
            </div>
          </div>

          {/* Video Stream Source Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Broadcast Stream Source
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select whether to embed a YouTube video or upload an MP4 stream file
                </p>
              </div>

              {/* Source Switcher Tabs */}
              <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800/50">
                <button
                  type="button"
                  onClick={() => setVideoSourceType("youtube")}
                  className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    videoSourceType === "youtube"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <FaYoutube className="w-3.5 h-3.5 text-red-600" />
                  YouTube Link
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceType("file")}
                  className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                    videoSourceType === "file"
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  <Upload className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                  Video File
                </button>
              </div>
            </div>

            {/* Existing Video Banner if Editing */}
            {id && existingVideoUrl && !isExistingVideoRemoved && (
              <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Currently Attached Video
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveExistingVideo}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
                  >
                    <HiOutlineTrash className="w-3 h-3" />
                    <span>Change Video</span>
                  </button>
                </div>

                <div className="w-full aspect-video max-w-sm rounded bg-black overflow-hidden border border-slate-200 dark:border-slate-800">
                  {existingYoutubeEmbed ? (
                    <iframe
                      src={existingYoutubeEmbed}
                      title="Existing Video Preview"
                      className="w-full h-full border-0"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={
                        existingVideoUrl.startsWith("http")
                          ? existingVideoUrl
                          : baseURL + existingVideoUrl
                      }
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Restored notice if removed in edit mode */}
            {id && existingVideoUrl && isExistingVideoRemoved && (
              <div className="p-3 rounded-md border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
                <span>Existing video detached. Attach a new source below or restore.</span>
                <button
                  type="button"
                  onClick={handleRestoreExistingVideo}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 hover:bg-amber-50 cursor-pointer"
                >
                  <FiRotateCcw className="w-3 h-3" />
                  Restore
                </button>
              </div>
            )}

            {/* YouTube Input Mode */}
            {videoSourceType === "youtube" &&
              (!id || isExistingVideoRemoved || !existingVideoUrl) && (
                <div className="space-y-3">
                  <InputField
                    name="youtubeUrl"
                    title="YouTube Video URL"
                    placeholder="https://www.youtube.com/watch?v=..."
                    register={register}
                    error={errors.youtubeUrl}
                  />

                  {liveYoutubeEmbed && (
                    <div className="aspect-video max-w-md bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <iframe
                        src={liveYoutubeEmbed}
                        title="Live YouTube Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>
              )}

            {/* File Upload Mode */}
            {videoSourceType === "file" &&
              (!id || isExistingVideoRemoved || !existingVideoUrl) && (
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Upload MP4 / MOV Video File
                  </label>
                  <input
                    type="file"
                    accept="video/mp4,video/quicktime,video/webm"
                    {...register("video")}
                    className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer"
                  />

                  {localVideoPreview && (
                    <div className="aspect-video max-w-md bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                      <video
                        src={localVideoPreview}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Column (4 cols): Media, Publishing & Scheduling */}
        <div className="lg:col-span-4 space-y-6">
          {/* Thumbnail Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Poster Thumbnail
            </h2>
            <ImageUploadField
              name="logo"
              label="Cover Image (16:9 recommended)"
              control={control}
              error={errors.logo as any}
            >
              <ImageChildrenComponent maxSizeMB={5} />
            </ImageUploadField>
          </div>

          {/* Schedule & Priority Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Publishing & Priority
            </h2>

            <div className="space-y-3">
              <InputField
                name="order"
                title="Display Order Index"
                type="number"
                placeholder="0"
                register={register}
                registerOptions={{ valueAsNumber: true }}
                error={errors.order}
              />

              {/* Highlight Toggle */}
              <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 block">
                    Featured Highlight
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Pin video to top carousel on app
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("isHighlight")}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Scheduled Date & Time */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Publish Release Time (Optional)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    name="pubDate"
                    type="date"
                    title="Release Date"
                    register={register}
                    error={errors.pubDate}
                  />
                  <InputField
                    name="pubTime"
                    type="time"
                    title="Release Time"
                    register={register}
                    error={errors.pubTime}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/engtv-management")}
              className="px-4 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-xs font-medium rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {(isCreating || isUpdating) && (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span>{id ? "Save Changes" : "Publish Video"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateVideos;
