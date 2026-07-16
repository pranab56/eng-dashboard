/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import CancelButton from '@/components/buttons/CancelButton';
import SubmitButton from '@/components/buttons/SubmitButton';
import { useGetBudgetAndEconomayQuery, useUpdateBudgetAndEconomayMutation } from '@/features/teamManagement/teamApi';
import { useHeaders } from '@/hooks/useHeaders';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

// Zod Scheme verification
const coinBudgetSchema = z.object({
  coin: z.number(),
  budgetValue: z.number()
});

const budgetEconomySchema = z.object({
  startingBudget: z.number().min(1, "Starting budget is required"),
  conversionRate: z.number().min(1, "Conversion rate is required"),
  attendMatch: coinBudgetSchema,
  drawMatch: coinBudgetSchema,
  winMatch: coinBudgetSchema,
  exceptionalConduct: coinBudgetSchema,
  goodConduct: coinBudgetSchema,
  satisfactoryConduct: coinBudgetSchema,
  averageConduct: coinBudgetSchema,
  poorConduct: coinBudgetSchema,
  unprofessionalConduct: coinBudgetSchema,
});

type BudgetEconomyFormValues = z.infer<typeof budgetEconomySchema>;

export default function BudgetEconomyPage() {
  const { setHeaders } = useHeaders();
  const router = useRouter();

  const { data: budgetData, isLoading } = useGetBudgetAndEconomayQuery({});
  const [updateBudgetEconomy, { isLoading: isUpdating }] = useUpdateBudgetAndEconomayMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<BudgetEconomyFormValues>({
    resolver: zodResolver(budgetEconomySchema),
    defaultValues: {
      startingBudget: 100000,
      conversionRate: 10,
      attendMatch: { coin: 0, budgetValue: 0 },
      drawMatch: { coin: 0, budgetValue: 0 },
      winMatch: { coin: 0, budgetValue: 0 },
      exceptionalConduct: { coin: 0, budgetValue: 0 },
      goodConduct: { coin: 0, budgetValue: 0 },
      satisfactoryConduct: { coin: 0, budgetValue: 0 },
      averageConduct: { coin: 0, budgetValue: 0 },
      poorConduct: { coin: 0, budgetValue: 0 },
      unprofessionalConduct: { coin: 0, budgetValue: 0 },
    }
  });

  useEffect(() => {
    setHeaders({
      title: "Club Economy Settings",
      des: "Configure base coin rewards, negative conducts, and multipliers for squad budgets."
    });
  }, [setHeaders]);

  useEffect(() => {
    if (budgetData?.data) {
      const data = budgetData.data;
      reset({
        startingBudget: data.startingBudget || 100000,
        conversionRate: data.conversionRate || 10,
        attendMatch: { coin: data.attendMatch?.coin || 0, budgetValue: data.attendMatch?.budgetValue || 0 },
        drawMatch: { coin: data.drawMatch?.coin || 0, budgetValue: data.drawMatch?.budgetValue || 0 },
        winMatch: { coin: data.winMatch?.coin || 0, budgetValue: data.winMatch?.budgetValue || 0 },
        exceptionalConduct: { coin: data.exceptionalConduct?.coin || 0, budgetValue: data.exceptionalConduct?.budgetValue || 0 },
        goodConduct: { coin: data.goodConduct?.coin || 0, budgetValue: data.goodConduct?.budgetValue || 0 },
        satisfactoryConduct: { coin: data.satisfactoryConduct?.coin || 0, budgetValue: data.satisfactoryConduct?.budgetValue || 0 },
        averageConduct: { coin: data.averageConduct?.coin || 0, budgetValue: data.averageConduct?.budgetValue || 0 },
        poorConduct: { coin: data.poorConduct?.coin || 0, budgetValue: data.poorConduct?.budgetValue || 0 },
        unprofessionalConduct: { coin: data.unprofessionalConduct?.coin || 0, budgetValue: data.unprofessionalConduct?.budgetValue || 0 },
      });
    }
  }, [budgetData, reset]);

  const conversionRate = watch("conversionRate");

  // Automatically recalculate budget values if conversion rate changes
  useEffect(() => {
    if (typeof conversionRate === "number") {
      const keys = [
        "attendMatch",
        "drawMatch",
        "winMatch",
        "exceptionalConduct",
        "goodConduct",
        "satisfactoryConduct",
        "averageConduct",
        "poorConduct",
        "unprofessionalConduct",
      ];
      keys.forEach(k => {
        const coin = watch(`${k}.coin` as any);
        if (typeof coin === "number") {
          setValue(`${k}.budgetValue` as any, coin * conversionRate);
        }
      });
    }
  }, [conversionRate]);

  // Recalculate on individual coin change
  const handleCoinChange = (key: string, val: number) => {
    const rate = watch("conversionRate") || 0;
    setValue(`${key}.budgetValue` as any, val * rate);
  };

  const onSubmit = async (data: BudgetEconomyFormValues) => {
    try {
      const res = await updateBudgetEconomy({ data }).unwrap();
      if (res.success) {
        toast.success(res.message || "Club Economy parameters updated successfully!");
        router.push("/team-management");
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update configuration");
    }
  };

  const economyFields = [
    { key: "attendMatch", label: "Attend a Match" },
    { key: "drawMatch", label: "Draw a Match" },
    { key: "winMatch", label: "Win a Match" },
  ];

  const penaltyFields = [
    { key: "exceptionalConduct", label: "10/10 - Exceptional" },
    { key: "goodConduct", label: "8-9/10 - Good" },
    { key: "satisfactoryConduct", label: "6-7/10 - Satisfactory" },
    { key: "averageConduct", label: "5/10 - Average/Neutral" },
    { key: "poorConduct", label: "3-4/10 - Poor" },
    { key: "unprofessionalConduct", label: "1-2/10 - Unprofessional" },
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
        <Link href="/team-management" className="w-10 h-10 border-2 border-yellow-600 rounded-full flex items-center justify-center text-yellow-600 hover:bg-yellow-50 transition-all select-none cursor-pointer">
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </Link>
        <div className="text-sm font-semibold text-gray-500 flex items-center gap-1.5">
          <span>Team Management</span>
          <span>&gt;</span>
          <span className="text-gray-900 font-medium">View & Edit Club Budget</span>
        </div>
      </div>

      {/* General Settings - Conversion rate & starting budget */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-xl font-medium text-gray-800 mb-6 flex items-center gap-2">
          General Configurations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Starting Budget (£)</label>
            <div className="relative">
              <input
                type="number"
                {...register("startingBudget", { valueAsNumber: true })}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-950 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
              />
            </div>
            {errors.startingBudget && <p className="text-xs text-red-500">{errors.startingBudget.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Conversion Rate (£ per Coin)</label>
            <div className="relative">
              <input
                type="number"
                {...register("conversionRate", { valueAsNumber: true })}
                className="w-full py-3.5 px-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-950 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white focus:border-yellow-600 transition-all outline-none"
              />
            </div>
            {errors.conversionRate && <p className="text-xs text-red-500">{errors.conversionRate.message}</p>}
          </div>
        </div>
      </section>

      {/* Economy Settings Card */}
      <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50 text-gray-800">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Economy Settings</h2>
        <p className="text-sm text-gray-400 font-semibold mb-8">Configure base coin rewards for this player</p>

        <div className="space-y-6">
          {economyFields.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-800">{field.label}</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coin Reward */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium tracking-wider select-none">Coin Reward:</span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-32 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
                {/* Budget Impact */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium tracking-wider select-none font-sans">Budget Impact (£):</span>
                  <input
                    type="number"
                    {...register(`${field.key}.budgetValue` as any, { valueAsNumber: true })}
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
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-medium tracking-wider select-none">Coin Reward:</span>
                  <input
                    type="number"
                    {...register(`${field.key}.coin` as any, { valueAsNumber: true })}
                    onChange={(e) => handleCoinChange(field.key, Number(e.target.value))}
                    className="w-full pl-32 pr-4 bg-gray-100 border-none rounded-xl text-gray-900 font-medium text-sm h-12 focus:ring-2 focus:ring-yellow-600/20 focus:bg-white transition-all outline-none"
                  />
                </div>
                {/* Budget Impact */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium tracking-wider select-none font-sans">Budget Impact (£):</span>
                  <input
                    type="number"
                    {...register(`${field.key}.budgetValue` as any, { valueAsNumber: true })}
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
        <CancelButton onClick={() => router.push("/team-management")} title="Cancel" />
        <SubmitButton isSubmitting={isUpdating} title="Save Changes" />
      </div>
    </form>
  );
}