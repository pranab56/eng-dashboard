"use client"

import { useGetOverviewQuery } from '@/features/overview/overviewApi';
import { useHeaders } from '@/hooks/useHeaders';
import { useEffect } from 'react';
import { GiSoccerBall } from "react-icons/gi";
import { MdPendingActions } from "react-icons/md";
import { PiUserCheck, PiUserGear, PiUserPlus, PiUsersThree } from "react-icons/pi";
import { RiTeamLine } from "react-icons/ri";


import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Skeleton } from '../../components/ui/skeleton';

const Home = () => {
  const { setHeaders } = useHeaders();
  const { data: overviewData, isLoading } = useGetOverviewQuery({});

  useEffect(() => {
    setHeaders({
      title: "Dashboard Overview",
      des: "Welcome back! Here's the latest summary of your league activities."
    })
  }, [setHeaders]);

  if (isLoading) {
    return (
      <div className="pt-10 px-8 space-y-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-[450px] w-full rounded-2xl bg-gray-100" />
          <Skeleton className="h-[450px] w-full rounded-2xl bg-gray-100" />
        </div>
      </div>
    );
  }

  const stats = overviewData?.data || {};

  const cards = [
    {
      title: "Total Players",
      value: stats.users?.totalPlayers || 0,
      icon: <PiUsersThree className="text-3xl text-blue-600" />,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      textColor: "text-blue-900"
    },
    {
      title: "Total Managers",
      value: stats.users?.totalManagers || 0,
      icon: <PiUserGear className="text-3xl text-emerald-600" />,
      gradient: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      textColor: "text-emerald-900"
    },
    {
      title: "Total Referees",
      value: stats.users?.totalReferees || 0,
      icon: <PiUserCheck className="text-3xl text-amber-600" />,
      gradient: "from-amber-50 to-amber-100",
      border: "border-amber-200",
      textColor: "text-amber-900"
    },
    {
      title: "Outclub Players",
      value: stats.users?.totalOutclubPlayers || 0,
      icon: <PiUserPlus className="text-3xl text-purple-600" />,
      gradient: "from-purple-50 to-purple-100",
      border: "border-purple-200",
      textColor: "text-purple-900"
    },
    {
      title: "Total Teams",
      value: stats.teams?.totalTeams || 0,
      icon: <RiTeamLine className="text-3xl text-rose-600" />,
      gradient: "from-rose-50 to-rose-100",
      border: "border-rose-200",
      textColor: "text-rose-900"
    },
    {
      title: "Total Matches",
      value: stats.matches?.totalMatches || 0,
      icon: <GiSoccerBall className="text-3xl text-indigo-600" />,
      gradient: "from-indigo-50 to-indigo-100",
      border: "border-indigo-200",
      textColor: "text-indigo-900"
    },
    {
      title: "Pending Matches",
      value: stats.matches?.pendingMatches || 0,
      icon: <MdPendingActions className="text-3xl text-orange-600" />,
      gradient: "from-orange-50 to-orange-100",
      border: "border-orange-200",
      textColor: "text-orange-900"
    }
  ];

  const userDistribution = [
    { name: 'Players', value: stats.users?.totalPlayers || 0, color: '#3B82F6' },
    { name: 'Managers', value: stats.users?.totalManagers || 0, color: '#10B981' },
    { name: 'Referees', value: stats.users?.totalReferees || 0, color: '#F59E0B' },
    { name: 'Outclub', value: stats.users?.totalOutclubPlayers || 0, color: '#8B5CF6' },
  ];

  const leagueSummary = [
    { name: 'Teams', count: stats.teams?.totalTeams || 0, color: '#F43F5E' },
    { name: 'Matches', count: stats.matches?.totalMatches || 0, color: '#6366F1' },
    { name: 'Pending', count: stats.matches?.pendingMatches || 0, color: '#F97316' },
  ];

  return (
    <div className='pt-10 px-8 pb-10 space-y-10'>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden group bg-gradient-to-br ${card.gradient} border ${card.border} p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <p className={`text-sm font-medium opacity-80 ${card.textColor}`}>{card.title}</p>
                <h3 className={`text-4xl font-bold ${card.textColor}`}>{card.value}</h3>
              </div>
              <div className="p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {card.icon}
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Distribution Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">User Role Distribution</h3>
            <div className="px-3 py-1 bg-gray-50 rounded-full text-xs font-semibold text-gray-500 border border-gray-200">Live Data</div>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* League Summary Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800">League Summary</h3>
            <div className="px-3 py-1 bg-gray-50 rounded-full text-xs font-semibold text-gray-500 border border-gray-200">Across Entities</div>
          </div>
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leagueSummary} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 13 }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[10, 10, 10, 10]} barSize={50}>
                  {leagueSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
