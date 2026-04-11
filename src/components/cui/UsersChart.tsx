"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomSelectOption from "./CustomSelectOption";
import { Suspense} from "react";
import { useSearchParams } from "next/navigation";
import { selectOptionsRevenue } from "@/types/optionTypes";

const data = [
  {month: "Jan", users: 4000},
  {month: "Feb", users: 3000},
  {month: "Mar", users: 5000},
  {month: "Apr", users: 4000},
  {month: "May", users: 3000},
  {month: "Jun", users: 5000},
  {month: "Jul", users: 4000},
  {month: "Aug", users: 3000},
  {month: "Sep", users: 5000},
  {month: "Oct", users: 4000},
  {month: "Nov", users: 3000},
  {month: "Dec", users: 5000},
]

const SalesTrackingChartSuspense = () => {
  const searchParams = useSearchParams();
  const userDuration = searchParams.get("userDuration") ?? "2025";
  console.log(userDuration);



  return (
    <div className="bg-white rounded-2xl py-4">
      <div className="flex items-center justify-between mb-4 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-700">Total Users</h2>
        <div className="w-40">
          <CustomSelectOption selectOptions={selectOptionsRevenue} placeHolderValue="Select Year" queryKey="userDuration" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
          barCategoryGap="30%" // Adjust gap between bars
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} tickMargin={20} />
          <Tooltip />
          {/* <Legend /> */}
          {/* Thinner bars */}
          <Bar
            dataKey="users"
            stackId="a"
            fill="#836AB1"
            background={{ fill: '#D9D9D9' }}
            radius={[20, 20, 0, 0]} // Optional: rounded top corners
            barSize={28} // Make bars thinner
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function UsersChart() {
  return (
    <Suspense fallback={<div>Loading...</div>} >
      <SalesTrackingChartSuspense />
    </Suspense>
  )
}
