"use client"
import BackButton from '@/components/buttons/BackButton'
import CancelButton from '@/components/buttons/CancelButton'
import SubmitButton from '@/components/buttons/SubmitButton'
import ComboboxField from '@/components/form/ComboboxField'
import { useGetAllLeagueQuery } from '@/features/leagueManagement/leagueApi'
import { useGetAllTeamQuery } from '@/features/teamManagement/teamApi'
import { useCreateLeagueTeamMutation } from '@/features/leagueTeam/leagueTeamApi'
import { useHeaders } from '@/hooks/useHeaders'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import Image from 'next/image'
import { baseURL } from '@/utils/BaseURL'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { LeagueRecord, SelectOption, TeamRecord } from '@/types/dashboard'
import { getErrorMessage } from '@/utils/getErrorMessage'

// Form Validation Schema
const createLeagueTeamSchema = z.object({
  league: z.string().min(1, "League is required"),
});

type CreateLeagueTeamFormValues = z.infer<typeof createLeagueTeamSchema>

const CreateLeagueTeam = () => {
  const { setHeaders } = useHeaders()
  const router = useRouter();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const [createLeagueTeam, { isLoading: isCreating }] = useCreateLeagueTeamMutation();
  const { data: leagueData } = useGetAllLeagueQuery({ page: 1, limit: 1000 });
  const { data: teamData } = useGetAllTeamQuery({ page: 1, limit: 1000 });

  // Build option lists from API data
  const leagueOptions: SelectOption[] = (leagueData?.data as LeagueRecord[] || []).map((l) => ({
    label: `${l.leagueName} (${l.season})`,
    value: l._id,
  }));

  const teamsList: TeamRecord[] = teamData?.data || [];

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<CreateLeagueTeamFormValues>({
    resolver: zodResolver(createLeagueTeamSchema),
    defaultValues: {
      league: "",
    }
  })

  useEffect(() => {
    setHeaders({
      title: "Add Teams to League",
      des: "Associate multiple teams with a specific league season."
    })
  }, [setHeaders])

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId) 
        : [...prev, teamId]
    );
  };

  const onSubmit = async (data: CreateLeagueTeamFormValues) => {
    if (selectedTeams.length === 0) {
      toast.error("Please select at least one team");
      return;
    }

    try {
      const payload = {
        league: data.league,
        teams: selectedTeams,
      };

      const res = await createLeagueTeam(payload).unwrap();
      if (res.success) {
        toast.success(res.message || "League teams associated successfully")
        router.push("/league-team")
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to associate teams with league"))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="py-10 px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <BackButton />
      
      <div className='w-full flex flex-col md:flex-row gap-6'>
        <div className='flex-1 space-y-6'>
          {/* League Selection Card */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">League Selection</h2>
            <div className="max-w-md">
              <ComboboxField
                name="league"
                label="Select League"
                control={control}
                error={errors.league}
                options={leagueOptions}
                placeholder="Choose a league"
              />
            </div>
          </section>

          {/* Teams Grid Selection */}
          <section className="bg-white rounded-xl p-8 md:p-10 border border-gray-50 shadow-xl shadow-gray-200/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Select Teams</h2>
                <p className="text-sm text-gray-400 mt-1">Click on teams to add them to this league.</p>
              </div>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold text-sm">
                {selectedTeams.length} Teams Selected
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {teamsList.map((team) => {
                const isSelected = selectedTeams.includes(team._id);
                return (
                  <div
                    key={team._id}
                    onClick={() => toggleTeamSelection(team._id)}
                    className={cn(
                      "relative group cursor-pointer transition-all duration-300 rounded-2xl p-4 flex flex-col items-center border-2",
                      isSelected 
                        ? "bg-blue-50 border-blue-500 shadow-md transform scale-[1.02]" 
                        : "bg-gray-50 border-transparent hover:border-gray-200"
                    )}
                  >
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full animate-in zoom-in duration-300">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Logo */}
                    <div className={cn(
                      "w-20 h-20 rounded-xl bg-white flex items-center justify-center mb-3 shadow-sm overflow-hidden",
                      isSelected ? "border border-blue-100" : ""
                    )}>
                      {team.teamLogo ? (
                        <Image
                          src={baseURL + team.teamLogo}
                          alt={team.teamName}
                          width={80}
                          height={80}
                          className="object-contain p-2"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-gray-300">
                          {team.teamName?.[0]}
                        </span>
                      )}
                    </div>

                    {/* Name */}
                    <span className={cn(
                      "text-xs font-bold text-center line-clamp-1",
                      isSelected ? "text-blue-900" : "text-gray-600"
                    )}>
                      {team.teamName}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Form Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-50 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-4">
            <CancelButton onClick={() => {
              reset();
              setSelectedTeams([]);
            }} title="Reset" />
            <SubmitButton isSubmitting={isCreating} title="Associate Teams" />
          </div>
        </div>
      </div>
    </form>
  )
}

export default CreateLeagueTeam;
