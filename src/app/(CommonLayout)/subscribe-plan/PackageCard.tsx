/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { CustomModal } from '@/components/modals/CustomModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTogglePackageStatusMutation } from '@/features/package/packageApi'
import { Edit2, ToggleLeft, ToggleRight } from 'lucide-react'
import { useState } from 'react'
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

  const statusColor = packageData.status === 'Active' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'

  return (
    <Card className="relative overflow-hidden border-2 transition-all hover:border-blue-500/20 hover:shadow-xl group">
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusColor}`}>
        {packageData.status}
      </div>

      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">{packageData.title}</CardTitle>
        <CardDescription className="line-clamp-2">{packageData.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-900">${packageData.price}</span>
          <span className="text-sm font-medium text-gray-500">/ {packageData.duration}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Credits</p>
            <p className="text-lg font-bold text-gray-900">{packageData.credit}</p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Logins</p>
            <p className="text-lg font-bold text-gray-900">{packageData.loginLimit}</p>
          </div>
        </div>

        <div className="pt-2 text-xs text-gray-500 font-medium">
          Type: <span className="text-blue-600">{packageData.userType}</span> • {packageData.paymentType}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2">
        <CustomModal
          title="Edit Package"
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          trigger={
            <Button variant="outline" className="flex-1 gap-2 cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
          }
        >
          <CreatePackage initialData={packageData} onSuccess={() => setIsEditModalOpen(false)} />
        </CustomModal>

        <Button
          variant="outline"
          onClick={handleToggle}
          disabled={isToggling}
          className={`flex-1 cursor-pointer gap-2 ${packageData.status === 'Active' ? 'hover:bg-red-50 hover:text-red-600' : 'hover:bg-green-50 hover:text-green-600'}`}
        >
          {packageData.status === 'Active' ? (
            <><ToggleRight className="w-4 h-4" /> Deactivate</>
          ) : (
            <><ToggleLeft className="w-4 h-4" /> Activate</>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default PackageCard
