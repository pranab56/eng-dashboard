/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Suspense } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { useSearchParams } from 'next/navigation';
import { selectOptionsRevenue } from '@/types/optionTypes';
import CustomSelectOption from './CustomSelectOption';

interface TData {
  duration: string;
  revenue: number;
}

const data: TData[] = [
  {
    duration: "January",
    revenue: 120
  },
  {
    duration: "February",
    revenue: 2000
  },
  {
    duration: "March",
    revenue: 500
  },
  {
    duration: "April",
    revenue: 1000
  },
  {
    duration: "May",
    revenue: 100
  },
  {
    duration: "June",
    revenue: 2100
  },
  {
    duration: "July",
    revenue: 1000
  },
  {
    duration: "August",
    revenue: 2300
  },
  {
    duration: "September",
    revenue: 100
  },
  {
    duration: "October",
    revenue: 1000
  },
  {
    duration: "November",
    revenue: 600
  },
  {
    duration: "December",
    revenue: 800
  },
]



function SubscriptionGraphSuspense() {
  const searchParams = useSearchParams();
  const revenueDuration = searchParams.get("revenueDuration") ?? "2025";
  console.log(revenueDuration);


  // Custom Tooltip Function
  const renderCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { duration, revenue } = payload[0].payload; // Access the specific data point
      return (
        <div
          style={{
            backgroundColor: "white",
            color: "rgba(0, 0, 0, 0.7)",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "14px",
            maxWidth: "200px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Optional: Adds a subtle shadow
          }}
        >
          <p><strong>$ {revenue}</strong> Revenue</p>
          <p><strong>{duration}, {revenueDuration}</strong></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full  rounded-2xl p-3 bg-white py-10">
      <div className="flex items-center justify-between mb-1 px-8 pb-8">
        <h2 className="text-2xl font-bold text-gray-700">Total Revenue</h2>
        <div className='w-30'>
          <CustomSelectOption selectOptions={selectOptionsRevenue} placeHolderValue="Select Year" queryKey="revenueDuration" />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
          data={data}
          syncId="anyId"
          margin={{
            top: 20,
            right: 30,
            left: 30,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="0 4" />
          <XAxis dataKey="duration" tick={{ fontSize: 14 }} tickLine={false} axisLine={false} tickMargin={20} />
          <YAxis tickLine={false} axisLine={false} tickMargin={20} />
          <Tooltip content={renderCustomTooltip} />

          {/* Gradient fill definition */}
          <defs>
            <linearGradient id="gradientColor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="1%" stopColor="#836AB1" stopOpacity={100} />
              <stop offset="100%" stopColor="#836AB1" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          {/* Area with gradient fill */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#836AB1"
            strokeWidth={6}
            fill="url(#gradientColor)" // Apply gradient by referencing its ID
            activeDot={{
              fill: "#836AB1", // Dot fill color
              stroke: "white", // Dot borders color
              strokeWidth: 6, // Dot borders width
              r: 12, // Dot size (radius)
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function RevenueGraph() {
  return (
    <Suspense fallback={<div>Loading...</div>} >
      <SubscriptionGraphSuspense />
    </Suspense>
  )
}
