/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useGetOverviewQuery } from "@/features/overview/overviewApi";
import { useHeaders } from "@/hooks/useHeaders";
import { useEffect, useMemo } from "react";
import {
  Users,
  Clock,
  Briefcase,
  ShieldCheck,
  Users2,
  UserPlus,
  CreditCard,
  Shield,
  Gamepad2,
  CalendarClock,
  Activity,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Custom chart tooltip for user role distribution
const CustomDonutTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0.0";
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl text-white select-none">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold text-slate-200">{data.name}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-white tabular-nums">
            {Number(data.value).toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400">({percentage}%)</span>
        </div>
      </div>
    );
  }
  return null;
};

// Custom chart tooltip for league summary
const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-xs shadow-xl text-white select-none">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold text-slate-200">{data.payload.name}</span>
        </div>
        <p className="text-base font-bold text-white tabular-nums">
          {Number(data.value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function Home() {
  const { setHeaders } = useHeaders();
  const { data: overviewData, isLoading, isFetching } = useGetOverviewQuery({});

  useEffect(() => {
    setHeaders({
      title: "Dashboard Overview",
      des: "Real-time summary of league operations, registered personnel, and match activities.",
    });
  }, [setHeaders]);

  const stats = overviewData?.data || {};

  // Exact 10 metrics preserving 100% backend fields & bindings
  const cards = useMemo(
    () => [
      {
        id: "total-players",
        title: "Total Players",
        value: stats.users?.totalPlayers || 0,
        icon: Users,
        badge: "Roster",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "pending-players",
        title: "Pending Players",
        value: stats.users?.totalPendingPlayers || 0,
        icon: Clock,
        badge: "Needs Review",
        badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
      },
      {
        id: "total-managers",
        title: "Total Managers",
        value: stats.users?.totalManagers || 0,
        icon: Briefcase,
        badge: "Staff",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "total-referees",
        title: "Total Referees",
        value: stats.users?.totalReferees || 0,
        icon: ShieldCheck,
        badge: "Officials",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "parent-accounts",
        title: "Parent Accounts",
        value: stats.users?.totalParents || 0,
        icon: Users2,
        badge: "Guardians",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "outclub-players",
        title: "Outclub Players",
        value: stats.users?.totalOutclubPlayers || 0,
        icon: UserPlus,
        badge: "External",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "active-subscriptions",
        title: "Active Subscriptions",
        value: stats.users?.activeSubscriptions || 0,
        icon: CreditCard,
        badge: "Active Paid",
        badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      },
      {
        id: "total-teams",
        title: "Total Teams",
        value: stats.teams?.totalTeams || 0,
        icon: Shield,
        badge: "Registered",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "total-matches",
        title: "Total Matches",
        value: stats.matches?.totalMatches || 0,
        icon: Gamepad2,
        badge: "Fixtures",
        badgeStyle: "bg-slate-100 text-slate-600 border-slate-200",
      },
      {
        id: "pending-matches",
        title: "Pending Matches",
        value: stats.matches?.pendingMatches || 0,
        icon: CalendarClock,
        badge: "Scheduled",
        badgeStyle: "bg-amber-50 text-amber-700 border-amber-200/80",
      },
    ],
    [stats]
  );

  // Exact 5 User Role Distribution categories and backend data
  const userDistribution = useMemo(
    () => [
      { name: "Players", value: stats.users?.totalPlayers || 0, color: "#2563eb" },
      { name: "Managers", value: stats.users?.totalManagers || 0, color: "#059669" },
      { name: "Referees", value: stats.users?.totalReferees || 0, color: "#d97706" },
      { name: "Parents", value: stats.users?.totalParents || 0, color: "#4f46e5" },
      { name: "Outclub", value: stats.users?.totalOutclubPlayers || 0, color: "#0891b2" },
    ],
    [stats]
  );

  const totalPersonnel = useMemo(() => {
    return userDistribution.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
  }, [userDistribution]);

  // Exact 4 League Summary categories and backend data
  const leagueSummary = useMemo(
    () => [
      { name: "Teams", count: stats.teams?.totalTeams || 0, color: "#0284c7" },
      { name: "Matches", count: stats.matches?.totalMatches || 0, color: "#4f46e5" },
      { name: "Pending", count: stats.matches?.pendingMatches || 0, color: "#d97706" },
      { name: "Active Subs", count: stats.users?.activeSubscriptions || 0, color: "#059669" },
    ],
    [stats]
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 w-full">
      {/* Executive Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h2 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <span>League Operations Summary</span>
            {isFetching && !isLoading && (
              <span className="text-[11px] text-slate-400 font-normal animate-pulse">
                (Updating...)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Real-time metric telemetry across active clubs, divisions, and registered personnel.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 shadow-2xs text-[11px] text-slate-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Live Data Sync</span>
          </div>
        </div>
      </div>

      {/* 10 Structured Metric Cards: 5 columns on XL, 4 on LG, 3 on MD, 2 on SM */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200/90 rounded-lg p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              {/* Header: Title & Icon */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-slate-500 line-clamp-1">
                  {card.title}
                </span>
                <div className="w-7 h-7 rounded-md bg-slate-100/90 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200/60">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Value & Badge */}
              <div className="space-y-2">
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {isLoading ? (
                    <div className="h-7 w-16 bg-slate-200 rounded animate-pulse" />
                  ) : (
                    Number(card.value).toLocaleString()
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${card.badgeStyle}`}
                  >
                    {card.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid: Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. User Role Distribution (Donut Chart) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  User Role Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Active proportion across registered personnel roles.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                {totalPersonnel.toLocaleString()} Total Users
              </span>
            </div>

            {/* Donut Chart */}
            <div className="w-full h-[260px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {userDistribution.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomDonutTooltip total={totalPersonnel} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-medium text-slate-400">Total</span>
                <span className="text-xl font-bold text-slate-900 tabular-nums">
                  {totalPersonnel.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 mt-2 border-t border-slate-100 text-xs">
            {userDistribution.map((role) => {
              const pct =
                totalPersonnel > 0
                  ? ((Number(role.value) / totalPersonnel) * 100).toFixed(1)
                  : "0.0";
              return (
                <div
                  key={role.name}
                  className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-200/70"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="font-medium text-slate-700 truncate">{role.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {Number(role.value).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400 block">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. League Summary (Bar Chart) */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                  League Summary
                </h3>
                <p className="text-xs text-slate-500">
                  Competition fixture density and subscription engagement.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                Key Entities
              </span>
            </div>

            {/* Bar Chart */}
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leagueSummary}
                  margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                    content={<CustomBarTooltip />}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={42}>
                    {leagueSummary.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Metric Summary Strips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-slate-100 text-xs">
            {leagueSummary.map((item) => (
              <div
                key={item.name}
                className="p-2 rounded-md bg-slate-50 border border-slate-200/70 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[11px] text-slate-500 font-medium truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-base font-semibold text-slate-900 tabular-nums">
                  {Number(item.count).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
