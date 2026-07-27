import React, { Suspense } from 'react'
import PlayerManagement from './PlayerManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <PlayerManagement />
    </Suspense>
  )
}
export default page