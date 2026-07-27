import React, { Suspense } from 'react'
import NewsManagement from './NewsManagement'

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <NewsManagement />
    </Suspense>
  )
}

export default page