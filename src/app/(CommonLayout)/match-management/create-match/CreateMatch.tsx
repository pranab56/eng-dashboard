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
  useGetAllAgeGroupQuery,
} from "@/features/categoryManagement/categoryApi";
import { useGetAllPlayerQuery } from "@/features/player/playerApi";
import { useHeaders } from "@/hooks/useHeaders";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import { Calendar, Clock, Loader2, MapPin, Pencil, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useGetAllLeagueTeamQuery } from "../../../../features/leagueTeam/leagueTeamApi";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import CustomTimePicker from "@/components/ui/CustomTimePicker";
import { TeamCard } from "./MatchupSelector";

// Form Validation Schema
const createMatchSchema = z.object({
  venue: z.string().min(1, "Venue is required"),
  subVenue: z.string().optional(),
  pitch: z.string().optional(),
  matchType: z.enum(["", "league", "cup", "friendly"]).refine(val => val !== "", {
    message: "Match type is required"
  }),
  league: z.string().optional(),
  ageGroupCategory: z.string().optional(),
  ageGroup: z.string().optional(),
  referee: z.string().optional(),
  durationMinutes: z.string().min(1, "Duration is required"),
  formation: z.string().min(1, "Formation is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
}).refine((data) => {
  if (data.matchType === "league" && !data.league) {
    return false;
  }
  return true;
}, {
  message: "League is required",
  path: ["league"],
}).refine((data) => {
  if ((data.matchType === "cup" || data.matchType === "friendly") && !data.ageGroupCategory) {
    return false;
  }
  return true;
}, {
  message: "Age Group Category is required",
  path: ["ageGroupCategory"],
}).refine((data) => {
  if ((data.matchType === "cup" || data.matchType === "friendly") && !data.ageGroup) {
    return false;
  }
  return true;
}, {
  message: "Sub Category is required",
  path: ["ageGroup"],
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
    league?: string;
    matchType?: string;
    ageGroupCategory?: string;
    ageGroup?: string;
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
      ageGroupCategory: "",
      ageGroup: "",
      matchType: "" as any,
      referee: "",
      durationMinutes: "",
      formation: "",
      date: "",
      time: "",
    },
  });

  const watchMatchType = watch("matchType");

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
                matchType: (lastMatch.payload.matchType || "") as any,
                ageGroupCategory: lastMatch.payload.ageGroupCategory || "",
                ageGroup: lastMatch.payload.ageGroup || "",
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

  // Queries for Leagues, Referees, Venue Categories, PlayTime, Age Groups
  const { data: leagueTeamData } = useGetAllLeagueTeamQuery(1);
  const { data: refereeData } = useGetRefereeQuery(undefined);
  const { data: venueCategoryData } = useGetAllVenueCategoryQuery({});
  const { data: playTimeData } = useGetAllPlayTimeQuery({});
  const { data: ageGroupRes } = useGetAllAgeGroupQuery({});

  const leagueTeamList: any[] = useMemo(() => leagueTeamData?.data || [], [leagueTeamData]);
  const venueCategories: any[] = useMemo(() => venueCategoryData?.data || [], [venueCategoryData]);
  const playTimeList: any[] = useMemo(() => playTimeData?.data || [], [playTimeData]);

  const ageGroupCategoryOptions = useMemo(() => {
    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    return apiCats.map((cat: any) => ({
      label: cat.name,
      value: cat._id || cat.id,
    }));
  }, [ageGroupRes]);

  // Options for dropdowns
  const leagueOptions = leagueTeamList.map((item: any) => ({
    label: `${item.league.leagueName} (${item.league.season})`,
    value: item.league._id,
  }));

  const watchReferee = watch("referee");

  const refereeOptions = useMemo(() => {
    const list = (refereeData?.data || []).map((r: any) => {
      const displayName = r.displayName || r.name || r.userName || (r.firstName ? `${r.firstName} ${r.lastName || ''}`.trim() : r.email || "Referee");
      return {
        label: displayName,
        value: r._id,
      };
    });

    if (watchReferee && watchReferee !== "unassigned") {
      return [{ label: "Unassign Coach", value: "unassigned" }, ...list];
    }
    return list;
  }, [refereeData, watchReferee]);

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
  const selectedAgeGroupId = watch("ageGroupCategory");
  const selectedAgeGroup = watch("ageGroup");

  // Derive ageGroup object and subcategories if present
  const selectedAgeGroupObj = useMemo(() => {
    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    return apiCats.find(
      (cat: any) => (cat._id || cat.id) === selectedAgeGroupId
    );
  }, [ageGroupRes, selectedAgeGroupId]);

  const ageGroupSubCategoriesList: any[] = useMemo(() => {
    return selectedAgeGroupObj?.subCategories || [];
  }, [selectedAgeGroupObj]);

  const ageGroupSubCategoryOptions = useMemo(() => {
    return ageGroupSubCategoriesList.map((sub: any) => ({
      label: sub.name,
      value: sub.name,
    }));
  }, [ageGroupSubCategoriesList]);

  // Reset subcategory when parent ageGroupCategory changes
  const [prevAgeGroupCategory, setPrevAgeGroupCategory] = useState(selectedAgeGroupId);
  useEffect(() => {
    if (prevAgeGroupCategory && selectedAgeGroupId !== prevAgeGroupCategory) {
      setValue("ageGroup", "");
    }
    setPrevAgeGroupCategory(selectedAgeGroupId);
  }, [selectedAgeGroupId, prevAgeGroupCategory, setValue]);

  // Query players of selected ageGroup to identify which teams belong to this ageGroup
  const { data: playersOfAgeGroup } = useGetAllPlayerQuery(
    selectedAgeGroup ? { ageGroup: selectedAgeGroup, limit: 1000 } : {},
    { skip: !selectedAgeGroup }
  );

  const teamIdsInAgeGroup = useMemo(() => {
    const players = playersOfAgeGroup?.data?.players || playersOfAgeGroup?.data || [];
    const ids = new Set<string>();
    if (Array.isArray(players)) {
      players.forEach((p: any) => {
        const tId = p?.selectTeam?._id || p?.selectTeam?.id || p?.selectTeam;
        if (tId) {
          const idStr = (typeof tId === "string" ? tId : (tId._id || tId.id || tId).toString()).trim();
          if (idStr) ids.add(idStr);
        }
      });
    }
    return Array.from(ids);
  }, [playersOfAgeGroup]);

  // Derive venue object and subcategories if present
  const selectedVenueObj = useMemo(() => {
    return venueCategories.find(
      (v: any) => (v._id || v.id) === selectedVenueId || v.name === selectedVenueId
    );
  }, [venueCategories, selectedVenueId]);

  const subCategoriesList: any[] = useMemo(() => {
    return selectedVenueObj?.subCategories || [];
  }, [selectedVenueObj]);

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

  // Derive teams for the selected league, and optionally filter by selectedAgeGroup for cup/friendly matches
  const selectedLeagueEntry = leagueTeamList.find(
    (item: any) => item.league._id === selectedLeagueId
  );
  const rawTeamsList = useMemo(() => selectedLeagueEntry?.teams || [], [selectedLeagueEntry]);
  
  const teamsList: Team[] = useMemo(() => {
    let baseList: Team[] = [];

    if (watchMatchType === "league") {
      baseList = rawTeamsList.map((t: any) => ({
        value: (t._id || t.id || t).toString(),
        name: t.teamName,
        logo: t.teamLogo || null,
      }));
    } else if (watchMatchType === "cup" || watchMatchType === "friendly") {
      const players = playersOfAgeGroup?.data?.players || playersOfAgeGroup?.data || [];
      const teamMap = new Map<string, Team>();
      if (Array.isArray(players)) {
        players.forEach((p: any) => {
          const t = p?.selectTeam;
          const tId = t?._id || t?.id || (typeof t === "string" ? t : null);
          if (tId) {
            const idStr = tId.toString().trim();
            if (idStr && !teamMap.has(idStr)) {
              teamMap.set(idStr, {
                value: idStr,
                name: t.teamName || "Unknown Team",
                logo: t.teamLogo || null,
              });
            }
          }
        });
      }
      baseList = Array.from(teamMap.values());
    }

    // Always ensure current homeTeam and awayTeam are present in the list (especially in edit mode)
    if (homeTeam && !baseList.some((t) => t.value === homeTeam.value)) {
      baseList.push(homeTeam);
    }
    if (awayTeam && !baseList.some((t) => t.value === awayTeam.value)) {
      baseList.push(awayTeam);
    }

    return baseList;
  }, [rawTeamsList, watchMatchType, playersOfAgeGroup, homeTeam, awayTeam]);

  // Reset home/away teams when league, ageGroupCategory, or ageGroup changes
  const [prevLeagueId, setPrevLeagueId] = useState(selectedLeagueId);
  const [prevAgeGroupId, setPrevAgeGroupId] = useState(selectedAgeGroupId);
  const [prevAgeGroup, setPrevAgeGroup] = useState(selectedAgeGroup);
  useEffect(() => {
    if (
      (prevLeagueId && selectedLeagueId !== prevLeagueId) ||
      (prevAgeGroupId && selectedAgeGroupId !== prevAgeGroupId) ||
      (prevAgeGroup && selectedAgeGroup !== prevAgeGroup)
    ) {
      setHomeTeam(null);
      setAwayTeam(null);
    }
    setPrevLeagueId(selectedLeagueId);
    setPrevAgeGroupId(selectedAgeGroupId);
    setPrevAgeGroup(selectedAgeGroup);
  }, [selectedLeagueId, prevLeagueId, selectedAgeGroupId, prevAgeGroupId, selectedAgeGroup, prevAgeGroup]);



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
      const date = dayjs(match.matchDate).tz("Europe/London");

      console.log("[CreateMatch:Edit] Raw Match details from DB:", match);

      let venueVal =
        (typeof match.venueCategory === "object" ? match.venueCategory?._id || match.venueCategory?.id : match.venueCategory) ||
        (typeof match.venueName === "object" ? match.venueName?._id : match.venueName) ||
        "";

      // If venueVal is a text name instead of ObjectId, find its matching category ID by name
      if (venueVal && !/^[0-9a-fA-F]{24}$/.test(venueVal) && venueCategories.length > 0) {
        const found = venueCategories.find((v: any) => v.name?.toLowerCase() === venueVal.toLowerCase());
        if (found) {
          venueVal = found._id || found.id;
        }
      }

      const selectedVenueObjLocal = venueCategories.find(
        (v: any) => (v._id || v.id) === venueVal || v.name === venueVal
      );
      const subCatsLocal = selectedVenueObjLocal?.subCategories || [];

      let subVal =
        (typeof match.venueSubCategory === "object" ? match.venueSubCategory?._id || match.venueSubCategory?.id : match.venueSubCategory) ||
        (typeof match.subVenue === "object" ? match.subVenue?._id : match.subVenue) ||
        (typeof match.pitch === "object" ? match.pitch?._id : match.pitch) ||
        "";

      // If subVal is a text name instead of ObjectId, find its matching subcategory ID by name
      if (subVal && !/^[0-9a-fA-F]{24}$/.test(subVal) && subCatsLocal.length > 0) {
        const found = subCatsLocal.find((s: any) => s.name?.toLowerCase() === subVal.toLowerCase());
        if (found) {
          subVal = found._id || found.id;
        }
      }

      let durVal = typeof match.durationMinutes === "object" ? match.durationMinutes?.name : match.durationMinutes || "";
      // Extract numbers from duration (e.g. "50 minutes" -> "50") and match with option in playTimeList
      const durMatch = String(durVal).match(/\d+/);
      if (durMatch && playTimeList.length > 0) {
        const durNumber = durMatch[0];
        const foundOpt = playTimeList.find((p: any) => p.name?.startsWith(durNumber));
        if (foundOpt) {
          durVal = foundOpt.name;
        }
      }

      let formationVal = match.formation || "";
      if (formationVal) {
        formationVal = formationVal.replace(/\s+/g, " ").trim();
      }
      // Normalize formation format (e.g. "9v9" -> "9 v 9")
      if (formationVal && !formationVal.includes(" v ")) {
        const matchDigits = formationVal.match(/\d+/g);
        if (matchDigits && matchDigits.length === 2) {
          formationVal = `${matchDigits[0]} v ${matchDigits[1]}`;
        }
      }

      let ageGroupCategoryVal =
        (typeof match.ageGroupCategory === "object" ? match.ageGroupCategory?._id || match.ageGroupCategory?.id : match.ageGroupCategory) ||
        "";

      // Self-healing: if ageGroupCategory is empty but ageGroup (e.g. "u7") is present, resolve parent category from API response
      if (!ageGroupCategoryVal && match.ageGroup && ageGroupRes?.data?.result) {
        const apiCats = ageGroupRes.data.result || ageGroupRes.data || [];
        if (Array.isArray(apiCats)) {
          const foundParent = apiCats.find((parent: any) =>
            parent.subCategories?.some((sub: any) => sub.name?.toLowerCase() === match.ageGroup.toLowerCase())
          );
          if (foundParent) {
            ageGroupCategoryVal = foundParent._id || foundParent.id;
            console.log("[CreateMatch:Edit] Resolved missing ageGroupCategory to:", ageGroupCategoryVal);
          }
        }
      }

      const resetPayload = {
        venue: venueVal,
        subVenue: subVal,
        pitch: subVal,
        league: typeof match.league === "object" ? match.league?._id || match.league?.id : match.league || "",
        ageGroupCategory: ageGroupCategoryVal,
        ageGroup: match.ageGroup || "",
        matchType: (match.matchType || "league") as "league" | "cup" | "friendly",
        referee: typeof match.referee === "object" ? match.referee?._id || match.referee?.id : match.referee || "",
        durationMinutes: durVal,
        formation: formationVal,
        date: date.format("YYYY-MM-DD"),
        time: date.format("HH:mm"),
      };

      console.log("[CreateMatch:Edit] Resetting Form values to:", resetPayload);
      reset(resetPayload);

      if (match.homeTeam) {
        setHomeTeam({
          value: match.homeTeam._id || match.homeTeam.id || match.homeTeam,
          name: match.homeTeam.teamName || "Home Team",
          logo: match.homeTeam.teamLogo || null,
        });
      }
      if (match.awayTeam) {
        setAwayTeam({
          value: match.awayTeam._id || match.awayTeam.id || match.awayTeam,
          name: match.awayTeam.teamName || "Away Team",
          logo: match.awayTeam.teamLogo || null,
        });
      }
    }
  }, [matchData, venueCategoryData, refereeData, playTimeData, reset, playTimeList, venueCategories, ageGroupRes]);

  // Explicitly set subVenue/pitch value once subCategoriesList is populated in edit mode
  useEffect(() => {
    if (isEditMode && matchData?.data && subCategoriesList.length > 0) {
      const match = matchData.data;
      let subVal =
        (typeof match.venueSubCategory === "object" ? match.venueSubCategory?._id || match.venueSubCategory?.id : match.venueSubCategory) ||
        (typeof match.subVenue === "object" ? match.subVenue?._id : match.subVenue) ||
        (typeof match.pitch === "object" ? match.pitch?._id : match.pitch) ||
        "";

      // If subVal is a text name instead of ObjectId, find its matching subcategory ID by name
      if (subVal && !/^[0-9a-fA-F]{24}$/.test(subVal)) {
        const found = subCategoriesList.find((s: any) => s.name?.toLowerCase() === subVal.toLowerCase());
        if (found) {
          subVal = found._id || found.id;
        }
      }

      if (subVal) {
        console.log("[CreateMatch:Edit] Explicitly setting subVenue to:", subVal);
        setValue("subVenue", subVal);
        setValue("pitch", subVal);
      }
    }
  }, [isEditMode, matchData, subCategoriesList, setValue]);

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
      ageGroupCategory: "",
      ageGroup: "",
      matchType: "" as any,
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
      ageGroupCategory: match.payload.ageGroupCategory || "",
      ageGroup: match.payload.ageGroup || "",
      matchType: (match.payload.matchType || "league") as "league" | "cup" | "friendly",
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
      const matchDate = dayjs
        .tz(`${formData.date} ${formData.time}`, "Europe/London")
        .utc()
        .toISOString();

      const selectedSubCategoryVal = formData.subVenue || formData.pitch || "";

      // Labels for display preview
      const selectedVenueLabel = selectedVenueObj?.name || formData.venue;
      const selectedSubVenueObj = subCategoriesList.find(
        (s: any) => (s._id || s.id) === selectedSubCategoryVal || s.name === selectedSubCategoryVal
      );
      const selectedSubVenueLabel = selectedSubVenueObj?.name || selectedSubCategoryVal || "";

      const payload: any = {
        league: formData.league || undefined,
        matchType: formData.matchType,
        ageGroupCategory: formData.ageGroupCategory || undefined,
        ageGroup: formData.ageGroup || undefined,
        homeTeam: homeTeam.value,
        awayTeam: awayTeam.value,
        matchDate,
        durationMinutes: formData.durationMinutes, // title text (e.g. "90 minute")
        formation: formData.formation,
        venueName: formData.venue, // venue category ID
        pitch: selectedSubCategoryVal, // subcategory ID sent as pitch
      };

      if (formData.referee === "unassigned" || !formData.referee) {
        payload.referee = null;
      } else {
        payload.referee = formData.referee;
      }

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
        const selectedLeagueObj = leagueOptions.find((opt: any) => opt.value === formData.league);
        const leagueLabel = selectedLeagueObj
          ? selectedLeagueObj.label
          : "Friendly Match";
        const refereeLabel =
          refereeOptions.find((opt: any) => opt.value === formData.referee)?.label ||
          "Unknown Referee";

        const display = {
          leagueName: formData.ageGroup ? `${leagueLabel} (${formData.ageGroup})` : leagueLabel,
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
          ageGroupCategory: formData.ageGroupCategory,
          ageGroup: formData.ageGroup,
          matchType: formData.matchType,
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Match Type dropdown */}
                <SelectField
                  name="matchType"
                  label="Match Type"
                  control={control}
                  error={errors.matchType}
                  options={[
                    { label: "League Match", value: "league" },
                    { label: "Cup Match", value: "cup" },
                    { label: "Friendly Match", value: "friendly" },
                  ]}
                  placeholder="Select match type"
                />

                {/* League dropdown */}
                {watchMatchType === "league" && (
                  <SelectField
                    name="league"
                    label="League"
                    control={control}
                    error={errors.league}
                    options={leagueOptions}
                    placeholder="Select your league"
                    scrollable
                  />
                )}

                {/* Age Group Category dropdown */}
                {(watchMatchType === "cup" || watchMatchType === "friendly") && (
                  <SelectField
                    name="ageGroupCategory"
                    label="Age Group Category"
                    control={control}
                    error={errors.ageGroupCategory}
                    options={ageGroupCategoryOptions}
                    placeholder="Select age group category"
                    scrollable
                  />
                )}

                {/* Render Sub Category dropdown if parent age group category has subcategories */}
                {(watchMatchType === "cup" || watchMatchType === "friendly") && ageGroupSubCategoryOptions.length > 0 && (
                  <SelectField
                    name="ageGroup"
                    label="Age Group"
                    control={control}
                    error={errors.ageGroup}
                    options={ageGroupSubCategoryOptions}
                    placeholder="Select age group"
                    scrollable
                  />
                )}

                {/* Additional Settings row */}
                {watchMatchType && (
                  <SelectField
                    name="referee"
                    label="Referee (Optional)"
                    control={control}
                    error={errors.referee}
                    options={refereeOptions}
                    placeholder="Select referee (optional)"
                  />
                )}

                {/* Venue Name dropdown */}
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

                {/* Formation dropdown */}
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
            </section>

            {/* Schedule Card */}
            <div className="w-4/12 space-y-4">
              <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Match Schedule
                  </h2>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
                    UK Time (Europe/London)
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Custom Popup Date Picker */}
                  <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="Match Date"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.date?.message}
                      />
                    )}
                  />

                  {/* Custom Popup Time Picker */}
                  <Controller
                    name="time"
                    control={control}
                    render={({ field }) => (
                      <CustomTimePicker
                        label="Kick-off Time"
                        value={field.value}
                        onChange={field.onChange}
                        error={errors.time?.message}
                      />
                    )}
                  />

                  {/* Match Duration */}
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

            {/* No match type selected yet */}
            {!watchMatchType ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚙️</span>
                </div>
                <p className="text-gray-500 font-semibold">
                  Select a match type above to get started
                </p>
                <p className="text-gray-400 text-sm">
                  Teams will be available once the match settings are configured
                </p>
              </div>
            ) : watchMatchType === "league" && !selectedLeagueId ? (
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
            ) : (watchMatchType === "cup" || watchMatchType === "friendly") && !selectedAgeGroup ? (
              /* Age group not selected yet for cup/friendly matches */
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                  <span className="text-3xl">👥</span>
                </div>
                <p className="text-blue-600 font-semibold">
                  Select an age group above to view available teams
                </p>
                <p className="text-gray-400 text-sm">
                  Teams are filtered based on the selected age group
                </p>
              </div>
            ) : (teamsList.length < 2 && !(isEditMode && homeTeam && awayTeam)) ? (
              /* League / Age Group has fewer than 2 teams */
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl">⚠️</span>
                </div>
                <p className="text-amber-600 font-semibold">
                  This league/age group has {teamsList.length === 0 ? "no" : "only 1"} team assigned.
                </p>
                <p className="text-gray-400 text-sm">
                  Add at least 2 teams to this league and age group to create a match.
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