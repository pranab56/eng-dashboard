/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import InputField from '@/components/form/InputField'
import SelectField from '@/components/form/SelectField'
import { durationOptions } from '@/constants/selectData'
import { useCreateMatchMutation, useGetSingleMatchQuery, useUpdateMatchMutation } from '@/features/match/matchApi'
import { useGetAllLeagueQuery } from '@/features/leagueManagement/leagueApi'
import { useGetRefereeQuery } from '@/features/referee/refereeApi'
import { useGetAllTeamQuery } from '@/features/teamManagement/teamApi'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { TeamCard } from './MatchupSelector'

// Form Validation Schema
const createMatchSchema = z.object({
  venueName: z.string().min(1, "Venue is required"),
  league: z.string().min(1, "League is required"),
  referee: z.string().min(1, "Referee is required"),
  durationMinutes: z.string().min(1, "Duration is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

type CreateMatchFormValues = z.infer<typeof createMatchSchema>

export interface Team {
  value: string;
  name: string;
  logo: string | null;
}

const CreateMatch = () => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const isEditMode = !!matchId;

  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const { setHeaders } = useHeaders()
  const router = useRouter();

  const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();
  const [updateMatch, { isLoading: isUpdating }] = useUpdateMatchMutation();
  const { data: matchData, isFetching } = useGetSingleMatchQuery(matchId, { skip: !isEditMode });
  const { data: leagueData } = useGetAllLeagueQuery(undefined);
  const { data: refereeData } = useGetRefereeQuery(undefined);
  const { data: teamData } = useGetAllTeamQuery(undefined);

  // Build option lists from API data
  const leagueOptions = (leagueData?.data || []).map((l: any) => ({
    label: `${l.leagueName} (${l.season})`,
    value: l._id,
  }));

  const refereeOptions = (refereeData?.data || []).map((r: any) => ({
    label: r.userName,
    value: r._id,
  }));

  const teamsList: Team[] = (teamData?.data || []).map((t: any) => ({
    value: t._id,
    name: t.teamName,
    logo: t.teamLogo || null,
  }));

  // Auto-initialize home/away team once API data loads (create mode only)
  useEffect(() => {
    if (!isEditMode && teamsList.length >= 2 && !homeTeam && !awayTeam) {
      setHomeTeam(teamsList[0]);
      setAwayTeam(teamsList[1]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      venueName: "",
      league: "",
      referee: "",
      durationMinutes: "90",
      date: "",
      time: "",
    }
  })

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Edit Match" : "Create Match",
      des: isEditMode ? "Update details for this match." : "Set up a new matchup between teams in the league."
    })
  }, [setHeaders, isEditMode])

  useEffect(() => {
    if (matchData?.data) {
      const match = matchData.data;
      const date = dayjs(match.matchDate);

      reset({
        venueName: match.venueName,
        league: typeof match.league === 'string' ? match.league : match.league?._id,
        referee: typeof match.referee === 'string' ? match.referee : match.referee?._id,
        durationMinutes: match.durationMinutes.toString(),
        date: date.format("YYYY-MM-DD"),
        time: date.format("HH:mm"),
      });

      if (match.homeTeam) {
        setHomeTeam({
          value: match.homeTeam._id || match.homeTeam,
          name: match.homeTeam.teamName || "Home Team",
          logo: match.homeTeam.teamLogo || null,
        });
      }
      if (match.awayTeam) {
        setAwayTeam({
          value: match.awayTeam._id || match.awayTeam,
          name: match.awayTeam.teamName || "Away Team",
          logo: match.awayTeam.teamLogo || null,
        });
      }
    }
  }, [matchData, reset])


  const onSubmit = async (data: CreateMatchFormValues) => {
    // Validate teams are selected
    if (!homeTeam || !awayTeam) {
      toast.error("Please select both home and away teams");
      return;
    }

    // Validate teams are different
    if (homeTeam.value === awayTeam.value) {
      toast.error("Home team and away team cannot be the same!");
      return;
    }

    try {
      const matchDate = `${data.date}T${data.time}:00Z`;

      const payload = {
        league: data.league,
        homeTeam: homeTeam.value,
        awayTeam: awayTeam.value,
        matchDate,
        durationMinutes: parseInt(data.durationMinutes),
        venueName: data.venueName,
        referee: data.referee,
      };

      if (isEditMode) {
        const res = await updateMatch({ id: matchId, data: payload }).unwrap();
        if (res.success) {
          toast.success(res.message || "Match updated successfully")
          router.push("/match-management")
        }
      } else {
        const res = await createMatch(payload).unwrap();
        if (res.success) {
          toast.success(res.message || "Match created successfully")
          router.push("/match-management")
        }
      }
    } catch (error: any) {
      toast.error(error?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} match`)
    }
  }

  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading match data...</div>
  }

  // Teams filtered to prevent same-team selection
  const homeTeamOptions = teamsList.filter(t => t.value !== awayTeam?.value);
  const awayTeamOptions = teamsList.filter(t => t.value !== homeTeam?.value);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='flex-1 space-y-4'>
          {/* Match Settings Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Match Setting</h2>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SelectField
                  name="league"
                  label="League"
                  control={control}
                  error={errors.league}
                  options={leagueOptions}
                  placeholder="Select league"
                />
                <SelectField
                  name="referee"
                  label="Referee"
                  control={control}
                  error={errors.referee}
                  options={refereeOptions}
                  placeholder="Select referee"
                />
              </div>
              <InputField name="venueName" placeholder='Enter venue name' title="Venue Name" register={register} error={errors.venueName} />
            </div>
          </section>

          {/* Teams Selection Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Matchup Selection</h2>
            <p className="text-sm text-gray-400 mb-8">Home and away teams must be different.</p>

            <div className="flex items-center justify-center gap-8 p-8 bg-white rounded-2xl max-w-4xl mx-auto">

              {/* Home Team Card */}
              <TeamCard
                teams={homeTeamOptions}
                label="TEAM A (HOME)"
                selectedTeam={homeTeam}
                onSelect={setHomeTeam}
              />

              {/* VS Badge */}
              <div className="z-10 -my-4 md:my-0 md:-mx-6 flex-shrink-0">
                <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                  VS
                </div>
              </div>

              {/* Away Team Card */}
              <TeamCard
                teams={awayTeamOptions}
                label="TEAM B (AWAY)"
                selectedTeam={awayTeam}
                onSelect={setAwayTeam}
              />
            </div>

            {/* Same team warning */}
            {homeTeam && awayTeam && homeTeam.value === awayTeam.value && (
              <p className="text-center text-red-500 text-sm font-semibold mt-4">
                ⚠️ Home and away teams cannot be the same!
              </p>
            )}
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
            <CancelButton onClick={() => reset()} title="Reset" />
            <SubmitButton isSubmitting={isCreating || isUpdating} title={isEditMode ? "Update Match" : "Create Match"} />
          </div>
        </div>

        {/* Right Side Schedule */}
        <div className='basis-[30%] space-y-4'>
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Schedule</h2>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <InputField name="date" type='date' title="Match Date" register={register} error={errors.date} />
                <InputField name="time" type='time' title="Kick-off Time" register={register} error={errors.time} />
                <SelectField name="durationMinutes" label="Duration" control={control} error={errors.durationMinutes} options={durationOptions} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}

export default CreateMatch;