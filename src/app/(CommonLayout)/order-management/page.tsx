import { Suspense } from 'react';
import OrderManagement from './OrderManagement';

const OrderManagementPage = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-10 text-gray-500 font-medium"></div>}>
      <OrderManagement />
    </Suspense>
  );
};

export default OrderManagementPage;
