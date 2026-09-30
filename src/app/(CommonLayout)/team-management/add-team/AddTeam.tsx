/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { ArrowLeft, Shield, MapPin, Users } from "lucide-react";

import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import ImageUploadField, {
  ImageChildrenComponent,
} from "@/components/form/ImageUploadField";
import { useHeaders } from "@/hooks/useHeaders";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { baseURL } from "@/utils/BaseURL";
import {
  useCreateTeamMutation,
  useGetSingleTeamQuery,
  useUpdateTeamMutation,
} from "@/features/teamManagement/teamApi";
import {
  useAssignTeamManagerMutation,
  useRemoveTeamManagerMutation,
  useGetAllManagerTeamQuery,
} from "@/features/managerTeam/managerTeamApi";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllAgeGroupQuery } from "@/features/categoryManagement/categoryApi";

// Form Validation Schema
const addTeamSchema = z.object({
  logo: z.any().optional(),
  teamName: z.string().min(1, "Team Name is required"),
  shortName: z.string().min(1, "Short Name is required"),
  teamType: z.string().min(1, "Team Type is required"),
  ageGroup: z.string().optional(),
  league: z.string().optional(),
  manager: z.string().optional(),
  stadiumName: z.string().min(1, "Stadium name is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

type AddTeamFormValues = z.infer<typeof addTeamSchema>;

const AddTeam = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get("id");
  const isEditMode = !!teamId;

  const [createTeam, { isLoading: isCreating }] = useCreateTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();
  const [assignTeamManager, { isLoading: isAssigning }] =
    useAssignTeamManagerMutation();
  const [removeTeamManager, { isLoading: isRemoving }] =
    useRemoveTeamManagerMutation();

  const { data: teamData, isLoading: isFetching } = useGetSingleTeamQuery(
    teamId,
    {
      skip: !isEditMode,
    }
  );
  const { data: leaguesData } = useGetAllLeagueQuery({ limit: 100 });
  const { data: managersData } = useGetAllManagerTeamQuery({ limit: 100 });
  const { data: ageGroupsData } = useGetAllAgeGroupQuery({});

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddTeamFormValues>({
    resolver: zodResolver(addTeamSchema),
    defaultValues: {
      teamName: "",
      shortName: "",
      teamType: "Football",
      ageGroup: "",
      league: "",
      manager: "",
      stadiumName: "",
      city: "",
      country: "",
    },
  });

  const teamTypeOptions = [
    { value: "Football", label: "Football" },
    { value: "Futsal", label: "Futsal" },
    { value: "Academy", label: "Academy" },
  ];

  const leagueOptions = useMemo(() => {
    const list = leaguesData?.data?.result || leaguesData?.data || [];
    return list.map((l: any) => ({
      value: l._id,
      label: l.leagueName,
    }));
  }, [leaguesData]);

  const managerOptions = useMemo(() => {
    const list = managersData?.data?.result || managersData?.data || [];
    return list.map((m: any) => ({
      value: m._id,
      label: `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.userName,
    }));
  }, [managersData]);

  const ageGroupOptions = useMemo(() => {
    const list = ageGroupsData?.data?.result || ageGroupsData?.data || [];
    return list.map((ag: any) => ({
      value: ag.name || ag.slug,
      label: ag.name,
    }));
  }, [ageGroupsData]);

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update Team" : "Add Team",
      des: isEditMode
        ? "Modify existing squad details and brand identity."
        : "Register a new squad into the league management system.",
    });
  }, [setHeaders, isEditMode]);

  useEffect(() => {
    if (teamData?.data) {
      const team = teamData.data;
      reset({
        teamName: team.teamName || "",
        shortName: team.shortName || "",
        teamType: team.teamType || "Football",
        ageGroup: team.ageGroup || "",
        league: team.league?._id || team.league || "",
        manager: team.managers?.[0]?.manager?._id || "",
        stadiumName: team.stadiumName || team.stadium || "",
        city: team.city || team.location || "",
        country: team.country || "",
        logo: team.teamLogo ? `${baseURL}${team.teamLogo}` : undefined,
      });
    }
  }, [teamData, reset]);

  // Re-set manager and league after options load
  useEffect(() => {
    if (isEditMode && teamData?.data) {
      if (managersData?.data) {
        setValue("manager", teamData.data.managers?.[0]?.manager?._id || "");
      }
      if (teamData.data.league) {
        setValue("league", teamData.data.league?._id || teamData.data.league || "");
      }
    }
  }, [isEditMode, teamData, managersData, setValue]);

  const onSubmit = async (data: AddTeamFormValues) => {
    try {
      const formData = new FormData();

      const jsonData: any = {
        teamName: data.teamName,
        shortName: data.shortName,
        teamType: data.teamType,
        stadiumName: data.stadiumName,
        city: data.city,
        country: data.country,
        ageGroup: data.ageGroup || undefined,
      };

      if (data.league && data.league.trim() !== "") {
        jsonData.league = data.league;
      }

      formData.append("data", JSON.stringify(jsonData));

      if (data.logo instanceof File) {
        formData.append("image", data.logo);
      }

      if (isEditMode) {
        const res = await updateTeam({ id: teamId, data: formData }).unwrap();
        if (res.success) {
          if (data.manager && data.manager.trim() !== "") {
            await assignTeamManager({
              manager: data.manager,
              team: teamId,
            }).unwrap();
          } else {
            await removeTeamManager(teamId).unwrap();
          }
          toast.success(res.message || "Team updated successfully");
          router.push("/team-management");
        }
      } else {
        const res = await createTeam(formData).unwrap();
        if (res.success) {
          if (data.manager && data.manager.trim() !== "") {
            await assignTeamManager({
              manager: data.manager,
              team: res.data._id,
            }).unwrap();
          }
          toast.success(res.message || "Team created successfully");
          router.push("/team-management");
        }
      }
    } catch (error: any) {
      toast.error(
        getErrorMessage(error, `Failed to ${isEditMode ? "update" : "create"} team`)
      );
    }
  };

  const isSubmitting =
    isCreating || isUpdating || isAssigning || isRemoving;

  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs text-slate-500 font-medium">
        Loading squad details...
      </div>
    );
  }

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
          <span>Back to Squads</span>
        </button>
        <span className="text-xs text-slate-400 font-medium">
          {isEditMode ? "Edit Squad Identity" : "New Team Registration"}
        </span>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Squad Identity & Ground */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Details Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Squad Information
              </h2>
              <span className="text-[11px] text-slate-400">
                Required fields are indicated
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  name="teamName"
                  type="string"
                  title="Team Name"
                  placeholder="e.g. Manchester Kings FC"
                  register={register}
                  error={errors.teamName}
                />
                <InputField
                  name="shortName"
                  type="string"
                  title="Short Name / Code"
                  placeholder="e.g. MKFC"
                  register={register}
                  error={errors.shortName}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="teamType"
                  label="Team Type"
                  control={control}
                  error={errors.teamType}
                  options={teamTypeOptions}
                />

                <SelectField
                  name="ageGroup"
                  label="Age Group"
                  placeholder="Select age group (e.g. U12)"
                  control={control}
                  error={errors.ageGroup}
                  options={ageGroupOptions}
                  scrollable
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SelectField
                  name="league"
                  label="Associated League (Optional)"
                  placeholder="Select a league"
                  control={control}
                  error={errors.league}
                  options={leagueOptions}
                  scrollable
                />

                <SelectField
                  name="manager"
                  label="Team Manager (Optional)"
                  placeholder="Select a manager"
                  control={control}
                  error={errors.manager}
                  options={managerOptions}
                  scrollable
                />
              </div>
            </div>
          </div>

          {/* Location & Stadium Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 sm:p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Location & Home Stadium
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Specify ground details and geographical presence
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                name="stadiumName"
                type="string"
                title="Home Stadium / Ground"
                placeholder="e.g. Wembley Community Ground, Pitch 1"
                register={register}
                error={errors.stadiumName}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  name="city"
                  type="string"
                  title="City / Borough"
                  placeholder="e.g. London"
                  register={register}
                  error={errors.city}
                />
                <InputField
                  name="country"
                  type="string"
                  title="Country"
                  placeholder="e.g. United Kingdom"
                  register={register}
                  error={errors.country}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Crest & Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Team Crest Section */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              Official Team Crest
            </h2>
            <ImageUploadField
              name="logo"
              label="Team Logo (Square SVG/PNG recommended)"
              control={control}
              error={errors.logo as any}
              accept="image/*"
            >
              <ImageChildrenComponent maxSizeMB={4} />
            </ImageUploadField>
          </div>

          {/* Action Footer */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => router.push("/team-management")}
              className="px-4 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium rounded-md bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting && (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditMode ? "Save Changes" : "Register Team"}</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddTeam;
