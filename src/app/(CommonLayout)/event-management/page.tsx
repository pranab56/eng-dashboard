import React, { Suspense } from 'react';
import EventManagement from './EventManagement';

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading events...</div>}>
      <EventManagement />
    </Suspense>
  );
};

export default page;