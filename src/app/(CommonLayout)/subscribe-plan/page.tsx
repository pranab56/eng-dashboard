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
  Coins,
  Layers,
  X,
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

  const stats = useMemo(() => {
    return {
      totalCount: overview?.totalPackages ?? rawPackages.length,
      maxCoins: overview?.maxCoins ?? 0,
      avgPrice: overview?.avgPrice ?? 0,
    };
  }, [overview, rawPackages.length]);

  const activeAudienceLabel = userTypes.find(t => t.value === activeTab)?.label || activeTab;

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Subscription Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure player membership tiers, pricing cycles, coin allowances, and platform benefits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { refetch(); refetchOverview(); }}
            disabled={isFetching || isOverviewFetching}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isFetching || isOverviewFetching ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <CustomModal
            title="Create Subscription Plan"
            isOpen={isModalOpen}
            setIsOpen={setIsModalOpen}
            className="sm:max-w-3xl"
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Plan</span>
              </button>
            }
          >
            <CreatePackage onSuccess={() => setIsModalOpen(false)} />
          </CustomModal>
        </div>
      </div>

      {/* Unified Enterprise KPI Metric Strip */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Target Audience
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-semibold text-slate-900 truncate">
              {activeAudienceLabel}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Filter: {status}
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Plans
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : stats.totalCount}
            </span>
            <span className="text-xs text-slate-500">tiers</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Configured for this group
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <Coins className="w-3 h-3 text-amber-500" />
            <span>Max Coin Allowance</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : stats.maxCoins.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">coins</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Initial subscriber grant
          </span>
        </div>

        <div className="p-3.5 sm:p-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>Average Pricing</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900">
              {isOverviewLoading ? "—" : `£${stats.avgPrice}`}
            </span>
            <span className="text-xs text-slate-500">/ subscription</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Across active tiers
          </span>
        </div>
      </div>

      {/* Control Strip: Tabs, Status Switch, Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-1">
        {/* Left: Audience Segmented Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-md border border-slate-200/80 gap-1 overflow-x-auto">
          {userTypes.map((type) => {
            const isSelected = activeTab === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setActiveTab(type.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
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
          <div className="inline-flex p-0.5 bg-slate-100 border border-slate-200 rounded-md">
            <button
              type="button"
              onClick={() => setStatus('Active')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                status === 'Active'
                  ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('Delete')}
              className={`px-3 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                status === 'Delete'
                  ? 'bg-white text-rose-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title or benefit..."
              className="w-full pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Package Content Cards Grid */}
      <div className="min-h-[300px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-lg">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            <p className="text-xs font-medium text-slate-500 mt-2">
              Loading plans...
            </p>
          </div>
        ) : filteredPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-5">
            {filteredPackages.map((pkg: any) => (
              <PackageCard key={pkg._id} packageData={pkg} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-lg text-center px-4">
            <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
              <Package className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">
              No {status === 'Active' ? 'Active' : 'Archived'} Plans Found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              {searchTerm 
                ? `No subscription plans matched "${searchTerm}".`
                : `There are no ${status.toLowerCase()} packages configured for ${activeAudienceLabel.toLowerCase()}.`
              }
            </p>

            <div className="mt-4 flex items-center gap-2">
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscribePlan
