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
import { MapPin, Calendar } from 'lucide-react';

dayjs.extend(relativeTime);

interface EventViewModalProps {
  event: any;
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
              <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Event
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${event.status === 'publish' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
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
          {/* Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                <p className="text-sm font-bold text-gray-900">{event.location || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Event Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {event.eventDate ? dayjs(event.eventDate).format("DD MMMM, YYYY") : "N/A"}
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase">
                  {event.eventDate ? dayjs(event.eventDate).format("hh:mm A") : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Event Details</h3>
            <div className="bg-gray-50 rounded-sm p-6 border border-gray-100 font-medium text-gray-700 whitespace-pre-wrap">
              {event.description}
            </div>
          </div>

          {/* Publication Date */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="text-left">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publication Date</p>
              <p className="text-sm font-bold text-gray-900">{dayjs(event.publishDateTime).format("DD MMMM YYYY")}</p>
              <p className="text-[9px] text-gray-400 font-bold uppercase">{dayjs(event.publishDateTime).fromNow()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventViewModal;
