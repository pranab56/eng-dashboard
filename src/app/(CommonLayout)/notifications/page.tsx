import React, { Suspense } from 'react'
import Notification from './Notification'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading notifications...</div>}>
      <Notification />
    </Suspense>
  )
}

export default page