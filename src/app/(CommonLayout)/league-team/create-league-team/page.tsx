import React, { Suspense } from 'react'
import CreateLeagueTeam from './CreateLeagueTeam'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading form...</div>}>
      <CreateLeagueTeam />
    </Suspense>
  )
}

export default page