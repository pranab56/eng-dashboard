/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import BackButton from "@/components/buttons/BackButton";
import ComboboxField from "@/components/form/ComboboxField";
import { useGetAllLeagueQuery } from "@/features/leagueManagement/leagueApi";
import { useGetAllTeamQuery } from "@/features/teamManagement/teamApi";
import { useCreateLeagueTeamMutation } from "@/features/leagueTeam/leagueTeamApi";
import { useHeaders } from "@/hooks/useHeaders";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import Image from "next/image";
import { formatImagePath } from "@/utils/formatImagePath";
import { Check, Search, X, Users, Trophy } from "lucide-react";

// Form Validation Schema
const createLeagueTeamSchema = z.object({
  league: z.string().min(1, "League is required"),
});

type CreateLeagueTeamFormValues = z.infer<typeof createLeagueTeamSchema>;

export default function CreateLeagueTeam() {
  const { setHeaders } = useHeaders();
  const router = useRouter();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [teamSearchTerm, setTeamSearchTerm] = useState("");

  const [createLeagueTeam, { isLoading: isCreating }] =
    useCreateLeagueTeamMutation();
  const { data: leagueData } = useGetAllLeagueQuery({ page: 1, limit: 1000 });
  const { data: teamData } = useGetAllTeamQuery({ page: 1, limit: 1000 });

  // Build option lists from API data
  const leagueOptions = (leagueData?.data || []).map((l: any) => ({
    label: `${l.leagueName} (${l.season})`,
    value: l._id,
  }));

  const teamsList: any[] = teamData?.data || [];

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateLeagueTeamFormValues>({
    resolver: zodResolver(createLeagueTeamSchema),
    defaultValues: {
      league: "",
    },
  });

  useEffect(() => {
    setHeaders({
      title: "Add Teams to League",
      des: "Associate participating clubs with a specific league season.",
    });
  }, [setHeaders]);

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  const filteredTeams = useMemo(() => {
    if (!teamSearchTerm.trim()) return teamsList;
    const q = teamSearchTerm.toLowerCase().trim();
    return teamsList.filter(
      (t) =>
        (t.teamName || "").toLowerCase().includes(q) ||
        (t.shortName || "").toLowerCase().includes(q) ||
        (t.city || "").toLowerCase().includes(q)
    );
  }, [teamsList, teamSearchTerm]);

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredTeams.map((t) => t._id);
    setSelectedTeams((prev) => Array.from(new Set([...prev, ...filteredIds])));
  };

  const handleDeselectAll = () => {
    setSelectedTeams([]);
  };

  const onSubmit = async (data: CreateLeagueTeamFormValues) => {
    if (selectedTeams.length === 0) {
      toast.error("Please select at least one team to associate.");
      return;
    }

    try {
      const payload = {
        league: data.league,
        teams: selectedTeams,
      };

      const res = await createLeagueTeam(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "Teams successfully associated with league");
        router.push("/league-team");
      }
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Failed to associate teams with league"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 sm:p-6 lg:p-8 space-y-6 pb-20 max-w-[1400px] mx-auto text-left"
    >
      <BackButton />

      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Add Teams to League
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select target competition and assign clubs into the tournament roster.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1: League Selection Card */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-slate-500" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Select League Division
            </h2>
          </div>

          <div className="max-w-md">
            <ComboboxField
              name="league"
              label="Competition League & Season"
              control={control}
              error={errors.league}
              options={leagueOptions}
              placeholder="Search or choose a league"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Choose the target league season for these team memberships.
            </p>
          </div>
        </section>

        {/* Step 2: Teams Selection Card */}
        <section className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  2. Select Participating Teams
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Click team cards to toggle their allocation to this league.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-900 text-white shadow-2xs">
                {selectedTeams.length} Selected
              </span>

              {selectedTeams.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={teamSearchTerm}
                onChange={(e) => setTeamSearchTerm(e.target.value)}
                placeholder="Filter teams by name or city..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
              />
              {teamSearchTerm && (
                <button
                  type="button"
                  onClick={() => setTeamSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {filteredTeams.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer text-left sm:text-right"
              >
                Select All Filtered ({filteredTeams.length})
              </button>
            )}
          </div>

          {/* Teams Grid (Compact, Flat, Professional) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 pt-2">
            {filteredTeams.map((team: any) => {
              const isSelected = selectedTeams.includes(team._id);
              const logoUrl = team.teamLogo ? formatImagePath(team.teamLogo) : null;

              return (
                <div
                  key={team._id}
                  onClick={() => toggleTeamSelection(team._id)}
                  className={`group relative p-3 rounded-lg border transition-all cursor-pointer flex flex-col items-center text-center ${
                    isSelected
                      ? "bg-slate-50 border-slate-900 shadow-xs ring-1 ring-slate-900"
                      : "bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Selection Check Indicator */}
                  <div
                    className={`absolute top-2 right-2 w-4 h-4 rounded flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 bg-white group-hover:border-slate-400"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  {/* Logo Box */}
                  <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0 shadow-2xs mb-2">
                    {logoUrl ? (
                      <Image
                        src={logoUrl}
                        alt={team.teamName || "team"}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {team.shortName?.slice(0, 2) ||
                          team.teamName?.slice(0, 2) ||
                          "T"}
                      </span>
                    )}
                  </div>

                  {/* Team Name */}
                  <span className="text-xs font-semibold text-slate-900 truncate w-full leading-tight">
                    {team.teamName || "Untitled Team"}
                  </span>

                  {/* Short Name / Subtitle */}
                  <span className="text-[10px] font-mono text-slate-500 mt-1 uppercase">
                    {team.shortName || team.city || "TEAM"}
                  </span>
                </div>
              );
            })}
          </div>

          {filteredTeams.length === 0 && (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-xs font-medium text-slate-600">
                No teams found matching &ldquo;{teamSearchTerm}&rdquo;
              </p>
            </div>
          )}
        </section>

        {/* Form Actions Footer */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              reset();
              setSelectedTeams([]);
              setTeamSearchTerm("");
            }}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={isCreating || selectedTeams.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            {isCreating ? "Associating Teams..." : "Associate Teams with League"}
          </button>
        </div>
      </div>
    </form>
  );
}
