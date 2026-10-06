/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Clock,
  Globe,
  Loader2,
  Newspaper,
  Save,
  BookOpen,
  Info,
} from "lucide-react";
import { toast } from "sonner";

import ImageUploadField, {
  ImageChildrenComponent,
} from "@/components/form/ImageUploadField";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import CustomTimePicker from "@/components/ui/CustomTimePicker";
import { newsTypeOptions, publishStatusOptions } from "@/constants/selectData";
import { useGetAllNewsCategoryQuery } from "@/features/categoryManagement/categoryApi";
import {
  useCreateNewsMutation,
  useGetSingleNewsQuery,
  useUpdateNewsMutation,
} from "@/features/news/newsApi";
import { useHeaders } from "@/hooks/useHeaders";
import { baseURL } from "@/utils/BaseURL";
import { getErrorMessage } from "@/utils/getErrorMessage";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const joditConfig = {
  height: 380,
  readonly: false,
  placeholder: "Write your article content, quotes, and match highlights here...",
  buttons: [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "ul",
    "ol",
    "outdent",
    "indent",
    "|",
    "font",
    "fontsize",
    "brush",
    "|",
    "align",
    "|",
    "link",
    "table",
    "|",
    "hr",
    "|",
    "undo",
    "redo",
  ],
  showCharsCounter: true,
  showWordsCounter: true,
  toolbarAdaptive: false,
  theme: "default",
};

// Form Validation Schema
const newsSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z.string().trim().min(10, "Article content must be at least 10 characters"),
  category: z.string().min(1, "Please select an article category"),
  logo: z.any().optional(),
  status: z.string().min(1, "Status is required"),
  pubDate: z.string().min(1, "Publish date is required"),
  pubTime: z.string().min(1, "Publish time is required"),
});

type NewsFormValues = z.infer<typeof newsSchema>;

