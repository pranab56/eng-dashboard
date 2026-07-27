/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import SelectField from '@/components/form/SelectField'
import { useCreateMatchMutation, useGetSingleMatchQuery, useUpdateMatchMutation } from '@/features/match/matchApi'
import { useGetRefereeQuery } from '@/features/referee/refereeApi'
import { useHeaders } from '@/hooks/useHeaders'
import { formatImagePath } from '@/utils/formatImagePath'
import { zodResolver } from '@hookform/resolvers/zod'
import dayjs from 'dayjs'
import { Calendar, Clock, Loader2, MapPin, Pencil, Trash2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { getErrorMessage } from '@/utils/getErrorMessage'
import * as z from 'zod'
import InputField from '../../../../components/form/InputField'
import { durationOptions } from '../../../../constants/selectData'
import { useGetAllLeagueTeamQuery } from '../../../../features/leagueTeam/leagueTeamApi'
import { TeamCard } from './MatchupSelector'

// Form Validation Schema
const createMatchSchema = z.object({
  venue: z.string().min(1, "Venue is required"),
  pitch: z.string().min(1, "Pitch is required"),
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

export interface TempMatch {
  id: string;
  payload: {
    league: string;
    homeTeam: string;
    awayTeam: string;
    matchDate: string;
    durationMinutes: number;
    venueName: string;
    referee: string;
  };
  display: {
    leagueName: string;
    homeTeamName: string;
    homeTeamLogo: string | null;
    awayTeamName: string;
    awayTeamLogo: string | null;
    refereeName: string;
    date: string;
    time: string;
    durationMinutes: string;
    venue: string;
    pitch: string;
  };
}

const venueOptions = [
  { label: "CranFord OutDoor 3G", value: "CranFord OutDoor 3G" },
  { label: "CranFord Indoor Dome", value: "CranFord Indoor Dome" },
  { label: "ENG FeatherStone 3G", value: "ENG FeatherStone 3G" },
];

const pitchOptions = [
  { label: "PITCH A", value: "PITCH A" },
  { label: "PITCH B", value: "PITCH B" },
  { label: "PITCH C", value: "PITCH C" },
  { label: "PITCH D", value: "PITCH D" },
  { label: "PITCH E", value: "PITCH E" },
];

const CreateMatch = () => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const isEditMode = !!matchId;

  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const { setHeaders } = useHeaders()
  const router = useRouter();

  const [tempMatches, setTempMatches] = useState<TempMatch[]>([]);
  const [editingTempId, setEditingTempId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("temp_matches");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTempMatches(parsed);
            const lastMatch = parsed[parsed.length - 1];
            if (lastMatch?.display && !isEditMode) {
              reset({
                venue: lastMatch.display.venue || "",
                pitch: lastMatch.display.pitch || "",
                league: lastMatch.payload.league || "",
                referee: lastMatch.payload.referee || "",
                durationMinutes: lastMatch.display.durationMinutes || "90 Minutes",
                date: lastMatch.display.date || "",
                time: lastMatch.display.time || "",
              });
            }
          }
        } catch (e) {
          console.error("Failed to parse stored matches", e);
        }
      }
      setIsHydrated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage only after hydration to avoid overwriting on mount
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("temp_matches", JSON.stringify(tempMatches));
    }
  }, [tempMatches, isHydrated]);

  const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();
  const [updateMatch, { isLoading: isUpdating }] = useUpdateMatchMutation();
  const { data: matchData, isFetching } = useGetSingleMatchQuery(matchId, { skip: !isEditMode });

  // Single source of truth: league-team API
  const { data: leagueTeamData } = useGetAllLeagueTeamQuery(1);
  const { data: refereeData } = useGetRefereeQuery(undefined);

  // All entries: [{ league: {...}, teams: [...] }]
  const leagueTeamList: any[] = leagueTeamData?.data || [];

  // Build league options for the dropdown
  const leagueOptions = leagueTeamList.map((item: any) => ({
    label: `${item.league.leagueName} (${item.league.season})`,
    value: item.league._id,
  }));

  const refereeOptions = (refereeData?.data || []).map((r: any) => ({
    label: r.userName,
    value: r._id,
  }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      venue: "",
      pitch: "",
      league: "",
      referee: "",
      durationMinutes: "90 Minutes",
      date: "",
      time: "",
    }
  })

  // Watch the selected league value
  const selectedLeagueId = watch("league");
  const selectedVenue = watch("venue");

  const [prevVenue, setPrevVenue] = useState(selectedVenue);
  useEffect(() => {
    if (prevVenue && selectedVenue !== prevVenue) {
      setValue("pitch", "");
    }
    setPrevVenue(selectedVenue);
  }, [selectedVenue, prevVenue, setValue]);

  // Derive teams for the selected league
  const selectedLeagueEntry = leagueTeamList.find(
    (item: any) => item.league._id === selectedLeagueId
  );
  const teamsList: Team[] = (selectedLeagueEntry?.teams || []).map((t: any) => ({
    value: t._id,
    name: t.teamName,
    logo: t.teamLogo || null,
  }));

  // Reset home/away whenever the league changes (only if it changes from one populated value to another)
  const [prevLeagueId, setPrevLeagueId] = useState(selectedLeagueId);
  useEffect(() => {
    if (prevLeagueId && selectedLeagueId !== prevLeagueId) {
      setHomeTeam(null);
      setAwayTeam(null);
    }
    setPrevLeagueId(selectedLeagueId);
  }, [selectedLeagueId, prevLeagueId]);

  // Auto-pick first two teams in create mode once teams load (only if not editing a temp match)
  useEffect(() => {
    if (!isEditMode && !editingTempId && teamsList.length >= 2 && !homeTeam && !awayTeam) {
      setHomeTeam(teamsList[0]);
      setAwayTeam(teamsList[1]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeagueId, leagueTeamData, editingTempId]);

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Edit Match" : "Create Match",
      des: isEditMode ? "Update details for this match." : "Set up a new matchup between teams in the league."
    })
  }, [setHeaders, isEditMode])

  // Populate form in edit mode
  useEffect(() => {
    if (matchData?.data) {
      const match = matchData.data;
      const date = dayjs(match.matchDate);

      let venue = "";
      let pitch = "";
      if (match.venueName) {
        const regex = /^(.*?)\s*\((PITCH\s+[A-E])\)$/i;
        const matchResult = match.venueName.match(regex);
        if (matchResult) {
          venue = matchResult[1].trim();
          pitch = matchResult[2].toUpperCase();
        } else {
          venue = match.venueName;
        }
      }

      reset({
        venue: venue,
        pitch: pitch,
        league: typeof match.league === 'string' ? match.league : match.league?._id,
        referee: typeof match.referee === 'string' ? match.referee : match.referee?._id,
        durationMinutes: `${match.durationMinutes} Minutes`,
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


  const handleCancelOrReset = () => {
    setHomeTeam(null);
    setAwayTeam(null);
    if (editingTempId) {
      setEditingTempId(null);
      toast.info("Edit cancelled");
    } else {
      toast.info("Team selections cleared");
    }
  };

  const handleFullReset = () => {
    reset({
      venue: "",
      pitch: "",
      league: "",
      referee: "",
      durationMinutes: "90 Minutes",
      date: "",
      time: "",
    });
    setHomeTeam(null);
    setAwayTeam(null);
    if (editingTempId) {
      setEditingTempId(null);
    }
    toast.info("All form fields cleared");
  };

  const handleEditTempMatch = (match: TempMatch) => {
    setEditingTempId(match.id);

    // Set form fields
    reset({
      venue: match.display.venue,
      pitch: match.display.pitch,
      league: match.payload.league,
      referee: match.payload.referee,
      durationMinutes: match.display.durationMinutes,
      date: match.display.date,
      time: match.display.time,
    });

    // Set home and away teams
    setHomeTeam({
      value: match.payload.homeTeam,
      name: match.display.homeTeamName,
      logo: match.display.homeTeamLogo
    });
    setAwayTeam({
      value: match.payload.awayTeam,
      name: match.display.awayTeamName,
      logo: match.display.awayTeamLogo
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteTempMatch = (id: string) => {
    setTempMatches(prev => prev.filter(m => m.id !== id));
    if (editingTempId === id) {
      setEditingTempId(null);
      setHomeTeam(null);
      setAwayTeam(null);
    }
    toast.info("Match removed from queue");
  };

  const handleCreateMatches = async () => {
    if (tempMatches.length === 0) {
      toast.error("Please add at least one match to the queue");
      return;
    }

    try {
      const payloads = tempMatches.map(m => m.payload);
      const res = await createMatch(payloads).unwrap();
      if (res.success) {
        toast.success(res.message || "All matches created successfully!");
        setTempMatches([]);
        localStorage.removeItem("temp_matches");
        router.push("/match-management");
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, "Failed to create matches"));
    }
  };

  const onSubmit = async (formData: CreateMatchFormValues) => {
    if (!homeTeam || !awayTeam) {
      toast.error("Please select both home and away teams");
      return;
    }
    if (homeTeam.value === awayTeam.value) {
      toast.error("Home team and away team cannot be the same!");
      return;
    }

    try {
      const matchDate = `${formData.date}T${formData.time}:00Z`;
      const venueNameCombined = `${formData.venue} (${formData.pitch})`;

      const payload = {
        league: formData.league,
        homeTeam: homeTeam.value,
        awayTeam: awayTeam.value,
        matchDate,
        durationMinutes: parseInt(formData.durationMinutes),  // "90 Minutes" → 95
        venueName: venueNameCombined,
        referee: formData.referee,
      };

      if (isEditMode) {
        const res = await updateMatch({ id: matchId, data: payload }).unwrap();
        if (res.success) {
          toast.success(res.message || "Match updated successfully")
          router.push("/match-management")
        }
      } else {
        const leagueLabel = leagueOptions.find((opt: any) => opt.value === formData.league)?.label || "Unknown League";
        const refereeLabel = refereeOptions.find((opt: any) => opt.value === formData.referee)?.label || "Unknown Referee";

        const display = {
          leagueName: leagueLabel,
          homeTeamName: homeTeam.name,
          homeTeamLogo: formatImagePath(homeTeam.logo),
          awayTeamName: awayTeam.name,
          awayTeamLogo: formatImagePath(awayTeam.logo),
          refereeName: refereeLabel,
          date: formData.date,
          time: formData.time,
          durationMinutes: formData.durationMinutes,
          venue: formData.venue,
          pitch: formData.pitch,
        };

        if (editingTempId) {
          setTempMatches(prev => prev.map(m => m.id === editingTempId ? {
            ...m,
            payload,
            display
          } : m));
          setEditingTempId(null);
          toast.success("Match updated in queue");
        } else {
          const newMatch: TempMatch = {
            id: Math.random().toString(36).substring(2, 9),
            payload,
            display
          };
          setTempMatches(prev => [...prev, newMatch]);
          toast.success("Match added to queue (common settings retained for next match)");
        }

        // Retain common match form parameters and reset only team selections for the next match
        reset({
          venue: formData.venue,
          pitch: formData.pitch,
          league: formData.league,
          referee: formData.referee,
          durationMinutes: formData.durationMinutes,
          date: formData.date,
          time: formData.time,
        });
        setHomeTeam(null);
        setAwayTeam(null);
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error, `Failed to ${isEditMode ? 'update' : 'create'} match`));
    }
  }


  if (isEditMode && isFetching) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading match data...</div>
  }

  
  // Filtered lists to prevent same-team selection
  const homeTeamOptions = teamsList.filter(t => t.value !== awayTeam?.value);
  const awayTeamOptions = teamsList.filter(t => t.value !== homeTeam?.value);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <>
        <BackButton />
      </>
      <div className='w-full flex gap-4'>
        <div className='flex-1 space-y-4 '>

          <div className='flex justify-between gap-5'>
            {/* Match Settings Card */}
            <section className="bg-white rounded-xl w-8/12 p-8 md:p-10  shadow-xl shadow-gray-200/50">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Match Setting</h2>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* League dropdown — scrollable when > 10 items */}
                  <SelectField
                    name="league"
                    label="League"
                    control={control}
                    error={errors.league}
                    options={leagueOptions}
                    placeholder="Select league"
                    scrollable
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <SelectField
                    name="venue"
                    label="Venue Name"
                    control={control}
                    error={errors.venue}
                    options={venueOptions}
                    placeholder="Select venue"
                  />
                  {selectedVenue && (
                    <SelectField
                      name="pitch"
                      label="Pitch Selection"
                      control={control}
                      error={errors.pitch}
                      options={pitchOptions}
                      placeholder="Select pitch"
                    />
                  )}
                </div>
              </div>
            </section>

            <div className=' w-4/12 space-y-4'>
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

          {/* Matchup Selection Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Matchup Selection</h2>
            <p className="text-sm text-gray-400 mb-8">Home and away teams must be different.</p>

            {/* No league selected yet */}
            {!selectedLeagueId ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
                <p className="text-gray-500 font-semibold">Select a league above to view available teams</p>
                <p className="text-gray-400 text-sm">Teams are filtered based on the selected league</p>
              </div>
            ) : teamsList.length < 2 ? (
              /* League has fewer than 2 teams */
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-amber-600 font-semibold">
                  This league has {teamsList.length === 0 ? 'no' : 'only 1'} team assigned.
                </p>
                <p className="text-gray-400 text-sm">Add at least 2 teams to this league to create a match.</p>
              </div>
            ) : (
              /* Show team selector */
              <div className="flex items-center justify-center gap-8 p-8 bg-white rounded-2xl max-w-4xl mx-auto">

                {/* Home Team */}
                <TeamCard
                  teams={homeTeamOptions}
                  label="TEAM A (HOME)"
                  selectedTeam={homeTeam}
                  onSelect={setHomeTeam}
                />

                {/* VS Badge */}
                <div className="z-10 flex-shrink-0">
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold border-4 border-white shadow-lg">
                    VS
                  </div>
                </div>

                {/* Away Team */}
                <TeamCard
                  teams={awayTeamOptions}
                  label="TEAM B (AWAY)"
                  selectedTeam={awayTeam}
                  onSelect={setAwayTeam}
                />
              </div>
            )}

            {/* Same-team warning */}
            {homeTeam && awayTeam && homeTeam.value === awayTeam.value && (
              <p className="text-center text-red-500 text-sm font-semibold mt-4">
                ⚠️ Home and away teams cannot be the same!
              </p>
            )}
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-5 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-between">
            <button
              type="button"
              onClick={handleFullReset}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Reset All Fields
            </button>
            <div className="flex items-center space-x-4">
              <CancelButton onClick={handleCancelOrReset} title={editingTempId ? "Cancel Edit" : "Clear Teams"} />
              <SubmitButton
                isSubmitting={isEditMode ? isUpdating : false}
                title={isEditMode ? "Update Match" : editingTempId ? "Update Match" : "Add Match to Queue"}
              />
            </div>
          </div>

          {/* Scheduled Matches Queue Card */}
          {!isEditMode && tempMatches.length > 0 && (
            <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <span>Matches Queue</span>
                      <span className="px-2.5 py-0.5 text-xs bg-black text-white rounded-full font-bold">
                        {tempMatches.length}
                      </span>
                    </h2>
                    <p className="text-sm text-gray-400">These matchups will be created together when you submit.</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setTempMatches([]);
                      localStorage.removeItem("temp_matches");
                      toast.success("Successfully cleared matches queue");
                    }}
                    className="px-5 py-2.5 bg-red-50 text-red-600 cursor-pointer hover:bg-red-100 text-sm font-semibold rounded-lg transition-all duration-200"
                  >
                    Clear Queue
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateMatches}
                    disabled={isCreating}
                    className="px-6 py-2.5 bg-black cursor-pointer text-white hover:bg-gray-800 disabled:bg-gray-400 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 animate-pulse-subtle"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create {tempMatches.length} Matches</span>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Matchup</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">League & Referee</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Venue & Pitch</th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {tempMatches.map((match) => (
                      <tr key={match.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                        {/* Matchup */}
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="flex items-center space-x-3.5">
                            {/* Home Team */}
                            <div className="flex items-center space-x-2">
                              {match.display.homeTeamLogo ? (
                                <img
                                  src={formatImagePath(match.display.homeTeamLogo)}
                                  alt={match.display.homeTeamName}
                                  className="w-7 h-7 object-contain rounded"
                                />
                              ) : (
                                <div className="w-7 h-7 bg-gray-100 text-gray-400 rounded flex items-center justify-center font-bold text-xs uppercase">
                                  {match.display.homeTeamName[0]}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-gray-800">{match.display.homeTeamName}</span>
                            </div>
                            <span className="text-gray-400 font-bold text-xs">VS</span>
                            {/* Away Team */}
                            <div className="flex items-center space-x-2">
                              {match.display.awayTeamLogo ? (
                                <img
                                  src={formatImagePath(match.display.awayTeamLogo)}
                                  alt={match.display.awayTeamName}
                                  className="w-7 h-7 object-contain rounded"
                                />
                              ) : (
                                <div className="w-7 h-7 bg-gray-100 text-gray-400 rounded flex items-center justify-center font-bold text-xs uppercase">
                                  {match.display.awayTeamName[0]}
                                </div>
                              )}
                              <span className="text-sm font-semibold text-gray-800">{match.display.awayTeamName}</span>
                            </div>
                          </div>
                        </td>

                        {/* League & Referee */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="font-semibold text-gray-800">{match.display.leagueName}</div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <span className="mr-1">🏁 Ref:</span>
                            {match.display.refereeName}
                          </div>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          <div className="flex items-center gap-1.5 font-medium text-gray-700">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {dayjs(match.payload.matchDate).format("MMM DD, YYYY")}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {dayjs(match.payload.matchDate).format("hh:mm A")}
                          </div>
                        </td>

                        {/* Venue & Pitch */}
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5 font-medium text-gray-800">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            {match.display.venue}
                          </div>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {match.display.pitch}
                            </span>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {match.display.durationMinutes}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2.5">
                            <button
                              type="button"
                              onClick={() => handleEditTempMatch(match)}
                              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-150"
                              title="Edit Match"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTempMatch(match.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Remove Match"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    </form>
  )
}

export default CreateMatch;