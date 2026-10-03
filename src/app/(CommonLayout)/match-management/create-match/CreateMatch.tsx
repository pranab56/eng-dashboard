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
import { useHeaders } from "@/hooks/useHeaders";
import { formatImagePath } from "@/utils/formatImagePath";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  Trophy,
  Users,
  Shield,
  Layers,
  AlertCircle,
  CheckCircle2,
  ListOrdered,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useGetAllLeagueTeamQuery } from "../../../../features/leagueTeam/leagueTeamApi";
import { useGetAllTeamQuery } from "@/features/teamManagement/teamApi";
import CustomDatePicker from "@/components/ui/CustomDatePicker";
import { Custom24HourTimePicker } from "./Custom24HourTimePicker";
import { MatchupSelector, Team } from "./MatchupSelector";

// Form Validation Schema
const createMatchSchema = z
  .object({
    venue: z.string().min(1, "Venue is required"),
    subVenue: z.string().optional(),
    pitch: z.string().optional(),
    matchType: z
      .enum(["", "league", "cup", "friendly"])
      .refine((val) => val !== "", {
        message: "Match type is required",
      }),
    league: z.string().optional(),
    ageGroupCategory: z.string().optional(),
    ageGroup: z.string().optional(),
    referee: z.string().optional(),
    durationMinutes: z.string().min(1, "Duration is required"),
    formation: z.string().min(1, "Formation is required"),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Kick-off time is required"),
  })
  .refine(
    (data) => {
      if (data.matchType === "league" && !data.league) {
        return false;
      }
      return true;
    },
    {
      message: "League is required",
      path: ["league"],
    }
  )
  .refine(
    (data) => {
      if (
        (data.matchType === "cup" || data.matchType === "friendly") &&
        !data.ageGroupCategory
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Age Group Category is required",
      path: ["ageGroupCategory"],
    }
  )
  .refine(
    (data) => {
      if (
        (data.matchType === "cup" || data.matchType === "friendly") &&
        !data.ageGroup
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Sub Category is required",
      path: ["ageGroup"],
    }
  );

const formationOptions = [
  { label: "5 v 5", value: "5 v 5" },
  { label: "7 v 7", value: "7 v 7" },
  { label: "8 v 8", value: "8 v 8" },
  { label: "9 v 9", value: "9 v 9" },
];

type CreateMatchFormValues = z.infer<typeof createMatchSchema>;

export type { Team };

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
    referee: string | null;
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
                venue:
                  lastMatch.payload.venueName || lastMatch.display.venue || "",
                subVenue:
                  lastMatch.payload.subVenue ||
                  lastMatch.payload.pitch ||
                  "",
                pitch: lastMatch.payload.pitch || "",
                league: lastMatch.payload.league || "",
                matchType: (lastMatch.payload.matchType || "") as any,
                ageGroupCategory: lastMatch.payload.ageGroupCategory || "",
                ageGroup: lastMatch.payload.ageGroup || "",
                referee: lastMatch.payload.referee || "",
                durationMinutes:
                  lastMatch.payload.durationMinutes?.toString() || "",
                formation:
                  lastMatch.payload.formation ||
                  lastMatch.display.formation ||
                  "",
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

  const leagueTeamList: any[] = useMemo(
    () => leagueTeamData?.data || [],
    [leagueTeamData]
  );
  const venueCategories: any[] = useMemo(
    () => venueCategoryData?.data || [],
    [venueCategoryData]
  );
  const playTimeList: any[] = useMemo(
    () => playTimeData?.data || [],
    [playTimeData]
  );

  // Flatten all age groups & subcategories into a single comprehensive list
  const allAgeGroupOptions = useMemo(() => {
    const apiCats = ageGroupRes?.data?.result || ageGroupRes?.data || [];
    const optionsMap = new Map<
      string,
      { label: string; value: string; categoryId?: string }
    >();

    apiCats.forEach((cat: any) => {
      if (Array.isArray(cat.subCategories) && cat.subCategories.length > 0) {
        cat.subCategories.forEach((sub: any) => {
          if (sub?.name) {
            const key = sub.name.trim();
            if (!optionsMap.has(key)) {
              optionsMap.set(key, {
                label: sub.name,
                value: sub.name,
                categoryId: cat._id || cat.id,
              });
            }
          }
        });
      } else if (cat?.name) {
        const key = cat.name.trim();
        if (!optionsMap.has(key)) {
          optionsMap.set(key, {
            label: cat.name,
            value: cat.name,
            categoryId: cat._id || cat.id,
          });
        }
      }
    });

    return Array.from(optionsMap.values());
  }, [ageGroupRes]);

  // Options for dropdowns
  const leagueOptions = leagueTeamList.map((item: any) => ({
    label: `${item.league.leagueName} (${item.league.season})`,
    value: item.league._id,
  }));

  const watchReferee = watch("referee");

  const refereeOptions = useMemo(() => {
    const list = (refereeData?.data || []).map((r: any) => {
      const displayName =
        r.displayName ||
        r.name ||
        r.userName ||
        (r.firstName ? `${r.firstName} ${r.lastName || ""}`.trim() : r.email || "Referee");
      return {
        label: displayName,
        value: r._id,
      };
    });

    if (watchReferee && watchReferee !== "unassigned") {
      return [{ label: "Unassign Referee", value: "unassigned" }, ...list];
    }
    return list;
  }, [refereeData, watchReferee]);

  const venueOptions = venueCategories.map((v: any) => ({
    label: v.name,
    value: v._id || v.id,
  }));

  const durationOptions = playTimeList.map((p: any) => ({
    label: p.name,
    value: p.name,
  }));

  // Watch fields
  const selectedLeagueId = watch("league");
  const selectedVenueId = watch("venue");
  const selectedAgeGroup = watch("ageGroup");

  // Automatically sync parent ageGroupCategory in the background if needed
  useEffect(() => {
    if (selectedAgeGroup) {
      const matchOpt = allAgeGroupOptions.find(
        (opt) => opt.value === selectedAgeGroup
      );
      if (matchOpt?.categoryId) {
        setValue("ageGroupCategory", matchOpt.categoryId);
      }
    }
  }, [selectedAgeGroup, allAgeGroupOptions, setValue]);

  // Query all teams of selected ageGroup from team collection
  const { data: allTeamsRes } = useGetAllTeamQuery(
    selectedAgeGroup
      ? { ageGroup: selectedAgeGroup, limit: 1000 }
      : { limit: 1000 },
    { skip: watchMatchType !== "cup" && watchMatchType !== "friendly" }
  );

  // Derive venue object and subcategories if present
  const selectedVenueObj = useMemo(() => {
    return venueCategories.find(
      (v: any) =>
        (v._id || v.id) === selectedVenueId || v.name === selectedVenueId
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

  // Reset league or age group fields when matchType switches
  useEffect(() => {
    if (!isEditMode) {
      setHomeTeam(null);
      setAwayTeam(null);
      if (watchMatchType !== "league") {
        setValue("league", "");
      } else {
        setValue("ageGroup", "");
        setValue("ageGroupCategory", "");
      }
    }
  }, [watchMatchType, setValue, isEditMode]);

  // Derive teams for the selected league
  const selectedLeagueEntry = leagueTeamList.find(
    (item: any) => item.league._id === selectedLeagueId
  );
  const rawTeamsList = useMemo(
    () => selectedLeagueEntry?.teams || [],
    [selectedLeagueEntry]
  );

  const teamsList: Team[] = useMemo(() => {
    let baseList: Team[] = [];

    if (watchMatchType === "league") {
      baseList = rawTeamsList.map((t: any) => ({
        value: (t._id || t.id || t).toString(),
        name: t.teamName,
        logo: t.teamLogo || null,
      }));
    } else if (watchMatchType === "cup" || watchMatchType === "friendly") {
      const fetchedTeams =
        allTeamsRes?.data?.result || allTeamsRes?.data || [];
      if (Array.isArray(fetchedTeams)) {
        baseList = fetchedTeams.map((t: any) => ({
          value: (t._id || t.id).toString(),
          name: t.teamName || t.name || "Unknown Team",
          logo: t.teamLogo || t.logo || null,
        }));
      }
    }

    // In edit mode, ensure current homeTeam and awayTeam remain visible even if filters change
    if (isEditMode) {
      if (homeTeam && !baseList.some((t) => t.value === homeTeam.value)) {
        baseList.push(homeTeam);
      }
      if (awayTeam && !baseList.some((t) => t.value === awayTeam.value)) {
        baseList.push(awayTeam);
      }
    }

    return baseList;
  }, [rawTeamsList, watchMatchType, allTeamsRes, homeTeam, awayTeam, isEditMode]);

  // Reset home/away teams when league or ageGroup changes (in create mode)
  useEffect(() => {
    if (!isEditMode) {
      setHomeTeam(null);
      setAwayTeam(null);
    }
  }, [selectedLeagueId, selectedAgeGroup, isEditMode]);

  useEffect(() => {
    setHeaders({
      title: isEditMode ? "Edit Match" : "Create Match",
      des: isEditMode
        ? "Update details for this match."
        : "Configure fixtures, schedules, and team matchups.",
    });
  }, [setHeaders, isEditMode]);

  // Populate form in edit mode
  useEffect(() => {
    if (matchData?.data) {
      const match = matchData.data;
      const date = dayjs(match.matchDate).tz("Europe/London");

      let venueVal =
        (typeof match.venueCategory === "object"
          ? match.venueCategory?._id || match.venueCategory?.id
          : match.venueCategory) ||
        (typeof match.venueName === "object"
          ? match.venueName?._id
          : match.venueName) ||
        "";

      if (
        venueVal &&
        !/^[0-9a-fA-F]{24}$/.test(venueVal) &&
        venueCategories.length > 0
      ) {
        const found = venueCategories.find(
          (v: any) => v.name?.toLowerCase() === venueVal.toLowerCase()
        );
        if (found) {
          venueVal = found._id || found.id;
        }
      }

      const selectedVenueObjLocal = venueCategories.find(
        (v: any) => (v._id || v.id) === venueVal || v.name === venueVal
      );
      const subCatsLocal = selectedVenueObjLocal?.subCategories || [];

      let subVal =
        (typeof match.venueSubCategory === "object"
          ? match.venueSubCategory?._id || match.venueSubCategory?.id
          : match.venueSubCategory) ||
        (typeof match.subVenue === "object"
          ? match.subVenue?._id
          : match.subVenue) ||
        (typeof match.pitch === "object"
          ? match.pitch?._id
          : match.pitch) ||
        "";

      if (
        subVal &&
        !/^[0-9a-fA-F]{24}$/.test(subVal) &&
        subCatsLocal.length > 0
      ) {
        const found = subCatsLocal.find(
          (s: any) => s.name?.toLowerCase() === subVal.toLowerCase()
        );
        if (found) {
          subVal = found._id || found.id;
        }
      }

      let durVal =
        typeof match.durationMinutes === "object"
          ? match.durationMinutes?.name
          : match.durationMinutes || "";
      const durMatch = String(durVal).match(/\d+/);
      if (durMatch && playTimeList.length > 0) {
        const durNumber = durMatch[0];
        const foundOpt = playTimeList.find((p: any) =>
          p.name?.startsWith(durNumber)
        );
        if (foundOpt) {
          durVal = foundOpt.name;
        }
      }

      let formationVal = match.formation || "";
      if (formationVal) {
        formationVal = formationVal.replace(/\s+/g, " ").trim();
      }
      if (formationVal && !formationVal.includes(" v ")) {
        const matchDigits = formationVal.match(/\d+/g);
        if (matchDigits && matchDigits.length === 2) {
          formationVal = `${matchDigits[0]} v ${matchDigits[1]}`;
        }
      }

      let ageGroupCategoryVal =
        (typeof match.ageGroupCategory === "object"
          ? match.ageGroupCategory?._id || match.ageGroupCategory?.id
          : match.ageGroupCategory) || "";

      if (!ageGroupCategoryVal && match.ageGroup && ageGroupRes?.data?.result) {
        const apiCats = ageGroupRes.data.result || ageGroupRes.data || [];
        if (Array.isArray(apiCats)) {
          const foundParent = apiCats.find((parent: any) =>
            parent.subCategories?.some(
              (sub: any) =>
                sub.name?.toLowerCase() === match.ageGroup.toLowerCase()
            )
          );
          if (foundParent) {
            ageGroupCategoryVal = foundParent._id || foundParent.id;
          }
        }
      }

      const resetPayload = {
        venue: venueVal,
        subVenue: subVal,
        pitch: subVal,
        league:
          typeof match.league === "object"
            ? match.league?._id || match.league?.id
            : match.league || "",
        ageGroupCategory: ageGroupCategoryVal,
        ageGroup: match.ageGroup || "",
        matchType: (match.matchType || "league") as
          | "league"
          | "cup"
          | "friendly",
        referee:
          typeof match.referee === "object"
            ? match.referee?._id || match.referee?.id
            : match.referee || "",
        durationMinutes: durVal,
        formation: formationVal,
        date: date.format("YYYY-MM-DD"),
        time: date.format("HH:mm"),
      };

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
  }, [
    matchData,
    venueCategoryData,
    refereeData,
    playTimeData,
    reset,
    playTimeList,
    venueCategories,
    ageGroupRes,
  ]);

  // Set subVenue / pitch when subCategoriesList is ready in edit mode
  useEffect(() => {
    if (isEditMode && matchData?.data && subCategoriesList.length > 0) {
      const match = matchData.data;
      let subVal =
        (typeof match.venueSubCategory === "object"
          ? match.venueSubCategory?._id || match.venueSubCategory?.id
          : match.venueSubCategory) ||
        (typeof match.subVenue === "object"
          ? match.subVenue?._id
          : match.subVenue) ||
        (typeof match.pitch === "object"
          ? match.pitch?._id
          : match.pitch) ||
        "";

      if (subVal && !/^[0-9a-fA-F]{24}$/.test(subVal)) {
        const found = subCategoriesList.find(
          (s: any) => s.name?.toLowerCase() === subVal.toLowerCase()
        );
        if (found) {
          subVal = found._id || found.id;
        }
      }

      if (subVal) {
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
      matchType: (match.payload.matchType || "league") as
        | "league"
        | "cup"
        | "friendly",
      referee: match.payload.referee || "",
      durationMinutes:
        match.payload.durationMinutes || match.display.durationMinutes,
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
    toast.info(`Editing fixture: ${match.display.homeTeamName} vs ${match.display.awayTeamName}`);
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

  const onError = (formErrors: any) => {
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstError = formErrors[errorKeys[0]];
      if (firstError?.message) {
        toast.error(firstError.message);
      }
    }
  };

  const handleSwapTeams = () => {
    const prevHome = homeTeam;
    const prevAway = awayTeam;
    setHomeTeam(prevAway);
    setAwayTeam(prevHome);
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

      const selectedSubCategoryVal =
        formData.subVenue || formData.pitch || "";

      const selectedVenueLabel =
        selectedVenueObj?.name || formData.venue;
      const selectedSubVenueObj = subCategoriesList.find(
        (s: any) =>
          (s._id || s.id) === selectedSubCategoryVal ||
          s.name === selectedSubCategoryVal
      );
      const selectedSubVenueLabel =
        selectedSubVenueObj?.name || selectedSubCategoryVal || "";

      const payload: any = {
        league: formData.matchType === "league" ? formData.league || undefined : undefined,
        matchType: formData.matchType,
        ageGroupCategory: formData.ageGroupCategory || undefined,
        ageGroup: formData.ageGroup || undefined,
        homeTeam: homeTeam.value,
        awayTeam: awayTeam.value,
        matchDate,
        durationMinutes: formData.durationMinutes,
        formation: formData.formation,
        venueName: formData.venue,
        pitch: selectedSubCategoryVal,
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
        const selectedLeagueObj = leagueOptions.find(
          (opt: any) => opt.value === formData.league
        );
        const leagueLabel = selectedLeagueObj
          ? selectedLeagueObj.label
          : "Friendly Match";
        const refereeLabel =
          refereeOptions.find((opt: any) => opt.value === formData.referee)
            ?.label || "Unassigned";

        const display = {
          leagueName: formData.ageGroup
            ? `${leagueLabel} (${formData.ageGroup})`
            : leagueLabel,
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

        // Reset form for next entry while preserving venue and date
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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
        <span className="text-sm font-medium text-slate-500">Loading fixture details...</span>
      </div>
    );
  }

  const homeTeamOptions = teamsList.filter((t) => t.value !== awayTeam?.value);
  const awayTeamOptions = teamsList.filter((t) => t.value !== homeTeam?.value);

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditMode ? "Edit Match Fixture" : "Create Match Fixture"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? "Modify match schedule, pitch, or participating teams."
                : "Schedule a single match or build a queue of multiple fixtures."}
            </p>
          </div>
        </div>

        {/* Staged Matches summary pill in header */}
        {!isEditMode && tempMatches.length > 0 && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-slate-500" />
              <span>{tempMatches.length} fixture{tempMatches.length > 1 ? "s" : ""} in queue</span>
            </span>
            <button
              type="button"
              onClick={handleCreateMatches}
              disabled={isCreating}
              className="h-8 px-3 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCreating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Publish All</span>
            </button>
          </div>
        )}
      </div>

      {/* Editing Queued Match banner */}
      {editingTempId && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs flex items-center justify-between text-amber-800">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Editing Queued Fixture:</strong> Make your changes below and click <strong>&quot;Save Queued Match&quot;</strong> to apply.
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancelOrReset}
            className="text-amber-800 hover:text-amber-950 font-semibold underline cursor-pointer shrink-0 ml-4"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Primary Configuration Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section: Match Configuration (7 cols on lg) */}
        <section className="lg:col-span-7 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Competition & Match Settings
              </h2>
            </div>
            <span className="text-[11px] font-medium text-slate-400">
              Required parameters
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Match Type */}
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

            {/* League (if matchType === league) */}
            {watchMatchType === "league" && (
              <SelectField
                name="league"
                label="League"
                control={control}
                error={errors.league}
                options={leagueOptions}
                placeholder="Select league"
                scrollable
              />
            )}

            {/* Age Group (if cup or friendly) */}
            {(watchMatchType === "cup" || watchMatchType === "friendly") && (
              <SelectField
                name="ageGroup"
                label="Age Group"
                control={control}
                error={errors.ageGroup}
                options={allAgeGroupOptions}
                placeholder="Select age group (e.g. U7)"
                scrollable
              />
            )}

            {/* Formation */}
            <SelectField
              name="formation"
              label="Formation"
              control={control}
              error={errors.formation}
              options={formationOptions}
              placeholder="Select formation"
              scrollable
            />

            {/* Referee (Optional) */}
            <SelectField
              name="referee"
              label="Match Official / Referee"
              control={control}
              error={errors.referee}
              options={refereeOptions}
              placeholder="Select referee (optional)"
              scrollable
            />
          </div>
        </section>

        {/* Right Section: Schedule & Venue (5 cols on lg) */}
        <section className="lg:col-span-5 bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Schedule & Venue
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Europe/London
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Match Date */}
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

              {/* Kick-off Time */}
              <Controller
                name="time"
                control={control}
                render={({ field }) => (
                  <Custom24HourTimePicker
                    label="Kick-off Time"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.time?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration */}
              <SelectField
                name="durationMinutes"
                label="Duration"
                control={control}
                error={errors.durationMinutes}
                options={durationOptions}
                placeholder="Select duration"
                scrollable
              />

              {/* Venue Name */}
              <SelectField
                name="venue"
                label="Venue Name"
                control={control}
                error={errors.venue}
                options={venueOptions}
                placeholder="Select venue"
                scrollable
              />
            </div>

            {/* Sub Category / Pitch (if available) */}
            {subCategoriesList.length > 0 && (
              <SelectField
                name="subVenue"
                label="Pitch / Sub-Venue"
                control={control}
                error={errors.subVenue}
                options={subVenueOptions}
                placeholder="Select pitch / subcategory"
                scrollable
              />
            )}
          </div>
        </section>
      </div>

      {/* Matchup Selection Card */}
      <section className="bg-white rounded-lg border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Team Matchup Selection
              </h2>
              <p className="text-[11px] text-slate-500">
                Select home and away clubs. Both teams must be distinct.
              </p>
            </div>
          </div>

          {homeTeam && awayTeam && (
            <button
              type="button"
              onClick={handleSwapTeams}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Swap Sides</span>
            </button>
          )}
        </div>

        {/* State-driven Content */}
        {!watchMatchType ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
              <Layers className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Select a match type to load teams
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Teams will become selectable once league or tournament parameters are set above.
            </p>
          </div>
        ) : watchMatchType === "league" && !selectedLeagueId ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
              <Trophy className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Select a league from the options above
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Available participating teams are filtered automatically by league.
            </p>
          </div>
        ) : (watchMatchType === "cup" || watchMatchType === "friendly") && !selectedAgeGroup ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-slate-50/60 rounded-lg border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Select an age group to display registered teams
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Cup and friendly matchups require selecting an age group category.
            </p>
          </div>
        ) : teamsList.length < 2 && !(isEditMode && homeTeam && awayTeam) ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-800 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-semibold">Insufficient teams available</p>
              <p className="text-amber-700 mt-0.5">
                This league or age group has {teamsList.length === 0 ? "no" : "only 1"} team registered. Add at least two teams to schedule fixtures.
              </p>
            </div>
          </div>
        ) : (
          <MatchupSelector
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            homeTeamOptions={homeTeamOptions}
            awayTeamOptions={awayTeamOptions}
            onSelectHome={setHomeTeam}
            onSelectAway={setAwayTeam}
            onSwapTeams={handleSwapTeams}
          />
        )}

        {/* Same-team warning */}
        {homeTeam && awayTeam && homeTeam.value === awayTeam.value && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Home team and away team cannot be identical. Please select different teams.</span>
          </div>
        )}
      </section>

      {/* Temp Matches Staging Queue */}
      {!isEditMode && tempMatches.length > 0 && (
        <section className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <ListOrdered className="w-4 h-4 text-slate-600" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Staged Fixtures Queue ({tempMatches.length})
                </h2>
                <p className="text-[11px] text-slate-500">
                  Review matches before committing to the schedule.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCreateMatches}
              disabled={isCreating}
              className="h-8 px-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {isCreating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              <span>Submit All ({tempMatches.length}) Fixtures</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Fixture</th>
                  <th className="py-2.5 px-4">Competition</th>
                  <th className="py-2.5 px-4">Schedule</th>
                  <th className="py-2.5 px-4">Venue & Pitch</th>
                  <th className="py-2.5 px-4">Referee</th>
                  <th className="py-2.5 px-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tempMatches.map((m, index) => {
                  const isBeingEdited = editingTempId === m.id;
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBeingEdited ? "bg-amber-50/60 font-medium" : ""
                      }`}
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono">
                        {index + 1}
                      </td>

                      {/* Fixture (Home vs Away with crests) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            {m.display.homeTeamLogo && (
                              <Image
                                src={m.display.homeTeamLogo}
                                alt={m.display.homeTeamName}
                                width={18}
                                height={18}
                                className="object-contain inline-block shrink-0"
                              />
                            )}
                            <span className="truncate max-w-[120px]">{m.display.homeTeamName}</span>
                          </div>

                          <span className="text-[10px] text-slate-400 font-bold px-1">vs</span>

                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            {m.display.awayTeamLogo && (
                              <Image
                                src={m.display.awayTeamLogo}
                                alt={m.display.awayTeamName}
                                width={18}
                                height={18}
                                className="object-contain inline-block shrink-0"
                              />
                            )}
                            <span className="truncate max-w-[120px]">{m.display.awayTeamName}</span>
                          </div>

                          {isBeingEdited && (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded ml-1">
                              Editing
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Competition & Formation */}
                      <td className="py-3 px-4 text-slate-600">
                        <div>
                          <span className="font-medium text-slate-800 truncate block max-w-[140px]">
                            {m.display.leagueName}
                          </span>
                          {m.display.formation && (
                            <span className="text-[10px] text-slate-400">
                              {m.display.formation}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Schedule (Date & Time) */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-1 font-medium text-slate-800">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {m.display.date}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {m.display.time} ({m.display.durationMinutes})
                          </span>
                        </div>
                      </td>

                      {/* Venue & Pitch */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1 max-w-[160px] truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate font-medium text-slate-800">
                            {m.display.venue}
                          </span>
                        </div>
                        {m.display.pitch && (
                          <span className="text-[10px] text-slate-400 block pl-4 truncate">
                            Pitch: {m.display.pitch}
                          </span>
                        )}
                      </td>

                      {/* Referee */}
                      <td className="py-3 px-4 text-slate-600">
                        <span className="text-xs truncate block max-w-[120px]">
                          {m.display.refereeName || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditTempMatch(m)}
                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit this queued match"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTempMatch(m.id)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from queue"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Form Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <CancelButton onClick={handleCancelOrReset} title="Clear Selection" />

          {!isEditMode && (
            <button
              type="button"
              onClick={handleFullReset}
              className="h-10 px-4 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Reset Form
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {isEditMode ? (
            <SubmitButton
              text="Update Match"
              isLoading={isUpdating}
              disabled={isUpdating}
              className="h-10 px-6 text-xs sm:text-sm"
            />
          ) : (
            <>
              <SubmitButton
                text={editingTempId ? "Save Queued Match" : "+ Add Match to Queue"}
                disabled={isCreating}
                className="h-10 px-6 text-xs sm:text-sm"
              />

              {tempMatches.length > 0 && (
                <button
                  type="button"
                  onClick={handleCreateMatches}
                  disabled={isCreating}
                  className="h-10 px-6 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Publish All ({tempMatches.length})</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
};

export default CreateMatch;