const CreateNews = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsId = searchParams.get("id");
  const isEditMode = Boolean(newsId);

  const [createNews, { isLoading: isCreating }] = useCreateNewsMutation();
  const [updateNews, { isLoading: isUpdating }] = useUpdateNewsMutation();
  const { data: newsData, isFetching } = useGetSingleNewsQuery(newsId, {
    skip: !isEditMode,
  });
  const { data: newsCategoryData } = useGetAllNewsCategoryQuery({});

  const newsCategories: any[] = newsCategoryData?.data || [];
  const dynamicNewsCategoryOptions =
    newsCategories.length > 0
      ? newsCategories.map((c: any) => ({
          label: c.name,
          value: c._id || c.id || c.name,
        }))
      : newsTypeOptions;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      status: "publish",
      pubDate: dayjs().format("YYYY-MM-DD"),
      pubTime: dayjs().format("HH:mm"),
    },
  });

  const formValues = watch();

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Article" : "Create New Article",
      des: isEditMode
        ? "Modify existing editorial content, broadcast schedule, and media assets."
        : "Draft and publish official club updates across the ENG network.",
    });
  }, [setHeaders, isEditMode]);

  useEffect(() => {
    if (newsData?.data) {
      const news = newsData.data;
      reset({
        title: news.title || "",
        description: news.description || "",
        category:
          typeof news.category === "object"
            ? news.category?._id || news.category?.name
            : news.category || "",
        status: news.status || "publish",
        pubDate: news.publishDateTime
          ? dayjs(news.publishDateTime).format("YYYY-MM-DD")
          : dayjs().format("YYYY-MM-DD"),
        pubTime: news.publishDateTime
          ? dayjs(news.publishDateTime).format("HH:mm")
          : dayjs().format("HH:mm"),
        logo: news.image ? baseURL + news.image : undefined,
      });
    }
  }, [newsData, reset]);

  // Read time & word count analysis
  const readAnalysis = useMemo(() => {
    const text = (formValues.description || "").replace(/<[^>]*>/g, "");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return {
      words,
      readTime: `${minutes} min read`,
    };
  }, [formValues.description]);

  const selectedCategoryLabel = useMemo(() => {
    const found = dynamicNewsCategoryOptions.find(
      (opt: any) => opt.value === formValues.category
    );
    return found ? found.label : "General";
  }, [formValues.category, dynamicNewsCategoryOptions]);

  const onSubmit = async (data: NewsFormValues) => {
    try {
      const formData = new FormData();
      const publishDateTime = `${data.pubDate}T${data.pubTime}:00Z`;

      const jsonData = {
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status,
        publishDateTime: publishDateTime,
      };

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateNews({ id: newsId, data: formData }).unwrap();
        if (res?.success || res?.statusCode === 200) {
          toast.success(res?.message || "News article updated successfully");
          router.push("/news-management");
        }
      } else {
        const res = await createNews(formData).unwrap();
        if (res?.success || res?.statusCode === 200) {
          toast.success(res?.message || "News article published successfully");
          router.push("/news-management");
        }
      }
    } catch (error: any) {
      toast.error(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} news article`
        )
      );
    }
  };

  const isSaving = isCreating || isUpdating;

  // Skeleton Loader for Edit Fetching State
  if (isEditMode && isFetching) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-6 w-56 bg-slate-200 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-20 bg-slate-200 rounded-md" />
            <div className="h-9 w-28 bg-slate-200 rounded-md" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-md" />
              <div className="h-10 w-full bg-slate-100 rounded-md" />
              <div className="h-48 w-full bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-100 rounded-md" />
            <div className="h-10 w-full bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Link
              href="/news-management"
              className="hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>News Management</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium">
              {isEditMode ? "Update Article" : "Create Article"}
            </span>
          </nav>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isEditMode ? "Update News Article" : "Create News Article"}
            </h1>
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                formValues.status === "publish"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : formValues.status === "schedule"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  formValues.status === "publish"
                    ? "bg-emerald-500"
                    : formValues.status === "schedule"
                    ? "bg-blue-500"
                    : "bg-slate-400"
                }`}
              />
              {formValues.status ? formValues.status.toUpperCase() : "DRAFT"}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? "Modify article body, category classifications, and publication schedules."
              : "Draft and broadcast official club updates to community media channels."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/news-management"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:scale-98 transition-all shadow-2xs"
          >
            Cancel
          </Link>

          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer select-none"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span>
              {isSaving
                ? "Saving..."
                : isEditMode
                ? "Update Article"
                : "Publish Article"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): Editorial Content & Media */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editorial Content Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Editorial Content
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Write headline, select category, and author the article text.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Newspaper className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* Headline */}
                <InputField
                  name="title"
                  title="Article Headline"
                  placeholder="Enter a compelling headline for this article..."
                  register={register}
                  error={errors.title}
                />

                {/* Category */}
                <SelectField
                  name="category"
                  label="Category Classification"
                  control={control}
                  error={errors.category}
                  options={dynamicNewsCategoryOptions}
                  placeholder="Select news category"
                  scrollable
                />

                {/* Article Body / Rich Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700">
                      Article Body Content <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-slate-400" />
                      {readAnalysis.words} words · {readAnalysis.readTime}
                    </span>
                  </div>

                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <div className="rounded-md overflow-hidden border border-slate-200 focus-within:border-slate-500 transition-colors">
                        <JoditEditor
                          value={field.value || ""}
                          config={joditConfig}
                          onBlur={(newContent) => field.onChange(newContent)}
                        />
                      </div>
                    )}
                  />
                  {errors.description && (
                    <p className="text-xs text-rose-500 font-medium mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Media Cover Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Cover Media Asset
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload a high-resolution cover image for public feeds (PNG, JPG, WebP max 5MB).
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <ImageUploadField
                  name="logo"
                  label="Featured Image"
                  control={control}
                  error={errors.logo as any}
                >
                  <ImageChildrenComponent maxSizeMB={5} />
                </ImageUploadField>
              </div>
            </div>
          </div>

          {/* Right Column (1 col): Scheduling & Live Summary */}
          <div className="space-y-6">
            {/* Scheduling Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs relative z-20">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Publication Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define publishing status and release timeline.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <SelectField
                  name="status"
                  label="Publishing Status"
                  control={control}
                  error={errors.status}
                  options={publishStatusOptions}
                />

                <Controller
                  name="pubDate"
                  control={control}
                  render={({ field }) => (
                    <CustomDatePicker
                      label="Release Date"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.pubDate?.message}
                      align="right"
                    />
                  )}
                />

                <Controller
                  name="pubTime"
                  control={control}
                  render={({ field }) => (
                    <CustomTimePicker
                      label="Release Time"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.pubTime?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Live Summary Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Article Preview
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Headline
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    {formValues.title || "—"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">
                      Category
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {selectedCategoryLabel}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">
                      Reading Time
                    </span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {readAnalysis.readTime}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Scheduled Date:</span>
                  <span className="font-medium text-slate-800">
                    {formValues.pubDate
                      ? dayjs(formValues.pubDate).format("DD MMM, YYYY")
                      : "Not set"}{" "}
                    · {formValues.pubTime || "00:00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Operational Note */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-4 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Editorial Guidelines</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Published articles immediately sync across the public mobile
                application and fan web portals. Use the &apos;Schedule&apos; status to
                stage embargoed announcements ahead of match kickoff.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Action Bar */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80">
          <Link
            href="/news-management"
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 active:scale-98 transition-all shadow-2xs"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer select-none"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-300" />
            )}
            <span>
              {isSaving
                ? "Saving Article..."
                : isEditMode
                ? "Update Article"
                : "Publish Article"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNews;
