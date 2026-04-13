import React from 'react';
import { Shield, Spark, Crown, Check, Cross } from '@/assets/assets';
import { CustomModal } from '@/components/modals/CustomModal';
import CreatePlayerSub from './CreatePlayerSub';


interface PricingFeature {
  text: string;
  isAvailable: boolean;
}

interface PricingTierProps {
  title: string;
  price: string;
  period: string;
  features: PricingFeature[];
}

const selectIcon = (title: string) => {
  switch (title) {
    case 'AMATEUR':
      return <Shield className="size-6 text-black fill-black" />;
    case 'SEMI PRO':
      return <Spark className="size-6 text-black fill-black" />;
    case 'PROFESSIONAL':
      return <Crown className="size-6 text-black fill-black" />
    default:
      return <Shield className="size-6 text-black fill-black" />;
  }
}

const priceColor = (title: string) => {
  switch (title) {
    case 'AMATEUR':
      return "text-red-500";
    case 'SEMI PRO':
      return "text-yellow-500";
    case 'PROFESSIONAL':
      return "text-green-500";
    default:
      return "text-green-500";
  }
}

const SubCardPlayer: React.FC<PricingTierProps> = ({ title, price, period, features }) => {
  return (
    <div className="max-w-sm p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col ">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <span className=''>{title && selectIcon(title)}</span>
        <h2 className="text-2xl font-bold text-gray-900 uppercase">
          {title}
        </h2>
      </div>

      <hr className="mb-6 border-gray-100" />

      {/* Content Area */}
      <div className="flex-1 flex gap-2 pb-8">
        {/* Features List */}
        <ul className="space-y-4 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.isAvailable ? (
                <Check className="size-6 text-emerald-500" />
              ) : (
                <Cross className="size-6 text-red-500" />
              )}
              <span className="text-gray-700 text-lg font-medium flex-1">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="flex flex-col justify-center">
          <div className={`text-3xl font-bold ${priceColor(title)}`}>
            £{price}
          </div>
          <div className="text-gray-400 font-medium italic">
            /{period}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <CustomModal
        title="Create New Notification"
        trigger={<button className="w-full py-2 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors cursor-pointer">
          Edit Details
        </button>}
      >
        <CreatePlayerSub />
      </CustomModal>
    </div>
  );
};

export default SubCardPlayer;