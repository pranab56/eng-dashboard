import React from 'react'
import SubCardPlayer from './SubCardPlayer';
import SubCardManager from './SubCardManager';
import TableTitle from '@/components/titles/TableTitle';
import CreateButton from '@/components/buttons/CreateButton';
import { CustomModal } from '@/components/modals/CustomModal';
import CreatePlayerSub from './CreatePlayerSub';
import CreateManagerSub from './CreateManagerSub';

const pricingTiersPlayer = [
  {
    title: "AMATEUR",
    price: "4.95",
    period: "Season",
    features: [
      { text: "ENG Coins Program", isAvailable: true },
      { text: "Player Stats", isAvailable: false },
      { text: "ENG Coins with a red cross", isAvailable: false },
    ],
  },
  {
    title: "SEMI PRO",
    price: "12.95",
    period: "Season",
    features: [
      { text: "ENG Coins Program", isAvailable: true },
      { text: "Player Stats", isAvailable: true },
      { text: "ENG Coins with a red cross", isAvailable: false },
    ],
  },
  {
    title: "PROFESSIONAL",
    price: "24.95",
    period: "Season",
    features: [
      { text: "ENG Coins Program", isAvailable: true },
      { text: "Player Stats", isAvailable: true },
      { text: "ENG Coins with a red cross", isAvailable: true },
    ],
  },
];

const pricingTiersManager = [
  {
    title: "Start for Free",
    description: "Access basic manager features with no cost. Perfect for individual learning and initial growth.",
  },
  {
    title: "Earn ENG Manager Coins",
    price: "8.95",
    period: "Monthly",
    description: "Upgrade to earn ENG Manager Coins and unlock premium features, exclusive analytics, and team tools.",
  },
];

const page = () => {
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between px-6 py-1">
          <TableTitle payload={{ title: "Player Subscription" }} />
          <CustomModal
            title="Create New Notification"
            trigger={<button><CreateButton text="Create Subscription" /></button>}
          >
            <CreatePlayerSub />
          </CustomModal>
        </div>
        <div className='flex gap-6'>
          {pricingTiersPlayer.map((tier, index) => (
            <SubCardPlayer key={index} {...tier} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <div className="flex items-center justify-between px-6 py-1">
          <TableTitle payload={{ title: "Player Subscription" }} />
          <CustomModal
            title="Create New Notification"
            trigger={<button><CreateButton text="Create Subscription" /></button>}
          >
            <CreateManagerSub />
          </CustomModal>
        </div>
        <div className='flex gap-6'>
          {pricingTiersManager.map((tier, index) => (
            <SubCardManager key={index} {...tier} />
          ))}
        </div>
      </section>


    </div>
  )
}

export default page