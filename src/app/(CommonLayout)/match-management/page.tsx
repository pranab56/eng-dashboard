import React, { Suspense } from 'react'
import MatchManagement from './MatchManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading matches...</div>}>
      <MatchManagement />
    </Suspense>
  )
}
export default page