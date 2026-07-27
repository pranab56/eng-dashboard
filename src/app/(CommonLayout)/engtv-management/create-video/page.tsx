import React, { Suspense } from 'react'
import CreateVideos from './CreateVideos'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading form...</div>}>
      <CreateVideos />
    </Suspense>
  )
}

export default page