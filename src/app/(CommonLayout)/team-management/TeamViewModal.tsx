"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import Image from 'next/image';
import { TeamRecord } from "@/types/dashboard";

interface TeamViewModalProps {
  team: TeamRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const TeamViewModal = ({ team, isOpen, onClose }: TeamViewModalProps) => {
  if (!team) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="bg-gradient-to-br from-indigo-900 via-blue-900 to-black p-10 text-white relative">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl p-4 border border-white/20 shadow-2xl">
              {team.teamLogo ? (
                <Image src={team.teamLogo} alt="logo" width={200} height={200} className="object-contain w-full h-full drop-shadow-lg" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/40 font-bold uppercase tracking-widest text-xs">No Logo</div>
              )}
            </div>
            <div className="text-center">
              <DialogTitle className="text-3xl font-black tracking-tight">{team.teamName}</DialogTitle>
              <p className="text-blue-200/60 font-bold tracking-widest uppercase text-sm mt-1">{team.shortName || "Squad"}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* Main Info Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 duration-300">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Stadium</span>
              <span className="text-gray-900 font-bold text-sm leading-tight">{team.stadiumName || "N/A"}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 duration-300">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Locality</span>
              <span className="text-gray-900 font-bold text-sm leading-tight">{team.city || "Unknown City"}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{team.country || "Worldwide"}</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center space-y-1 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 duration-300">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Created At</span>
              <span className="text-gray-900 font-bold text-sm leading-tight">{dayjs(team.createdAt).format("DD MMM, YYYY")}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Registration</span>
            </div>
          </div>

          {/* Sizing Section */}
          <div className="flex gap-6">
            <div className="flex-1 bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100 rounded-3xl p-8 flex items-center justify-between group hover:from-white hover:to-white transition-all duration-500">
              <div className='space-y-1'>
                <span className="text-blue-600 font-black text-[11px] uppercase tracking-widest">Total Squad Strength</span>
                <h4 className='text-3xl font-black text-indigo-900'>{team.totalMembers || 0} <span className='text-sm font-bold text-indigo-400 ml-1'>Players</span></h4>
              </div>
              <div className='w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-2xl group-hover:rotate-12 transition-transform duration-500'>
                {team.teamType?.[0] || 'T'}
              </div>
            </div>
          </div>

          {/* Type & Identity Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-900 rounded-3xl text-white shadow-2xl shadow-indigo-900/20">
            <div className='flex items-center gap-4'>
              <div className='w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-black'>
                #
              </div>
              <div>
                <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Team Type</p>
                <p className="font-bold text-sm">{team.teamType || "N/A"}</p>
              </div>
            </div>
            <div className='h-8 w-px bg-white/20 mx-4'></div>
            <div className='flex-1 text-right'>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Team ID</p>
              <p className="font-mono text-[11px] text-blue-300">{team._id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TeamViewModal;
