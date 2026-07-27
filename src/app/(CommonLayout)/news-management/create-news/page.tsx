import React, { Suspense } from 'react'
import CreateNews from './CreateNews'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <CreateNews />
    </Suspense>
  )
}

export default page