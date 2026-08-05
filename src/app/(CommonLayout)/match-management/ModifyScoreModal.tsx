"use client"
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModifyScoreMutation } from '@/features/match/matchApi';
import { toast } from 'sonner';
import Image from 'next/image';
import { formatImagePath } from '../../../utils/formatImagePath';
import { X } from 'lucide-react';

interface ModifyScoreModalProps {
  match: any;
  isOpen: boolean;
  onClose: () => void;
}

const ModifyScoreModal = ({ match, isOpen, onClose }: ModifyScoreModalProps) => {
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [modifyScore, { isLoading }] = useModifyScoreMutation();

  useEffect(() => {
    if (match) {
      setHomeScore(match.homeScore ?? 0);
      setAwayScore(match.awayScore ?? 0);
    }
  }, [match]);

  if (!match) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await modifyScore({
        id: match._id,
        data: { homeScore, awayScore }
      }).unwrap();
      
      if (res.success) {
        toast.success(res.message || "Match score modified successfully.");
      } else {
        toast.success("Match score modified successfully.");
      }
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to modify match score");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="max-w-md bg-white rounded-3xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="bg-slate-950 p-6 text-white relative text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogTitle className="text-xl font-bold text-white tracking-tight">
            Modify Match Score
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
            {/* Home Team */}
            <div className="flex flex-col items-center flex-1 text-center space-y-2">
              <div className="relative w-12 h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-2">
                {match.homeTeam?.teamLogo ? (
                  <Image src={formatImagePath(match.homeTeam.teamLogo)} alt="home" fill className="object-contain p-1" />
                ) : (
                  <div className="text-gray-300 text-[8px] font-medium text-center">No Logo</div>
                )}
              </div>
              <span className="font-semibold text-xs text-gray-700 line-clamp-1">{match.homeTeam?.teamName || 'Home'}</span>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg py-1.5 text-center text-lg font-bold text-gray-800 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Separator / VS */}
            <div className="text-gray-300 font-light text-2xl">:</div>

            {/* Away Team */}
            <div className="flex flex-col items-center flex-1 text-center space-y-2">
              <div className="relative w-12 h-12 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-2">
                {match.awayTeam?.teamLogo ? (
                  <Image src={formatImagePath(match.awayTeam.teamLogo)} alt="away" fill className="object-contain p-1" />
                ) : (
                  <div className="text-gray-300 text-[8px] font-medium text-center">No Logo</div>
                )}
              </div>
              <span className="font-semibold text-xs text-gray-700 line-clamp-1">{match.awayTeam?.teamName || 'Away'}</span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-16 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg py-1.5 text-center text-lg font-bold text-gray-800 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl cursor-pointer text-gray-600 font-medium hover:bg-gray-50 border-gray-200 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-emerald-100"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Save Score"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ModifyScoreModal;
