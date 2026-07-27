import React, { Suspense } from 'react'
import EngtvManagement from './EngtvManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading videos...</div>}>
      <EngtvManagement />
    </Suspense>
  )
}

export default page