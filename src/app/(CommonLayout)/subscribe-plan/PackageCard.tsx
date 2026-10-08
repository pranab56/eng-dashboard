/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from 'react'
import { CustomModal } from '@/components/modals/CustomModal'
import { useTogglePackageStatusMutation } from '@/features/package/packageApi'
import { 
  Edit2, 
  Coins, 
  Check, 
  X, 
  Power,
} from 'lucide-react'
import toast from 'react-hot-toast'
import CreatePackage from './CreatePackage'

interface PackageCardProps {
  packageData: any
}

const PackageCard = ({ packageData }: PackageCardProps) => {
  const [toggleStatus, { isLoading: isToggling }] = useTogglePackageStatusMutation()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const handleToggle = async () => {
    try {
      const res = await toggleStatus({ id: packageData._id }).unwrap()
      toast.success(res.message || "Status toggled successfully")
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to toggle status")
    }
  }

  const isActive = packageData.status === 'Active'
  const featuresList = Array.isArray(packageData.features) ? packageData.features : []

  return (
    <div className={`bg-white border rounded-lg transition-colors flex flex-col justify-between overflow-hidden ${
      isActive 
        ? 'border-slate-200 hover:border-slate-300' 
        : 'border-slate-200 bg-slate-50/50 opacity-80 hover:opacity-100'
    }`}>
      {/* Top Body Section */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Tier Tags & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
              {packageData.userType}
            </span>
            {packageData.packageType && (
              <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                {packageData.packageType}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded border ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            {packageData.status}
          </span>
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight leading-snug">
            {packageData.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
            {packageData.description || "No description provided for this package."}
          </p>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 pb-2.5 border-y border-slate-100 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900 tracking-tight">
              £{packageData.price}
            </span>
            <span className="text-xs text-slate-500">
              / {packageData.duration || 'period'}
            </span>
          </div>

          <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
            {packageData.paymentType || "Standard"}
          </span>
        </div>

        {/* Coin Allocation Row */}
        <div className="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200/60 rounded">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Coins className="w-3.5 h-3.5 text-slate-400" />
            <span>Coin Allowance</span>
          </div>
          <span className="font-mono font-semibold text-slate-900">
            {Number(packageData.credit || 0).toLocaleString()} coins
          </span>
        </div>

        {/* Benefits List */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span>Benefits</span>
            <span>{featuresList.length} items</span>
          </div>

          {featuresList.length > 0 ? (
            <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {featuresList.map((feat: any, idx: number) => {
                const isIncluded = typeof feat === 'object' ? (feat.isIncluded ?? true) : true
                const title = typeof feat === 'object' ? feat.title : feat
                return (
                  <li key={idx} className="flex items-start gap-2 text-xs leading-tight">
                    {isIncluded ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0 stroke-[2.5]" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0 stroke-[2]" />
                    )}
                    <span className={isIncluded ? 'text-slate-700' : 'text-slate-400 line-through'}>
                      {title}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-xs text-slate-400 italic py-1">
              No specific benefits declared
            </div>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
        <CustomModal
          title="Edit Subscription Plan"
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          className="sm:max-w-3xl"
          trigger={
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer"
            >
              <Edit2 className="w-3 h-3 text-slate-500" />
              <span>Edit Plan</span>
            </button>
          }
        >
          <CreatePackage initialData={packageData} onSuccess={() => setIsEditModalOpen(false)} />
        </CustomModal>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md transition-colors cursor-pointer border disabled:opacity-50 ${
            isActive
              ? 'text-slate-700 bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border-slate-300'
              : 'text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-300'
          }`}
          title={isActive ? "Deactivate this plan" : "Reactivate this plan"}
        >
          <Power className={`w-3 h-3 ${isActive ? 'text-slate-500' : 'text-emerald-600'}`} />
          <span>{isActive ? 'Deactivate' : 'Activate'}</span>
        </button>
      </div>
    </div>
  )
}

export default PackageCard
