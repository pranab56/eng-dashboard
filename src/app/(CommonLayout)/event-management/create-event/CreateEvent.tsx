/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Send,
  CalendarDays,
} from "lucide-react";

import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import TextareaField from "@/components/form/TextareaField";
import ImageUploadField, {
  ImageChildrenComponent,
} from "@/components/form/ImageUploadField";
import { publishStatusOptions } from "@/constants/selectData";
import { useHeaders } from "@/hooks/useHeaders";
import { getErrorMessage } from "@/utils/getErrorMessage";
import {
  useCreateEventMutation,
  useEditeventMutation,
  useSingleEventQuery,
} from "@/features/eventManagement/eventApi";

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

type EventFormValues = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const isEditMode = !!eventId;

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useEditeventMutation();
  const { data: eventData, isLoading: isFetching } = useSingleEventQuery(
    eventId,
    {
      skip: !isEditMode,
    }
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      status: "publish",
      eventDate: "",
      eventTime: "",
      pubDate: "",
      pubTime: "",
    },
  });

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Edit Event" : "Create Event",
      des: isEditMode
        ? "Update details, location, and matchday scheduling."
        : "Add a new matchday, cup tournament, or club event.",
    });
  }, [isEditMode, setHeaders]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditMode && eventData?.data) {
      const ev = eventData.data;
      setValue("title", ev.title || "");
      setValue("description", ev.description || "");
      setValue("location", ev.location || "");
      setValue("status", ev.status || "publish");

      if (ev.eventDate) {
        setValue("eventDate", dayjs(ev.eventDate).format("YYYY-MM-DD"));
        setValue("eventTime", dayjs(ev.eventDate).format("HH:mm"));
      }

      if (ev.publishDateTime) {
        setValue("pubDate", dayjs(ev.publishDateTime).format("YYYY-MM-DD"));
        setValue("pubTime", dayjs(ev.publishDateTime).format("HH:mm"));
      }
    }
  }, [isEditMode, eventData, setValue]);

  const onSubmit = async (data: EventFormValues) => {
    try {
      const jsonData = {
        title: data.title,
        description: data.description,
        location: data.location,
        status: data.status,
        eventDate: `${data.eventDate}T${data.eventTime}:00.000Z`,
        publishDateTime: `${data.pubDate}T${data.pubTime}:00.000Z`,
      };

      const formData = new FormData();
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
      toast.error(
        getErrorMessage(
          error,
          `Failed to ${isEditMode ? "update" : "create"} event`
        )
      );
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs text-slate-500 font-medium">
        Loading event details...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-6 px-6 sm:px-8 space-y-6 max-w-[1500px] mx-auto"
    >
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Event Registry</span>
        </button>
        <span className="text-xs text-slate-400 font-medium">
          {isEditMode ? "Edit Event Mode" : "New Event Registration"}
        </span>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Content & Media */}
        <div className="lg:col-span-8 space-y-6">
          {/* Basic Details Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Event Content
              </h2>
              <span className="text-[11px] text-slate-400">
                Required fields are indicated
              </span>
            </div>

            <div className="space-y-4">
              <InputField
                name="title"
                title="Event Title"
                placeholder="e.g. London Summer Cup - Opening Ceremony"
                register={register}
                error={errors.title}
              />

              <InputField
                name="location"
                title="Event Location / Venue Address"
                placeholder="e.g. Southall Sports Complex, Pitch 2"
                register={register}
                error={errors.location}
              />

              <TextareaField
                name="description"
                title="Event Description"
                placeholder="Provide event details, schedule information, participating categories..."
                register={register}
                error={errors.description}
              />
            </div>
          </div>

          {/* Media Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Cover Media
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload a banner or cover photo for this event
              </p>
            </div>

            <ImageUploadField
              name="logo"
              label="Event Cover Image"
              control={control}
              error={errors.logo as any}
            >
              <ImageChildrenComponent maxSizeMB={5} />
            </ImageUploadField>
          </div>
        </div>

        {/* Right Column (4 cols): Schedule & Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Publish Settings
            </h2>

            <div className="space-y-3">
              <SelectField
                name="status"
                label="Publishing Status"
                control={control}
                error={errors.status}
                options={publishStatusOptions}
              />

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Release Schedule
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

          {/* Event Schedule Date/Time */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Event Schedule
            </h2>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <InputField
                  name="eventDate"
                  type="date"
                  title="Event Date"
                  register={register}
                  error={errors.eventDate}
                />
                <InputField
                  name="eventTime"
                  type="time"
                  title="Event Time"
                  register={register}
                  error={errors.eventTime}
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-4 py-2 text-xs font-medium rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {(isCreating || isUpdating) && (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditMode ? "Update Event" : "Publish Event"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateEvent;
