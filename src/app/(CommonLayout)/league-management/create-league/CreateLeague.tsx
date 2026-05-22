/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton';
import InputField from '@/components/form/InputField';
import { useHeaders } from '@/hooks/useHeaders';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

import SubmitButton from '@/components/buttons/SubmitButton';
import { useCreateLeagueMutation, useGetSingleLeagueQuery, useUpdateLeagueMutation } from '@/features/leagueManagement/leagueApi';
import { useRouter, useSearchParams } from 'next/navigation';

const leagueSchema = z.object({
  leagueName: z.string().min(1, "League Name is required"),
  season: z.string().min(1, "Season is required"),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
});

type LeagueFormValues = z.infer<typeof leagueSchema>;

const CreateLeague = () => {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("id");
  const isEditMode = !!leagueId;

  const [createLeague, { isLoading: isCreating }] = useCreateLeagueMutation();
  const [updateLeague, { isLoading: isUpdating }] = useUpdateLeagueMutation();
  const { data: leagueData, isFetching } = useGetSingleLeagueQuery(leagueId, { skip: !isEditMode });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeagueFormValues>({
    resolver: zodResolver(leagueSchema),
    defaultValues: {
      leagueName: "",
      season: "",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Update League" : "Add New League",
      des: isEditMode
        ? "Modify existing league season details."
        : "Register a new league season into the system.",
    });
  }, [setHeaders, isEditMode]);

  useEffect(() => {
    if (leagueData?.data) {
      const league = leagueData.data;
      reset({
        leagueName: league.leagueName,
        season: league.season,
        startDate: league.startDate?.split("T")[0] ?? "",
        endDate: league.endDate?.split("T")[0] ?? "",
      });
    }
  }, [leagueData, reset]);

  const onSubmit = async (data: LeagueFormValues) => {
    try {
      if (isEditMode) {
        const res = await updateLeague({ id: leagueId, data }).unwrap();
        if (res.success) {
          toast.success(res.message || "League updated successfully");
          router.push("/league-management");
        }
      } else {
        const res = await createLeague(data).unwrap();
        if (res.success) {
          toast.success(res.message || "League created successfully");
          router.push("/league-management");
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? "update" : "create"} league`);
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-gray-500 font-medium">
        Loading league data...
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="py-5 px-6 space-y-8"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <BackButton />
        <SubmitButton
          isSubmitting={isCreating || isUpdating}
          title={isEditMode ? "Update League" : "Create League"}
        />
      </div>

      {/* Form Card */}
      <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 text-gray-800 max-w-5xl">
        <h2 className="text-2xl font-medium text-gray-900 mb-8">League Details</h2>

        <div className="space-y-6">
          <InputField
            name="leagueName"
            title="League Name"
            placeholder="e.g. Dhaka Premier League"
            register={register}
            error={errors.leagueName}
          />

          <InputField
            name="season"
            title="Season"
            placeholder="e.g. 2026"
            register={register}
            error={errors.season}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              name="startDate"
              type="date"
              title="Start Date"
              placeholder="YYYY-MM-DD"
              register={register}
              error={errors.startDate}
            />
            <InputField
              name="endDate"
              type="date"
              title="End Date"
              placeholder="YYYY-MM-DD"
              register={register}
              error={errors.endDate}
            />
          </div>
        </div>
      </section>
    </form>
  );
};

export default CreateLeague;
