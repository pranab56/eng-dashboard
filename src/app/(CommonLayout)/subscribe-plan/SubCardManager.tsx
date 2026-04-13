import React from 'react';
import { Rocket, TSpark, Shield } from '@/assets/assets';
import { CustomModal } from '@/components/modals/CustomModal';
import CreateManagerSub from './CreateManagerSub';



interface PricingTierProps {
  title: string;
  price?: string;
  period?: string;
  description: string
}

const selectIcon = (title: string) => {
  switch (title) {
    case 'Start for Free':
      return <Rocket className="size-6 text-[#0053DB] fill-[#0053DB]" />;
    case 'Earn ENG Manager Coins':
      return <TSpark className="size-6 text-[#0053DB] fill-[#0053DB]" />;
    default:
      return <Shield className="size-6 text-[#0053DB] fill-[#0053DB]" />;
  }
}

const priceColor = (title: string) => {
  switch (title) {
    case 'Start for Free':
      return "text-[#0053DB]/50";
    case 'Earn ENG Manager Coins':
      return "text-yellow-500";
    case 'PROFESSIONAL':
      return "text-green-500";
    default:
      return "text-green-500";
  }
}

const SubCardManager: React.FC<PricingTierProps> = ({ title, price, period, description }) => {
  return (
    <div className="max-w-sm p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className='bg-[#0053DB]/10 p-2 rounded-md'>{title && selectIcon(title)}</span>
        <h2 className="text-xl font-bold text-gray-900">
          {title}
        </h2>
      </div>

      <hr className="mb-6 border-gray-100" />

      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Features List */}
        <p className='flex-1'>{description}</p>

        {/* Pricing */}
        {price && <div className="flex items-end gap-1">
          <div className={`text-4xl font-bold ${priceColor(title)}`}>
            £{price}
          </div>
          <div className="text-gray-400 font-medium italic">
            / {period}
          </div>
        </div>}
      </div>

      {/* Action Button */}
      <CustomModal
        title="Create New Notification"
        trigger={<button className="w-full py-2 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors">
          Edit Details
        </button>}
      >
        <CreateManagerSub />
      </CustomModal>
    </div>
  );
};

export default SubCardManager;