/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import dayjs from "dayjs";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Copy,
  Info,
  Loader2,
  Trophy,
  AlertCircle,
  Shield,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import CustomDatePicker from "@/components/ui/CustomDatePicker";
import {
  useCreateLeagueMutation,
  useGetSingleLeagueQuery,
  useUpdateLeagueMutation,
} from "@/features/leagueManagement/leagueApi";
import { useHeaders } from "@/hooks/useHeaders";

const leagueSchema = z
  .object({
    leagueName: z
      .string()
      .trim()
      .min(2, "League Name must be at least 2 characters"),
    season: z
      .string()
      .trim()
      .min(2, "Season is required (e.g. 2025/2026 or 2026)"),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return dayjs(data.endDate).isAfter(dayjs(data.startDate)) ||
          dayjs(data.endDate).isSame(dayjs(data.startDate));
      }
      return true;
    },
    {
      message: "End date must be on or after the start date",
      path: ["endDate"],
    }
  );

type LeagueFormValues = z.infer<typeof leagueSchema>;

const CreateLeague = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("id");
  const isEditMode = Boolean(leagueId);

  const [copiedId, setCopiedId] = useState(false);

  const [createLeague, { isLoading: isCreating }] = useCreateLeagueMutation();
  const [updateLeague, { isLoading: isUpdating }] = useUpdateLeagueMutation();
  const { data: leagueData, isFetching } = useGetSingleLeagueQuery(leagueId, {
    skip: !isEditMode,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<LeagueFormValues>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      leagueName: "",
      season: "",
      startDate: "",
      endDate: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update League" : "Add New League",
      des: isEditMode
        ? "Modify tournament schedule, season details, and competition parameters."
        : "Register a new tournament season into the competition registry.",
    });
  }, [setHeaders, isEditMode]);

  useEffect(() => {
    if (leagueData?.data) {
      const league = leagueData.data;
      reset({
        leagueName: league.leagueName || "",
        season: league.season || "",
        startDate: league.startDate ? league.startDate.split("T")[0] : "",
        endDate: league.endDate ? league.endDate.split("T")[0] : "",
      });
    }
  }, [leagueData, reset]);

  // Projected Duration & Status calculation
  const timelineAnalysis = useMemo(() => {
    const { startDate, endDate } = formValues;
    if (!startDate || !endDate) return null;

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const now = dayjs();

    if (!start.isValid() || !end.isValid()) return null;

    const durationDays = end.diff(start, "day") + 1;
    const isInvalidRange = end.isBefore(start);

    let projectedStatus: "upcoming" | "running" | "finished" = "upcoming";
    let statusLabel = "Upcoming";
    let statusTheme = "bg-blue-50 text-blue-700 border-blue-200";
    let dotColor = "bg-blue-500";

    if (now.isBefore(start, "day")) {
      const daysUntil = start.diff(now, "day");
      projectedStatus = "upcoming";
      statusLabel = `Upcoming (Starts in ${daysUntil} ${daysUntil === 1 ? "day" : "days"})`;
      statusTheme = "bg-blue-50 text-blue-700 border-blue-200";
      dotColor = "bg-blue-500";
    } else if (now.isAfter(end, "day")) {
      const daysAgo = now.diff(end, "day");
      projectedStatus = "finished";
      statusLabel = `Finished (${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago)`;
      statusTheme = "bg-slate-100 text-slate-700 border-slate-200";
      dotColor = "bg-slate-400";
    } else {
      const daysElapsed = now.diff(start, "day") + 1;
      const daysRemaining = end.diff(now, "day");
      projectedStatus = "running";
      statusLabel = `Running (Day ${daysElapsed} of ${durationDays}, ${daysRemaining}d remaining)`;
      statusTheme = "bg-emerald-50 text-emerald-700 border-emerald-200";
      dotColor = "bg-emerald-500";
    }

    return {
      durationDays,
      isInvalidRange,
      projectedStatus,
      statusLabel,
      statusTheme,
      dotColor,
      formattedStart: start.format("DD MMM, YYYY"),
      formattedEnd: end.format("DD MMM, YYYY"),
    };
  }, [formValues.startDate, formValues.endDate]);

  const handleCopyId = () => {
    if (!leagueId) return;
    navigator.clipboard.writeText(leagueId);
    setCopiedId(true);
    toast.success("League ID copied to clipboard");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const onSubmit = async (data: LeagueFormValues) => {
    try {
      if (isEditMode) {
        const res = await updateLeague({ id: leagueId, data }).unwrap();
        if (res?.success || res?.statusCode === 200) {
          toast.success(res?.message || "League updated successfully");
          router.push("/league-management");
        }
      } else {
        const res = await createLeague(data).unwrap();
        if (res?.success || res?.statusCode === 200) {
          toast.success(res?.message || "League created successfully");
          router.push("/league-management");
        }
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          `Failed to ${isEditMode ? "update" : "create"} league`
      );
    }
  };

  // Skeleton Loader for Edit Fetching State
  if (isEditMode && isFetching) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-pulse">
        {/* Top bar skeleton */}
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

        {/* Form area skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 space-y-5">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-10 w-full bg-slate-100 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-14 bg-slate-100 rounded-md" />
              <div className="h-14 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg p-6 h-64 space-y-3">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const isSaving = isCreating || isUpdating;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
            <Link
              href="/league-management"
              className="hover:text-slate-800 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>League Registry</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700 font-medium">
              {isEditMode ? "Update League" : "Create League"}
            </span>
          </nav>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isEditMode ? "Update League Season" : "Add New League Season"}
            </h1>
            {isEditMode && timelineAnalysis && (
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${timelineAnalysis.statusTheme}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${timelineAnalysis.dotColor}`}
                />
                {timelineAnalysis.projectedStatus.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? "Modify competition timeframe, season identity, and scheduling parameters."
              : "Define tournament dates, season name, and official timeline."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/league-management"
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
                ? "Save Changes"
                : "Create League"}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Main Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Fields (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Details Panel */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Competition Identity
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official tournament title and season year classification.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                {/* League Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="leagueName"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      League / Tournament Name{" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Required</span>
                  </div>
                  <input
                    id="leagueName"
                    type="text"
                    {...register("leagueName")}
                    placeholder="e.g. Premier League or Championship"
                    className={`w-full h-10 px-3.5 text-xs sm:text-sm bg-white border rounded-md text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      errors.leagueName
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/5 hover:border-slate-300"
                    }`}
                  />
                  {errors.leagueName && (
                    <p className="text-xs text-rose-500 font-medium mt-1">
                      {errors.leagueName.message}
                    </p>
                  )}
                </div>

                {/* Season Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="season"
                      className="block text-xs font-semibold text-slate-700"
                    >
                      Season Identifier <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      e.g. 2025/2026 or 2026
                    </span>
                  </div>
                  <input
                    id="season"
                    type="text"
                    {...register("season")}
                    placeholder="e.g. 2025-2026"
                    className={`w-full h-10 px-3.5 text-xs sm:text-sm bg-white border rounded-md text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      errors.season
                        ? "border-rose-400 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/5 hover:border-slate-300"
                    }`}
                  />
                  {errors.season && (
                    <p className="text-xs text-rose-500 font-medium mt-1">
                      {errors.season.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Schedule & Timeline Panel */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs relative z-20">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Competition Schedule
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Start and completion dates define tournament active status
                    and fixture scheduling.
                  </p>
                </div>
                <div className="w-7 h-7 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="Tournament Start Date"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.startDate?.message}
                      />
                    )}
                  />

                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="Tournament End Date"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.endDate?.message}
                        align="right"
                      />
                    )}
                  />
                </div>

                {/* Timeline Duration Metric Strip */}
                {timelineAnalysis && (
                  <div
                    className={`mt-3 p-3.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      timelineAnalysis.isInvalidRange
                        ? "bg-rose-50/70 border-rose-200 text-rose-800"
                        : "bg-slate-50/80 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>
                        <strong className="font-semibold text-slate-900">
                          {timelineAnalysis.durationDays > 0
                            ? `${timelineAnalysis.durationDays} Days`
                            : "Invalid Range"}
                        </strong>{" "}
                        duration ({timelineAnalysis.formattedStart} →{" "}
                        {timelineAnalysis.formattedEnd})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[11px] text-slate-500">
                        Status:
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${timelineAnalysis.statusTheme}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${timelineAnalysis.dotColor}`}
                        />
                        {timelineAnalysis.statusLabel}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live Summary & Operations Metadata */}
          <div className="space-y-6">
            {/* Live Season Summary Card */}
            <div className="bg-white rounded-lg border border-slate-200/80 shadow-2xs p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Summary Preview
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  Live
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    League Name
                  </span>
                  <span className="font-semibold text-slate-900 mt-0.5 block truncate">
                    {formValues.leagueName || "—"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">
                      Season
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {formValues.season || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-400">
                      Duration
                    </span>
                    <span className="font-semibold text-slate-900 mt-0.5 block">
                      {timelineAnalysis && !timelineAnalysis.isInvalidRange
                        ? `${timelineAnalysis.durationDays} days`
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Start:</span>
                    <span className="font-medium text-slate-800">
                      {formValues.startDate
                        ? dayjs(formValues.startDate).format("DD MMM, YYYY")
                        : "Not set"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Conclusion:</span>
                    <span className="font-medium text-slate-800">
                      {formValues.endDate
                        ? dayjs(formValues.endDate).format("DD MMM, YYYY")
                        : "Not set"}
                    </span>
                  </div>
                </div>

                {isEditMode && leagueId && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="block text-[11px] font-medium text-slate-400 mb-1">
                      System League ID
                    </span>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-200/80">
                      <span className="font-mono text-[11px] text-slate-700 truncate mr-2">
                        {leagueId}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyId}
                        className="text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
                        title="Copy League ID"
                      >
                        {copiedId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Operational Guidelines Note */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-4 text-xs space-y-2 text-slate-600">
              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>Operational Note</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Updating league dates automatically recalculates tournament
                status across match fixtures, team registrations, and point
                tables. Ensure start and end dates accommodate all scheduled match
                rounds and playoff brackets.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bottom Action Bar on Mobile / Desktop */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80">
          <Link
            href="/league-management"
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
                ? "Saving Changes..."
                : isEditMode
                ? "Update League Season"
                : "Create League Season"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateLeague;
