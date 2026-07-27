import React, { Suspense } from 'react';
import CreateEvent from './CreateEvent';

export const dynamic = 'force-dynamic';

const page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading form...</div>}>
      <CreateEvent />
    </Suspense>
  );
};

export default page;
