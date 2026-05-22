/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import CreateButton from '@/components/buttons/CreateButton'
import { CustomModal } from '@/components/modals/CustomModal'
import { useGetAllPackageQuery } from '@/features/package/packageApi'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import CreatePackage from './CreatePackage'
import PackageCard from './PackageCard'

const userTypes = ['Player', 'Manager', 'Club', 'Referee', 'Other'];

const SubscribePlan = () => {
  const [activeTab, setActiveTab] = useState('Player')
  const [status, setStatus] = useState('Active')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: packageData, isLoading, isFetching } = useGetAllPackageQuery({
    userType: activeTab,
    status: status
  })

  return (
    <div className="container mx-auto  py-10 space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-1">
          <h1 className="text-3xl font-medium text-gray-900">Subscription Plans</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-500 font-medium">Configure and manage membership packages.</p>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setStatus('Active')}
                className={`px-4 py-1.5 rounded-md cursor-pointer text-xs font-medium transition-all ${status === 'Active' ? 'bg-white text-green-600  shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Active
              </button>
              <button
                onClick={() => setStatus('Delete')}
                className={`px-4 py-1.5 rounded-md text-xs cursor-pointer font-medium transition-all ${status === 'Delete' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                Deleted
              </button>
            </div>
          </div>
        </div>

        <CustomModal
          title="Create New Membership Plan"
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          className='sm:max-w-3xl'
          trigger={<button><CreateButton text="New Package" /></button>}
        >
          <CreatePackage onSuccess={() => setIsModalOpen(false)} />
        </CustomModal>
      </div>

      {/* Tabs / Filter Section */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-sm border border-gray-100 w-fit">
        {userTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-6 py-2.5 rounded-sm text-sm cursor-pointer font-medium transition-all ${activeTab === type
              ? "bg-white text-blue-600"
              : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="relative min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium animate-pulse">Initial loading...</p>
          </div>
        ) : (
          <>
            {/* Overlay Loader for Refetching */}
            {isFetching && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[1px] rounded-3xl transition-all duration-300">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 animate-in zoom-in-95">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm font-bold text-gray-600 tracking-tight">Updating List...</span>
                </div>
              </div>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500 ${isFetching ? 'blur-[2px] opacity-60 scale-[0.99]' : 'opacity-100 scale-100'}`}>
              {packageData?.data?.length > 0 ? (
                packageData.data.map((pkg: any) => (
                  <PackageCard key={pkg._id} packageData={pkg} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl">
                  <p className="text-lg font-bold text-gray-500">No {activeTab} packages found</p>
                  <p className="text-sm text-gray-400 mt-1">Create a new plan to get started</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SubscribePlan