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
  Calendar, 
  ShieldCheck, 
  UserCheck, 
  Power,
  Layers
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

  // Extract features safely
  const featuresList = Array.isArray(packageData.features) ? packageData.features : []

  return (
    <div className={`relative flex flex-col justify-between bg-white border rounded-xl transition-all duration-150 ${
      isActive 
        ? 'border-slate-200 shadow-2xs hover:border-slate-300 hover:shadow-xs' 
        : 'border-slate-200/80 bg-slate-50/40 opacity-80 hover:opacity-100'
    }`}>
      {/* Top Section */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Type Badge & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
              <UserCheck className="w-3 h-3 text-slate-500" />
              {packageData.userType}
            </span>
            {packageData.packageType && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                {packageData.packageType}
              </span>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                : 'bg-rose-50 text-rose-700 border-rose-200/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
            {packageData.status}
          </span>
        </div>

        {/* Plan Title & Description */}
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
            {packageData.title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
            {packageData.description || "No description provided for this package."}
          </p>
        </div>

        {/* Price & Billing */}
        <div className="pt-2 pb-3 border-y border-slate-100 flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
              £{packageData.price}
            </span>
            <span className="text-xs font-medium text-slate-500">
              / {packageData.duration || 'period'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{packageData.paymentType || "Standard"}</span>
          </div>
        </div>

        {/* Coin Allocation Badge */}
        <div className="flex items-center justify-between text-xs bg-amber-50/50 border border-amber-200/60 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-amber-900 font-medium">
            <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Coin Allowance</span>
          </div>
          <span className="font-mono font-bold text-amber-950">
            {Number(packageData.credit || 0).toLocaleString()} ENG Coins
          </span>
        </div>

        {/* Feature List */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span>Included Benefits</span>
            <span>{featuresList.length} items</span>
          </div>

          {featuresList.length > 0 ? (
            <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {featuresList.map((feat: any, idx: number) => {
                const isIncluded = typeof feat === 'object' ? (feat.isIncluded ?? true) : true
                const title = typeof feat === 'object' ? feat.title : feat
                return (
                  <li key={idx} className="flex items-start gap-2 text-xs leading-tight">
                    {isIncluded ? (
                      <span className="mt-0.5 w-3.5 h-3.5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="mt-0.5 w-3.5 h-3.5 rounded bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <X className="w-2.5 h-2.5 stroke-[2.5]" />
                      </span>
                    )}
                    <span className={isIncluded ? 'text-slate-700 font-medium' : 'text-slate-400 line-through'}>
                      {title}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              No specific features declared
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center gap-2">
        <CustomModal
          title="Edit Membership Plan"
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          className="sm:max-w-3xl"
          trigger={
            <button
              type="button"
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              Edit Plan
            </button>
          }
        >
          <CreatePackage initialData={packageData} onSuccess={() => setIsEditModalOpen(false)} />
        </CustomModal>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer border shadow-2xs disabled:opacity-50 ${
            isActive
              ? 'text-rose-700 bg-white hover:bg-rose-50 border-rose-200'
              : 'text-emerald-700 bg-white hover:bg-emerald-50 border-emerald-200'
          }`}
          title={isActive ? "Deactivate this plan" : "Reactivate this plan"}
        >
          <Power className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-emerald-600'}`} />
          {isActive ? 'Deactivate' : 'Activate'}
        </button>
      </div>
    </div>
  )
}

export default PackageCard
