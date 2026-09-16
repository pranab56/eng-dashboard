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
import { ArrowLeft, Calculator } from 'lucide-react';
import Link from 'next/link';

// Zod Schema verification
const coinMarketSchema = z.object({
  coin: z.number(),
  marketValue: z.number()
});

const playerEconomySchema = z.object({
  startingCoins: z.number().min(0, "Starting coins must be a positive number"),
  startingMarketValue: z.number().min(0, "Starting Market Value is required"),
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
  foul: coinMarketSchema,
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
      startingCoins: 1000,
      startingMarketValue: 100000,
      conversionRate: 100,
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
      foul: { coin: 0, marketValue: 0 },
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
      const rate = Number(data.conversionRate) || 100;
      const initialMarketVal = Number(data.startingMarketValue) || 100000;
      const initialCoins = data.startingCoins !== undefined
        ? Number(data.startingCoins)
        : (rate > 0 ? Math.round(initialMarketVal / rate) : 1000);

      reset({
        startingCoins: initialCoins,
        startingMarketValue: initialCoins * rate,
        conversionRate: rate,
        playingMatch: { coin: data.playingMatch?.coin || 0, marketValue: (data.playingMatch?.coin || 0) * rate },
        goal: { coin: data.goal?.coin || 0, marketValue: (data.goal?.coin || 0) * rate },
        assist: { coin: data.assist?.coin || 0, marketValue: (data.assist?.coin || 0) * rate },
        cleanSheet: { coin: data.cleanSheet?.coin || 0, marketValue: (data.cleanSheet?.coin || 0) * rate },
        goodRating: { coin: data.goodRating?.coin || 0, marketValue: (data.goodRating?.coin || 0) * rate },
        greatRating: { coin: data.greatRating?.coin || 0, marketValue: (data.greatRating?.coin || 0) * rate },
        eliteRating: { coin: data.eliteRating?.coin || 0, marketValue: (data.eliteRating?.coin || 0) * rate },
        playerOfTheDay: { coin: data.playerOfTheDay?.coin || 0, marketValue: (data.playerOfTheDay?.coin || 0) * rate },
        yellowCard: { coin: data.yellowCard?.coin || 0, marketValue: (data.yellowCard?.coin || 0) * rate },
        sinBin: { coin: data.sinBin?.coin || 0, marketValue: (data.sinBin?.coin || 0) * rate },
        redCard: { coin: data.redCard?.coin || 0, marketValue: (data.redCard?.coin || 0) * rate },
        disrespectToReferee: { coin: data.disrespectToReferee?.coin || 0, marketValue: (data.disrespectToReferee?.coin || 0) * rate },
        grossMisconduct: { coin: data.grossMisconduct?.coin || 0, marketValue: (data.grossMisconduct?.coin || 0) * rate },
        foul: { coin: data.foul?.coin || 0, marketValue: (data.foul?.coin || 0) * rate },
      });
    }
  }, [economyData, reset]);

  const conversionRate = watch("conversionRate");
  const startingCoins = watch("startingCoins");

  // Automatically recalculate market values when conversion rate or starting coins changes
  useEffect(() => {
    const rate = Number(conversionRate) || 0;
    const coins = Number(startingCoins) || 0;
    setValue("startingMarketValue", coins * rate);

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
      "foul",
    ];
    keys.forEach((k) => {
      const coin = watch(`${k}.coin` as any);
      if (typeof coin === "number") {
        setValue(`${k}.marketValue` as any, coin * rate);
      }
    });
  }, [conversionRate, startingCoins]);

  // Recalculate on individual coin change
  const handleCoinChange = (key: string, val: number) => {
    const rate = Number(watch("conversionRate")) || 0;
    setValue(`${key}.marketValue` as any, val * rate);
  };

  const onSubmit = async (data: PlayerEconomyFormValues) => {
    try {
      const rate = Number(data.conversionRate) || 0;
      const coins = Number(data.startingCoins) || 0;
      data.startingMarketValue = coins * rate;

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
        "foul",
      ] as const;

      keys.forEach((k) => {
        if (data[k]) {
          data[k].marketValue = Number(data[k].coin || 0) * rate;
        }
      });

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
    { key: "goodRating", label: "Rating: Good (7.0 - 7.9)" },
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
    { key: "foul", label: "Foul" },
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              General Valuation Configurations
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Define coin starting balance and base conversion multiplier</p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            1 Coin = £{watch("conversionRate") || 0}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starting Coins Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Starting Coins (ENG Coins)</label>
            <div className="relative">
              <input
                type="number"
                {...register("startingCoins", { valueAsNumber: true })}
                onChange={(e) => {
                  const coins = Number(e.target.value) || 0;
                  const rate = Number(watch("conversionRate")) || 0;
                  setValue("startingCoins", coins);
                  setValue("startingMarketValue", coins * rate);
                }}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
                placeholder="e.g. 1000"
              />
            </div>
            {errors.startingCoins && <p className="text-xs text-red-500">{errors.startingCoins.message}</p>}
            <p className="text-[11px] text-gray-400">Initial coins allocated to new player profiles</p>
          </div>

          {/* Conversion Rate Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Conversion Rate (£ per Coin)</label>
            <div className="relative">
              <input
                type="number"
                {...register("conversionRate", { valueAsNumber: true })}
                onChange={(e) => {
                  const rate = Number(e.target.value) || 0;
                  const coins = Number(watch("startingCoins")) || 0;
                  setValue("conversionRate", rate);
                  setValue("startingMarketValue", coins * rate);
                }}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
                placeholder="e.g. 100"
              />
            </div>
            {errors.conversionRate && <p className="text-xs text-red-500">{errors.conversionRate.message}</p>}
            <p className="text-[11px] text-gray-400">Multiplier used to evaluate market valuations</p>
          </div>

          {/* Starting Market Value (Disabled / Auto Calculated) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Default Market Value (£)</label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Auto Calculated
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                {...register("startingMarketValue", { valueAsNumber: true })}
                readOnly
                tabIndex={-1}
                className="w-full py-3.5 px-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-bold text-sm h-12 select-none cursor-not-allowed outline-none"
              />
            </div>
            {errors.startingMarketValue && <p className="text-xs text-red-500">{errors.startingMarketValue.message}</p>}
            <p className="text-[11px] text-emerald-600 font-medium">
              = {(Number(watch("startingCoins")) || 0).toLocaleString()} Coins × £{Number(watch("conversionRate")) || 0}
            </p>
          </div>
        </div>
      </section>

      {/* Reward Configurations Card */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Reward Configurations</h2>
        <p className="text-sm text-gray-400 font-semibold mb-8">
          Coins awarded per event (Market values are auto-calculated and disabled)
        </p>

        <div className="space-y-6">
          {rewardFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">{field.label}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coin Reward */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium tracking-wider select-none">
                    Coin Reward:
                  </span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-32 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
                  />
                </div>
                {/* Market Value (Auto Calculated & Disabled) */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium tracking-wider select-none font-sans">
                    Market Value (£):
                  </span>
                  <input
                    type="number"
                    {...register(`${field.key}.marketValue` as any, { valueAsNumber: true })}
                    readOnly
                    tabIndex={-1}
                    className="w-full pl-36 pr-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold text-sm h-12 select-none cursor-not-allowed outline-none"
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
        <p className="text-sm text-gray-400 font-semibold mb-8">
          Configure coin deductions for infractions (Market values are auto-calculated and disabled)
        </p>

        <div className="space-y-6">
          {penaltyFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">{field.label}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coin Deduction */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium tracking-wider select-none">
                    Coin Deduction:
                  </span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-36 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
                  />
                </div>
                {/* Market Value (Auto Calculated & Disabled) */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium tracking-wider select-none font-sans">
                    Market Value (£):
                  </span>
                  <input
                    type="number"
                    {...register(`${field.key}.marketValue` as any, { valueAsNumber: true })}
                    readOnly
                    tabIndex={-1}
                    className="w-full pl-36 pr-4 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-semibold text-sm h-12 select-none cursor-not-allowed outline-none"
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