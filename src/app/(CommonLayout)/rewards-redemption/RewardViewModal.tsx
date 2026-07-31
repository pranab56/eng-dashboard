/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { formatImagePath } from '@/utils/formatImagePath';
import { X, Sparkles, Gift, Tag, Calendar } from 'lucide-react';

dayjs.extend(relativeTime);

interface RewardViewModalProps {
  reward: any;
  isOpen: boolean;
  onClose: () => void;
}

const RewardViewModal = ({ reward, isOpen, onClose }: RewardViewModalProps) => {
  if (!reward) return null;

  const imageUrl = formatImagePath(reward.image);
  const isPublished = (reward.status || '').toLowerCase() === 'publish' || (reward.status || '').toLowerCase() === 'active';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-lg bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-amber-950 via-orange-900 to-black h-36 relative overflow-hidden">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20 backdrop-blur-md"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="px-6 pb-6 -mt-16 relative z-10 space-y-6">
          {/* Centered Image Card */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative w-28 h-28 bg-white rounded-3xl p-3 shadow-2xl border-2 border-gray-100/80 overflow-hidden flex items-center justify-center group">
              {imageUrl ? (
                <Image src={imageUrl} alt="reward" fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <Gift className="w-10 h-10 text-amber-500" />
              )}
            </div>

            <div className="space-y-1.5">
              <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight">{reward.brand || reward.rewardName || 'Reward Item'}</DialogTitle>
              <div className="flex items-center justify-center gap-2">
                {reward.productType && (
                  <span className="px-3 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-extrabold . tracking-widest border border-blue-100 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-blue-500" /> {reward.productType}
                  </span>
                )}
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold . tracking-widest border ${isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                  {reward.status || 'Active'}
                </span>
              </div>
            </div>
          </div>

          {/* Points & Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-4 border border-amber-100 space-y-1">
              <p className="text-[10px] font-extrabold text-amber-700 . tracking-widest flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Points Valuation
              </p>
              <h4 className="text-3xl font-black text-amber-950 leading-none">
                {reward.point ?? reward.pointsRequired ?? 0} <span className="text-xs font-medium text-amber-600 ml-0.5">pts</span>
              </h4>
            </div>

            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-1">
              <p className="text-[10px] font-extrabold text-gray-500 . tracking-widest flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Created Date
              </p>
              <h4 className="text-base font-medium text-gray-900 leading-tight">
                {reward.createdAt ? dayjs(reward.createdAt).format("DD MMM YYYY") : "N/A"}
              </h4>
              {reward.createdAt && (
                <p className="text-[10px] text-gray-400 font-semibold">{dayjs(reward.createdAt).fromNow()}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RewardViewModal;
