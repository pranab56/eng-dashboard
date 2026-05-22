"use client"
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { baseURL } from '../../../utils/BaseURL';

dayjs.extend(relativeTime);

interface RewardViewModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardViewModal = ({ reward, isOpen, onClose }: RewardViewModalProps) => {
  if (!reward) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-xl p-0 overflow-hidden border-none">
        {/* Header with Background Pattern */}
        <div className="bg-gray-500 h-32 relative">

        </div>

        <div className="px-10 pb-10 -mt-16">
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Image Section */}
            <div className="relative group">
              <div className="relative w-32 h-32 bg-white rounded-3xl p-3 shadow-2xl border border-gray-50 overflow-hidden">
                {reward.image ? (
                  <Image src={baseURL + reward.image} alt="reward" width={200} height={200} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 font-black text-xs uppercase">No Image</div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <DialogTitle className="text-3xl font-medium text-gray-900">{reward.brand}</DialogTitle>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  {reward.productType}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${reward.status === 'publish' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                  }`}>
                  {reward.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-1">
              <p className="text-[12px] font-medium text-gray-500">Points Valuation</p>
              <h4 className="text-4xl font-medium text-gray-900 leading-none">
                {reward.point} <span className="text-sm font-medium text-gray-500 ml-1">pts</span>
              </h4>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-1">
              <p className="text-[12px] font-medium text-gray-500">Created Date</p>
              <h4 className="text-xl font-medium text-gray-900 leading-none py-2">
                {dayjs(reward.createdAt).format("DD MMM YYYY")}
              </h4>
              <p className="text-[12px] text-gray-400 font-medium">{dayjs(reward.createdAt).fromNow()}</p>
            </div>
          </div>


        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardViewModal;
