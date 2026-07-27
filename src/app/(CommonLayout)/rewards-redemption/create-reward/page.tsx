import React, { Suspense } from 'react'
import CreateReward from './CreateReward'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <CreateReward />
    </Suspense>
  )
}

export default page