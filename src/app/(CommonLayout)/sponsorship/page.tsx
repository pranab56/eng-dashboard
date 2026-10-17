import { Suspense } from 'react';
import SponsorshipManagement from './SponsorshipManagement';

const SponsorshipPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium">Loading sponsors...</div>}>
      <SponsorshipManagement />
    </Suspense>
  );
};

export default SponsorshipPage;
