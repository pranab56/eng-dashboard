import React, { Suspense } from 'react'
import RewardsManagement from './RewardsManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading rewards...</div>}>
      <RewardsManagement />
    </Suspense>
  )
}

export default page