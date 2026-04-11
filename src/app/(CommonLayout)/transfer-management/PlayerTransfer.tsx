import React from 'react';
import Image from 'next/image';
import CancelButton from '@/components/buttons/CancelButton';
import CustomButton from '@/components/buttons/CustomButton';
import { closeCustomModal } from '@/components/modals/CustomModal';
import { toast } from 'sonner';

interface PlayerDetailProps {
  name: string;
  avatarUrl: string;
  age: number;
  position: string;
  currentClub: string;
  fromClub: string;
  toClub: string;
  baseFee: string;
  contractDuration: string;
}

const PlayerTransferDetail = () => {

  const playerData: PlayerDetailProps = {
    name: "Elias Thorne",
    avatarUrl: "https://res.cloudinary.com/dbq7y6byo/image/upload/v1775630362/ENG/player1_m3knp4.png",
    age: 12,
    position: "Forward",
    currentClub: "Manchester City FC",
    fromClub: "Manchester City FC",
    toClub: "London Lions",
    baseFee: "ENG 10000 Coins",
    contractDuration: "End of Season",
  };

  const handleRejectAccount = () => {
    // Handle cancel logic here
    toast.success("Transfer Rejected successfully");
    closeCustomModal();
  };
  const handleApproveAccount = () => {
    // Handle cancel logic here
    toast.success("Transfer Approved successfully");
    closeCustomModal();
  };


  return (
    <div className="max-w-3xl p-6 bg-white rounded-xl">
      {/* Header Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-20 h-20 overflow-hidden rounded-full border-2 border-gray-100">
          <Image
            src={playerData?.avatarUrl}
            alt={playerData?.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{playerData?.name}</h2>
          <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {playerData?.age} Years Old
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {playerData?.position}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
              {playerData?.currentClub}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
        {/* From */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-gray-900">From</label>
          <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium">
            {playerData?.fromClub}
          </div>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-gray-900">To</label>
          <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium">
            {playerData?.toClub}
          </div>
        </div>

        {/* Base Fee */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-gray-900">Base fee</label>
          <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium">
            {playerData?.baseFee}
          </div>
        </div>

        {/* Contract Duration */}
        <div className="space-y-2">
          <label className="block text-base font-semibold text-gray-900">Contact Duration</label>
          <div className="w-full p-4 bg-gray-50 rounded-xl text-gray-800 font-medium">
            {playerData?.contractDuration}
          </div>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="w-full flex justify-end gap-4 mt-8">
        <CancelButton onClick={handleRejectAccount} title="Reject" />
        <CustomButton onClick={handleApproveAccount} title="Approve Transfer" />
      </div>
    </div>
  );
};

export default PlayerTransferDetail;