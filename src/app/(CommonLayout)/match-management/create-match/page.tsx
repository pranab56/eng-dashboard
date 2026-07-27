import React, { Suspense } from 'react'
import CreateMatch from './CreateMatch'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <CreateMatch />
    </Suspense>
  )
}

export default page