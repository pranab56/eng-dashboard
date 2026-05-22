"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dayjs from "dayjs";
import { CalendarDays, Trophy } from "lucide-react";

interface LeagueViewModalProps {
  league: any;
  isOpen: boolean;
  onClose: () => void;
}

const statusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "running": return "bg-green-500/20 text-green-300 border-green-500/30";
    case "upcoming": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    case "finished": return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    default: return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
  }
};

const LeagueViewModal = ({ league, isOpen, onClose }: LeagueViewModalProps) => {
  if (!league) return null;

  const duration = dayjs(league.endDate).diff(dayjs(league.startDate), "day");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-white rounded-2xl p-0 overflow-hidden border-none shadow-2xl animate-in zoom-in-95 duration-200">

        {/* Header */}
        <DialogHeader className="bg-gradient-to-br from-violet-900 via-purple-900 to-black p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-2xl">
              <Trophy className="w-10 h-10 text-yellow-400" />
            </div>
            <div className="text-center">
              <DialogTitle className="text-2xl font-black tracking-tight leading-tight">
                {league.leagueName}
              </DialogTitle>
              <p className="text-purple-300/70 font-bold tracking-widest uppercase text-xs mt-1">
                Season {league.season}
              </p>
            </div>
            <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${statusStyle(league.status)}`}>
              {league.status}
            </span>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-8 space-y-6">

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-purple-200 hover:bg-white hover:shadow-lg hover:shadow-purple-500/5 duration-300">
              <CalendarDays className="w-5 h-5 text-purple-500 mb-2" />
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">Start Date</span>
              <span className="text-gray-900 font-bold text-sm">
                {dayjs(league.startDate).format("DD MMM, YYYY")}
              </span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl flex flex-col items-center text-center transition-all hover:border-purple-200 hover:bg-white hover:shadow-lg hover:shadow-purple-500/5 duration-300">
              <CalendarDays className="w-5 h-5 text-purple-500 mb-2" />
              <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-1">End Date</span>
              <span className="text-gray-900 font-bold text-sm">
                {dayjs(league.endDate).format("DD MMM, YYYY")}
              </span>
            </div>
          </div>

          {/* Duration Banner */}
          <div className="flex items-center justify-between bg-gradient-to-br from-violet-50 to-purple-50 border border-purple-100 rounded-2xl p-6">
            <div>
              <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Total Duration</p>
              <h4 className="text-3xl font-black text-purple-900 mt-1">
                {duration} <span className="text-sm font-bold text-purple-400">Days</span>
              </h4>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
              <Trophy className="w-7 h-7" />
            </div>
          </div>

          {/* Footer Dark Bar */}
          <div className="flex items-center justify-between p-5 bg-gray-900 rounded-2xl text-white shadow-xl">
            <div>
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Created</p>
              <p className="font-bold text-sm">{dayjs(league.createdAt).format("DD MMM, YYYY")}</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-right">
              <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">League ID</p>
              <p className="font-mono text-[11px] text-purple-300">{league._id}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeagueViewModal;
