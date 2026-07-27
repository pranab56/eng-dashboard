import { Suspense } from 'react';
import GalleryManagement from './GalleryManagement';

const GalleryPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <GalleryManagement />
    </Suspense>
  );
};

export default GalleryPage;
