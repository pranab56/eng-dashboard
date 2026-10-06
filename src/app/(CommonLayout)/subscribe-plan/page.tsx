/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState, useMemo } from 'react'
import { CustomModal } from '@/components/modals/CustomModal'
import { useGetAllPackageQuery, useGetPackageOverviewQuery } from '@/features/package/packageApi'
import { 
  Plus, 
  Search, 
  Loader2, 
  Package, 
  RefreshCw, 
  Users, 
  Coins,
  Layers,
} from 'lucide-react'
import CreatePackage from './CreatePackage'
import PackageCard from './PackageCard'

const userTypes = [
  { label: 'Regular Players', value: 'Player' },
  { label: 'Tournament Players', value: 'Tournament Player' },
  { label: 'Trial Players', value: 'Trial Player' },
]

const SubscribePlan = () => {
  const [activeTab, setActiveTab] = useState('Player')
  const [status, setStatus] = useState('Active')
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: packageData, isLoading, isFetching, refetch } = useGetAllPackageQuery({
    userType: activeTab,
    status: status
  });

  // Backend Overview Statistics (calculated directly on MongoDB backend)
  const {
    data: overviewRes,
    isLoading: isOverviewLoading,
    isFetching: isOverviewFetching,
    refetch: refetchOverview,
  } = useGetPackageOverviewQuery(
    activeTab ? { userType: activeTab } : {}
  );
  const overview = overviewRes?.data;

  const rawPackages: any[] = useMemo(() => {
    return Array.isArray(packageData?.data) ? packageData.data : []
  }, [packageData])

  // Filter by search term
  const filteredPackages = useMemo(() => {
    if (!searchTerm.trim()) return rawPackages
    const q = searchTerm.toLowerCase().trim()
    return rawPackages.filter((pkg) => {
      const matchTitle = (pkg.title || '').toLowerCase().includes(q)
      const matchDesc = (pkg.description || '').toLowerCase().includes(q)
      const matchType = (pkg.packageType || '').toLowerCase().includes(q)
      const matchFeatures = Array.isArray(pkg.features)
        ? pkg.features.some((f: any) => {
            const title = typeof f === 'object' ? f.title : f
            return (title || '').toLowerCase().includes(q)
          })
        : false
      return matchTitle || matchDesc || matchType || matchFeatures
    })
  }, [rawPackages, searchTerm])

  // Backend-driven KPI Statistics (computed on MongoDB backend)
  const stats = useMemo(() => {
    return {
      totalCount: overview?.totalPackages ?? rawPackages.length,
      maxCoins: overview?.maxCoins ?? 0,
      avgPrice: overview?.avgPrice ?? 0,
    };
  }, [overview, rawPackages.length]);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plans
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure player membership tiers, pricing cycles, coin allowances, and benefits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { refetch(); refetchOverview(); }}
            disabled={isFetching || isOverviewFetching}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh package list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isFetching || isOverviewFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <CustomModal
            title="Create New Membership Plan"
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            className="sm:max-w-3xl"
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Package</span>
              </button>
            }
          >
            <CreatePackage onSuccess={() => setIsModalOpen(false)} />
          </CustomModal>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Active Category</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900">
              {userTypes.find(t => t.value === activeTab)?.label || activeTab}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Status: <span className="font-semibold text-slate-700">{status}</span>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Loaded Plans</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : stats.totalCount}
            </span>
            <span className="text-xs text-slate-500">packages</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Showing filtered category results
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Max Coin Allocation</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-950">
              {isOverviewLoading ? "—" : stats.maxCoins.toLocaleString()}
            </span>
            <span className="text-xs text-amber-700 font-medium">coins</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Granted upon subscription
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium uppercase tracking-wider">Average Price</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : `£${stats.avgPrice}`}
            </span>
            <span className="text-xs text-slate-500">/ subscription</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Calculated across category plans
          </div>
        </div>
      </div>

      {/* Control Strip: Audience Tabs, Status Switch, Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-2xs">
        {/* Left: Audience Segmented Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {userTypes.map((type) => {
            const isSelected = activeTab === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setActiveTab(type.value)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {type.label}
              </button>
            )
          })}
        </div>

        {/* Right: Status Switch & Search */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Status Segmented Control */}
          <div className="inline-flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setStatus('Active')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                status === 'Active'
                  ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('Delete')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                status === 'Delete'
                  ? 'bg-white text-rose-700 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans, benefits..."
              className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Package Content Cards Grid */}
      <div className="min-h-[350px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-xl">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
            <p className="text-xs font-medium text-slate-500 mt-2.5">
              Loading membership packages...
            </p>
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPackages.map((pkg: any) => (
              <PackageCard key={pkg._id} packageData={pkg} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl text-center px-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              No {status === 'Active' ? 'Active' : 'Archived'} {activeTab} Packages Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm 
                ? `No plans matched "${searchTerm}". Try resetting your search filter.`
                : `There are currently no ${status.toLowerCase()} packages configured for this category.`
              }
            </p>

            <div className="mt-4 flex items-center gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscribePlan
