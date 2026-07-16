/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import CancelButton from '@/components/buttons/CancelButton';
import SubmitButton from '@/components/buttons/SubmitButton';
import { useHeaders } from '@/hooks/useHeaders';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { useCreatePlayerEconomyMutation, useGetPlayerEconomyQuery } from '@/features/player/playerApi';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Zod Scheme verification
const coinMarketSchema = z.object({
  coin: z.number(),
  marketValue: z.number()
});

const playerEconomySchema = z.object({
  startingMarketValue: z.number().min(1, "Starting Market Value is required"),
  conversionRate: z.number().min(1, "Conversion rate is required"),
  playingMatch: coinMarketSchema,
  goal: coinMarketSchema,
  assist: coinMarketSchema,
  cleanSheet: coinMarketSchema,
  goodRating: coinMarketSchema,
  greatRating: coinMarketSchema,
  eliteRating: coinMarketSchema,
  playerOfTheDay: coinMarketSchema,
  yellowCard: coinMarketSchema,
  sinBin: coinMarketSchema,
  redCard: coinMarketSchema,
  disrespectToReferee: coinMarketSchema,
  grossMisconduct: coinMarketSchema,
});

type PlayerEconomyFormValues = z.infer<typeof playerEconomySchema>;

export default function PlayerEconomyPage() {
  const { setHeaders } = useHeaders();
  const router = useRouter();

  const { data: economyData, isLoading } = useGetPlayerEconomyQuery({});
  const [updatePlayerEconomy, { isLoading: isUpdating }] = useCreatePlayerEconomyMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<PlayerEconomyFormValues>({
    resolver: zodResolver(playerEconomySchema),
    defaultValues: {
      startingMarketValue: 100000,
      conversionRate: 10,
      playingMatch: { coin: 0, marketValue: 0 },
      goal: { coin: 0, marketValue: 0 },
      assist: { coin: 0, marketValue: 0 },
      cleanSheet: { coin: 0, marketValue: 0 },
      goodRating: { coin: 0, marketValue: 0 },
      greatRating: { coin: 0, marketValue: 0 },
      eliteRating: { coin: 0, marketValue: 0 },
      playerOfTheDay: { coin: 0, marketValue: 0 },
      yellowCard: { coin: 0, marketValue: 0 },
      sinBin: { coin: 0, marketValue: 0 },
      redCard: { coin: 0, marketValue: 0 },
      disrespectToReferee: { coin: 0, marketValue: 0 },
      grossMisconduct: { coin: 0, marketValue: 0 },
    }
  });

  useEffect(() => {
    setHeaders({
      title: "Player Economy Settings",
      des: "Configure coin scales, penalties, and multipliers affecting player valuations."
    });
  }, [setHeaders]);

  useEffect(() => {
    if (economyData?.data) {
      const data = economyData.data;
      reset({
        startingMarketValue: data.startingMarketValue || 100000,
        conversionRate: data.conversionRate || 10,
        playingMatch: { coin: data.playingMatch?.coin || 0, marketValue: data.playingMatch?.marketValue || 0 },
        goal: { coin: data.goal?.coin || 0, marketValue: data.goal?.marketValue || 0 },
        assist: { coin: data.assist?.coin || 0, marketValue: data.assist?.marketValue || 0 },
        cleanSheet: { coin: data.cleanSheet?.coin || 0, marketValue: data.cleanSheet?.marketValue || 0 },
        goodRating: { coin: data.goodRating?.coin || 0, marketValue: data.goodRating?.marketValue || 0 },
        greatRating: { coin: data.greatRating?.coin || 0, marketValue: data.greatRating?.marketValue || 0 },
        eliteRating: { coin: data.eliteRating?.coin || 0, marketValue: data.eliteRating?.marketValue || 0 },
        playerOfTheDay: { coin: data.playerOfTheDay?.coin || 0, marketValue: data.playerOfTheDay?.marketValue || 0 },
        yellowCard: { coin: data.yellowCard?.coin || 0, marketValue: data.yellowCard?.marketValue || 0 },
        sinBin: { coin: data.sinBin?.coin || 0, marketValue: data.sinBin?.marketValue || 0 },
        redCard: { coin: data.redCard?.coin || 0, marketValue: data.redCard?.marketValue || 0 },
        disrespectToReferee: { coin: data.disrespectToReferee?.coin || 0, marketValue: data.disrespectToReferee?.marketValue || 0 },
        grossMisconduct: { coin: data.grossMisconduct?.coin || 0, marketValue: data.grossMisconduct?.marketValue || 0 },
      });
    }
  }, [economyData, reset]);

  const conversionRate = watch("conversionRate");

  // Automatically recalculate market values if conversion rate changes
  useEffect(() => {
    if (typeof conversionRate === "number") {
      const keys = [
        "playingMatch",
        "goal",
        "assist",
        "cleanSheet",
        "goodRating",
        "greatRating",
        "eliteRating",
        "playerOfTheDay",
        "yellowCard",
        "sinBin",
        "redCard",
        "disrespectToReferee",
        "grossMisconduct",
      ];
      keys.forEach(k => {
        const coin = watch(`${k}.coin` as any);
        if (typeof coin === "number") {
          setValue(`${k}.marketValue` as any, coin * conversionRate);
        }
      });
    }
  }, [conversionRate]);

  // Recalculate on individual coin change
  const handleCoinChange = (key: string, val: number) => {
    const rate = watch("conversionRate") || 0;
    setValue(`${key}.marketValue` as any, val * rate);
  };

  const onSubmit = async (data: PlayerEconomyFormValues) => {
    try {
      const res = await updatePlayerEconomy(data).unwrap();
      if (res.success) {
        toast.success(res.message || "Player Economy parameters updated successfully!");
        router.push("/player-management");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update configuration");
    }
  };

  const rewardFields = [
    { key: "playingMatch", label: "Playing a Match" },
    { key: "goal", label: "Score a Goal" },
    { key: "assist", label: "Assist" },
    { key: "cleanSheet", label: "Clean Sheet (GK/DEF only)" },
    { key: "goodRating", label: "Rating: Good (7.0-7.9)" },
    { key: "greatRating", label: "Rating: Great (8.0 - 8.9)" },
    { key: "eliteRating", label: "Rating: Elite (9.0 - 10.0)" },
    { key: "playerOfTheDay", label: "Player of the Day (Manual)" },
  ];

  const penaltyFields = [
    { key: "yellowCard", label: "Yellow Card" },
    { key: "sinBin", label: "Sin Bin" },
    { key: "redCard", label: "Red Card" },
    { key: "disrespectToReferee", label: "Disrespect to Referee" },
    { key: "grossMisconduct", label: "Gross Misconduct" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-500 font-medium">Loading Economy Settings...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full py-5 px-6 space-y-8">
      {/* Top Header Row with Custom Back Button */}
      <div className="flex items-center gap-4">
        <Link href="/player-management" className="w-10 h-10 border-2 border-yellow-600 rounded-full flex items-center justify-center text-yellow-600 hover:bg-yellow-50 transition-all select-none cursor-pointer">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
          <span>Player Management</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">View & Edit Player Economy</span>
        </div>
      </div>

      {/* General Configurations */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center gap-2">
          General Configurations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Starting Market Value (£)</label>
            <div className="relative">
              <input
                type="number"
                {...register("startingMarketValue", { valueAsNumber: true })}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
              />
            </div>
            {errors.startingMarketValue && <p className="text-xs text-red-500">{errors.startingMarketValue.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Conversion Rate (£ per Coin)</label>
            <div className="relative">
              <input
                type="number"
                {...register("conversionRate", { valueAsNumber: true })}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-905 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
              />
            </div>
            {errors.conversionRate && <p className="text-xs text-red-500">{errors.conversionRate.message}</p>}
          </div>
        </div>
      </section>

      {/* Reward Configurations Card */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Reward Configurations</h2>
        <p className="text-sm text-gray-400 font-semibold mb-8">Coins awarded per event</p>

        <div className="space-y-6">
          {rewardFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">{field.label}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coin Reward */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 text-xs font-medium tracking-wider select-none">Coin Reward:</span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-32 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
                {/* Budget Impact */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 text-xs font-medium tracking-wider select-none font-sans">Budget Impact (£):</span>
                  <input
                    type="number"
                    {...register(`${field.key}.marketValue` as any, { valueAsNumber: true })}
                    className="w-full pl-40 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Penalty Settings Card */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Penalty Settings</h2>
        <p className="text-sm text-gray-400 font-semibold mb-8">Configure coin deductions for infractions</p>

        <div className="space-y-6">
          {penaltyFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">{field.label}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coin Reward */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 text-medium tracking-wider select-none">Coin Reward:</span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-32 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
                {/* Budget Impact */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-450 text-xs font-medium tracking-wider select-none font-sans">Budget Impact (£):</span>
                  <input
                    type="number"
                    {...register(`${field.key}.marketValue` as any, { valueAsNumber: true })}
                    className="w-full pl-40 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Action Footer Button Group */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-lg shadow-gray-200/30 flex items-center justify-end space-x-5">
        <CancelButton onClick={() => router.push("/player-management")} title="Cancel" />
        <SubmitButton isSubmitting={isUpdating} title="Save Changes" />
      </div>
    </form>
  );
}