/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BackButton from "@/components/buttons/BackButton";
import CancelButton from "@/components/buttons/CancelButton";
import SubmitButton from "@/components/buttons/SubmitButton";
import SelectField from "@/components/form/SelectField";
import {
  useCreateMatchMutation,
  useGetSingleMatchQuery,
  useUpdateMatchMutation,
} from "@/features/match/matchApi";
import { useGetRefereeQuery } from "@/features/referee/refereeApi";
import {
  useGetAllVenueCategoryQuery,
  useGetAllPlayTimeQuery,
} from "@/features/categoryManagement/categoryApi";
import { useHeaders } from "@/hooks/useHeaders";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Calendar, Clock, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import InputField from "../../../../components/form/InputField";
import { useGetAllLeagueTeamQuery } from "../../../../features/leagueTeam/leagueTeamApi";
import { TeamCard } from "./MatchupSelector";

// Form Validation Schema
const createMatchSchema = z.object({
  venue: z.string().min(1, "Venue is required"),
  subVenue: z.string().optional(),
  pitch: z.string().optional(),
  league: z.string().min(1, "League is required"),
  referee: z.string().min(1, "Referee is required"),
  durationMinutes: z.string().min(1, "Duration is required"),
  formation: z.string().min(1, "Formation is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

const formationOptions = [
  { label: "5 v 5", value: "5 v 5" },
  { label: "7 v 7", value: "7 v 7" },
  { label: "8 v 8", value: "8 v 8" },
  { label: "9 v 9", value: "9 v 9" },
];

type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

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
    durationMinutes: string;
    formation: string;
    venueName: string;
    pitch?: string;
    subVenue?: string;
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
    formation: string;
    venue: string;
    pitch: string;
  };
}

const CreateMatch = () => {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const isEditMode = !!matchId;

  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const { setHeaders } = useHeaders();
  const router = useRouter();

  const [tempMatches, setTempMatches] = useState<TempMatch[]>([]);
  const [editingTempId, setEditingTempId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMatchFormValues>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      venue: "",
      subVenue: "",
      pitch: "",
      league: "",
      referee: "",
      durationMinutes: "",
      formation: "",
      date: "",
      time: "",
    },
  });

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
                venue: lastMatch.payload.venueName || lastMatch.display.venue || "",
                subVenue: lastMatch.payload.subVenue || lastMatch.payload.pitch || "",
                pitch: lastMatch.payload.pitch || "",
                league: lastMatch.payload.league || "",
                referee: lastMatch.payload.referee || "",
                durationMinutes: lastMatch.payload.durationMinutes?.toString() || "",
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
  }, [isEditMode, reset]);

  // Save to localStorage after hydration
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("temp_matches", JSON.stringify(tempMatches));
    }
  }, [tempMatches, isHydrated]);

  const [createMatch, { isLoading: isCreating }] = useCreateMatchMutation();
  const [updateMatch, { isLoading: isUpdating }] = useUpdateMatchMutation();
  const { data: matchData, isFetching } = useGetSingleMatchQuery(matchId, {
    skip: !isEditMode,
  });

  // Queries for Leagues, Referees, Venue Categories, PlayTime
  const { data: leagueTeamData } = useGetAllLeagueTeamQuery(1);
  const { data: refereeData } = useGetRefereeQuery(undefined);
  const { data: venueCategoryData } = useGetAllVenueCategoryQuery({});
  const { data: playTimeData } = useGetAllPlayTimeQuery({});

  const leagueTeamList: any[] = leagueTeamData?.data || [];
  const venueCategories: any[] = venueCategoryData?.data || [];
  const playTimeList: any[] = playTimeData?.data || [];

  // Options for dropdowns
  const leagueOptions = leagueTeamList.map((item: any) => ({
    label: `${item.league.leagueName} (${item.league.season})`,
    value: item.league._id,
  }));

  const refereeOptions = (refereeData?.data || []).map((r: any) => {
    const displayName = r.displayName || r.name || r.userName || (r.firstName ? `${r.firstName} ${r.lastName || ''}`.trim() : r.email || "Referee");
    return {
      label: displayName,
      value: r._id,
    };
  });

  const venueOptions = venueCategories.map((v: any) => ({
    label: v.name,
    value: v._id || v.id,
  }));

  // Duration passes text title (e.g. "90 minute") instead of ID as requested by user
  const durationOptions = playTimeList.map((p: any) => ({
    label: p.name,
    value: p.name,
  }));

  // Watch fields
  const selectedLeagueId = watch("league");
  const selectedVenueId = watch("venue");

  // Derive venue object and subcategories if present
  const selectedVenueObj = venueCategories.find(
    (v: any) => (v._id || v.id) === selectedVenueId || v.name === selectedVenueId
  );
  const subCategoriesList: any[] = selectedVenueObj?.subCategories || [];

  const subVenueOptions = subCategoriesList.map((s: any) => ({
    label: s.name,
    value: s._id || s.id,
  }));

  // Reset subVenue when parent venue changes
  const [prevVenueId, setPrevVenueId] = useState(selectedVenueId);
  useEffect(() => {
    if (prevVenueId && selectedVenueId !== prevVenueId) {
      setValue("subVenue", "");
      setValue("pitch", "");
    }
    setPrevVenueId(selectedVenueId);
  }, [selectedVenueId, prevVenueId, setValue]);

  // Derive teams for the selected league
  const selectedLeagueEntry = leagueTeamList.find(
    (item: any) => item.league._id === selectedLeagueId
  );
  const teamsList: Team[] = (selectedLeagueEntry?.teams || []).map((t: any) => ({
    value: t._id,
    name: t.teamName,
    logo: t.teamLogo || null,
  }));

  // Reset home/away teams when league changes
  const [prevLeagueId, setPrevLeagueId] = useState(selectedLeagueId);
  useEffect(() => {
    if (prevLeagueId && selectedLeagueId !== prevLeagueId) {
      setHomeTeam(null);
      setAwayTeam(null);
    }
    setPrevLeagueId(selectedLeagueId);
  }, [selectedLeagueId, prevLeagueId]);

  // Auto-pick first two teams in create mode once loaded
  useEffect(() => {
    if (
      !isEditMode &&
      !editingTempId &&
      teamsList.length >= 2 &&
      !homeTeam &&
      !awayTeam
    ) {
      setHomeTeam(teamsList[0]);
      setAwayTeam(teamsList[1]);
    }
  }, [selectedLeagueId, leagueTeamData, editingTempId, isEditMode, teamsList, homeTeam, awayTeam]);

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Edit Match" : "Create Match",
      des: isEditMode
        ? "Update details for this match."
        : "Set up a new matchup between teams in the league.",
    });
  }, [setHeaders, isEditMode]);

  // Populate form in edit mode
  useEffect(() => {
    if (matchData?.data) {
      const match = matchData.data;
      const date = dayjs(match.matchDate);

      const venueVal = typeof match.venueName === "object" ? match.venueName?._id : match.venueName || "";
      const subVal = typeof match.subVenue === "object" ? match.subVenue?._id : match.subVenue || typeof match.pitch === "object" ? match.pitch?._id : match.pitch || "";
      const durVal = typeof match.durationMinutes === "object" ? match.durationMinutes?.name : match.durationMinutes || "";

      reset({
        venue: venueVal,
        subVenue: subVal,
        pitch: subVal,
        league: typeof match.league === "object" ? match.league?._id : match.league || "",
        referee: typeof match.referee === "object" ? match.referee?._id : match.referee || "",
        durationMinutes: durVal,
        formation: match.formation || "",
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
  }, [matchData, reset]);

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
      subVenue: "",
      pitch: "",
      league: "",
      referee: "",
      durationMinutes: "",
      formation: "",
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

    const subVal = match.payload.subVenue || match.payload.pitch || "";
    reset({
      venue: match.payload.venueName || match.display.venue,
      subVenue: subVal,
      pitch: subVal,
      league: match.payload.league,
      referee: match.payload.referee,
      durationMinutes: match.payload.durationMinutes || match.display.durationMinutes,
      formation: match.payload.formation || match.display.formation || "",
      date: match.display.date,
      time: match.display.time,
    });

    setHomeTeam({
      value: match.payload.homeTeam,
      name: match.display.homeTeamName,
      logo: match.display.homeTeamLogo,
    });
    setAwayTeam({
      value: match.payload.awayTeam,
      name: match.display.awayTeamName,
      logo: match.display.awayTeamLogo,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteTempMatch = (id: string) => {
    setTempMatches((prev) => prev.filter((m) => m.id !== id));
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
      const payloads = tempMatches.map((m) => m.payload);
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

  const onError = (errors: any) => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstError = errors[errorKeys[0]];
      if (firstError?.message) {
        toast.error(firstError.message);
      }
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

      const selectedSubCategoryVal = formData.subVenue || formData.pitch || "";

      // Labels for display preview
      const selectedVenueLabel = selectedVenueObj?.name || formData.venue;
      const selectedSubVenueObj = subCategoriesList.find(
        (s: any) => (s._id || s.id) === selectedSubCategoryVal || s.name === selectedSubCategoryVal
      );
      const selectedSubVenueLabel = selectedSubVenueObj?.name || selectedSubCategoryVal || "";

      const payload: any = {
        league: formData.league,
        homeTeam: homeTeam.value,
        awayTeam: awayTeam.value,
        matchDate,
        durationMinutes: formData.durationMinutes, // title text (e.g. "90 minute")
        formation: formData.formation,
        venueName: formData.venue, // venue category ID
        pitch: selectedSubCategoryVal, // subcategory ID sent as pitch
        referee: formData.referee,
      };

      if (selectedSubCategoryVal) {
        payload.subVenue = selectedSubCategoryVal;
      }

      if (isEditMode) {
        const res = await updateMatch({ id: matchId, data: payload }).unwrap();
        if (res.success) {
          toast.success(res.message || "Match updated successfully");
          router.push("/match-management");
        }
      } else {
        const leagueLabel =
          leagueOptions.find((opt: any) => opt.value === formData.league)?.label ||
          "Unknown League";
        const refereeLabel =
          refereeOptions.find((opt: any) => opt.value === formData.referee)?.label ||
          "Unknown Referee";

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
          formation: formData.formation,
          venue: selectedVenueLabel,
          pitch: selectedSubVenueLabel,
        };

        if (editingTempId) {
          setTempMatches((prev) =>
            prev.map((m) =>
              m.id === editingTempId
                ? {
                  ...m,
                  payload,
                  display,
                }
                : m
            )
          );
          setEditingTempId(null);
          toast.success("Match updated in queue");
        } else {
          const newMatch: TempMatch = {
            id: Math.random().toString(36).substring(2, 9),
            payload,
            display,
          };
          setTempMatches((prev) => [...prev, newMatch]);
          toast.success("Match added to queue");
        }

        // Reset form for next entry
        reset({
          venue: formData.venue,
          subVenue: selectedSubCategoryVal,
          pitch: selectedSubCategoryVal,
          league: formData.league,
          referee: formData.referee,
          durationMinutes: formData.durationMinutes,
          formation: formData.formation,
          date: formData.date,
          time: "",
        });
        setHomeTeam(null);
        setAwayTeam(null);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Failed to save match"));
    }
  };

  if (isEditMode && isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        Loading match data...
      </div>
    );
  }

  // Filtered lists to prevent same-team selection
  const homeTeamOptions = teamsList.filter((t) => t.value !== awayTeam?.value);
  const awayTeamOptions = teamsList.filter((t) => t.value !== homeTeam?.value);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <BackButton />

      <div className="w-full flex gap-4">
        <div className="flex-1 space-y-4">
          <div className="flex justify-between gap-5">
            {/* Match Settings Card */}
            <section className="bg-white rounded-xl w-8/12 p-8 md:p-10 shadow-xl shadow-gray-200/50">
              <h2 className="text-2xl font-medium text-gray-900 mb-8">
                Match Setting
              </h2>

              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* League dropdown */}
                  <SelectField
                    name="league"
                    label="League"
                    control={control}
                    error={errors.league}
                    options={leagueOptions}
                    placeholder="Select your league"
                    scrollable
                  />
                  <SelectField
                    name="referee"
                    label="Referee"
                    control={control}
                    error={errors.referee}
                    options={refereeOptions}
                    placeholder="Select your referee"
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
                    scrollable
                  />

                  {/* Render Subcategory dropdown if parent venue has subcategories */}
                  {subCategoriesList.length > 0 && (
                    <SelectField
                      name="subVenue"
                      label="Sub Category"
                      control={control}
                      error={errors.subVenue}
                      options={subVenueOptions}
                      placeholder="Select subcategory"
                      scrollable
                    />
                  )}

                  <SelectField
                    name="formation"
                    label="Formation"
                    control={control}
                    error={errors.formation}
                    options={formationOptions}
                    placeholder="Select formation"
                    scrollable
                  />
                </div>
              </div>
            </section>

            {/* Schedule Card */}
            <div className="w-4/12 space-y-4">
              <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
                <h2 className="text-2xl font-medium text-gray-900 mb-8">
                  Schedule
                </h2>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 gap-4">
                    <InputField
                      name="date"
                      type="date"
                      title="Match Date"
                      register={register}
                      error={errors.date}
                    />
                    <InputField
                      name="time"
                      type="time"
                      title="Kick-off Time"
                      register={register}
                      error={errors.time}
                    />
                    <SelectField
                      name="durationMinutes"
                      label="Duration"
                      control={control}
                      error={errors.durationMinutes}
                      options={durationOptions}
                      placeholder="Select duration"
                      scrollable
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* Matchup Selection Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Matchup Selection
            </h2>
            <p className="text-sm text-gray-400 mb-8">
              Home and away teams must be different.
            </p>

            {/* No league selected yet */}
            {!selectedLeagueId ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🏆</span>
                </div>
                <p className="text-gray-500 font-semibold">
                  Select a league above to view available teams
                </p>
                <p className="text-gray-400 text-sm">
                  Teams are filtered based on the selected league
                </p>
              </div>
            ) : teamsList.length < 2 ? (
              /* League has fewer than 2 teams */
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-amber-600 font-semibold">
                  This league has {teamsList.length === 0 ? "no" : "only 1"} team
                  assigned.
                </p>
                <p className="text-gray-400 text-sm">
                  Add at least 2 teams to this league to create a match.
                </p>
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
                  <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-xl font-medium border-4 border-white shadow-lg">
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
        </div>
      </div>

      {/* Temp Matches Queue / List */}
      {!isEditMode && tempMatches.length > 0 && (
        <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">
                Matches to Create ({tempMatches.length})
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Review queued matches before submitting.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateMatches}
              disabled={isCreating}
              className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Submit All Matches ({tempMatches.length})</span>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {tempMatches.map((m, index) => {
              const isBeingEdited = editingTempId === m.id;
              return (
                <div
                  key={m.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row items-center justify-between gap-6 ${isBeingEdited
                      ? "bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/50"
                      : "bg-gray-50/70 border-gray-100 hover:border-gray-200"
                    }`}
                >
                  {/* Left: Match Details */}
                  <div className="flex items-center gap-4 flex-1">
                    <span className="w-8 h-8 rounded-full bg-gray-900 text-white font-medium text-sm flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-gray-900 text-base">
                          {m.display.homeTeamName} vs {m.display.awayTeamName}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {m.display.leagueName}
                        </span>
                        {m.display.formation && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            {m.display.formation}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {m.display.date} at {m.display.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {m.display.durationMinutes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {m.display.venue}{" "}
                          {m.display.pitch ? `(${m.display.pitch})` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditTempMatch(m)}
                      className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-200/60 transition-colors cursor-pointer"
                      title="Edit queued match"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTempMatch(m.id)}
                      className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete queued match"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Form Action Footer */}
      <div className="flex justify-between items-center pt-4">
        <CancelButton onClick={handleCancelOrReset} title="Cancel" />
        <div className="flex gap-4">
          {!isEditMode && (
            <button
              type="button"
              onClick={handleFullReset}
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-all cursor-pointer"
            >
              Clear Form
            </button>
          )}

          {isEditMode ? (
            <SubmitButton
              text="Update Match"
              isLoading={isUpdating}
              disabled={isUpdating}
            />
          ) : (
            <SubmitButton
              text={editingTempId ? "Save Queued Match" : "+ Add Match to Queue"}
              disabled={isCreating}
            />
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateMatch;