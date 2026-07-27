import React, { Suspense } from 'react'
import TeamManagement from './TeamManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="p-10 text-center font-medium text-gray-500">Loading teams...</div>}>
      <TeamManagement />
    </Suspense>
  )
}

export default page