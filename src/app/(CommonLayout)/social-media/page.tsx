import { Suspense } from 'react';
import SocialMediaManagement from './SocialMediaManagement';

const SocialMediaPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <SocialMediaManagement />
    </Suspense>
  );
};

export default SocialMediaPage;
