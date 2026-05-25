"use client"
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import { EventRecord } from "@/types/dashboard";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { baseURL } from '../../../utils/BaseURL';

dayjs.extend(relativeTime);

interface EventViewModalProps {
  event: EventRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const EventViewModal = ({ event, isOpen, onClose }: EventViewModalProps) => {
  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white rounded-xl p-0 overflow-hidden border-none shadow-2xl">

        {/* Cover Image Section */}
        <div className="relative h-64 w-full bg-gray-100">
          {event.image ? (
            <Image src={baseURL + event.image} alt="event cover" fill quality={100} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-xl bg-gray-50 uppercase tracking-widest">
              NO IMAGE PROVIDED
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute bottom-6 left-10 right-10">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${event.status === 'publish' ? 'bg-green-500 text-white' : event.status === 'canceled' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                {event.status}
              </span>
            </div>
            <DialogTitle className="text-3xl font-black text-white leading-tight tracking-tight shadow-sm">
              {event.title}
            </DialogTitle>
          </div>
        </div>

        <div className="px-10 py-10 space-y-8">
          {/* Location and Date Info */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
              <p className="text-lg font-bold text-gray-900">{event.location}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Date & Time</p>
              <p className="text-sm font-bold text-gray-900">{dayjs(event.eventDate).format("DD MMMM YYYY, hh:mm A")}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase">{dayjs(event.eventDate).fromNow()}</p>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Event Description</h3>
            <div className="bg-gray-50 rounded-sm p-8 border border-gray-100 font-medium text-gray-700">
              “{event.description}”
            </div>
          </div>

          {/* Publication Info */}
          <div className="">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Published On</p>
                <p className="text-sm font-bold text-gray-900">{dayjs(event.publishDateTime).format("DD MMMM YYYY")}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase">{dayjs(event.publishDateTime).fromNow()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventViewModal;