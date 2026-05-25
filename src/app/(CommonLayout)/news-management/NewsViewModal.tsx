"use client"
import {
  Dialog,
  DialogContent,
  DialogTitle
} from "@/components/ui/dialog";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from 'next/image';
import { NewsRecord } from "@/types/dashboard";
import { baseURL } from '../../../utils/BaseURL';

dayjs.extend(relativeTime);

interface NewsViewModalProps {
  news: NewsRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

const NewsViewModal = ({ news, isOpen, onClose }: NewsViewModalProps) => {
  if (!news) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-white rounded-xl p-0 overflow-hidden border-none shadow-2xl">

        {/* Cover Image Section */}
        <div className="relative h-64 w-full bg-gray-100">
          {news.image ? (
            <Image src={baseURL + news.image} alt="news cover" fill quality={100} className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-xl bg-gray-50 uppercase tracking-widest">
              NO IMAGE PROVIDED
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute bottom-6 left-10 right-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {news.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${news.status === 'publish' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                }`}>
                {news.status}
              </span>
            </div>
            <DialogTitle className="text-3xl font-black text-white leading-tight tracking-tight shadow-sm">
              {news.title}
            </DialogTitle>
          </div>
        </div>

        <div className="px-10 py-10 space-y-8">
          {/* Metadata Row */}


          {/* Content Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-400">Article Body</h3>
            <div className="bg-gray-50 rounded-sm p-8 border border-gray-100 font-medium text-gray-700">
              “{news.description}”
            </div>
          </div>

          <div className="">
            <div className="flex items-center justify-between border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Publication Date</p>
                <p className="text-sm font-bold text-gray-900">{dayjs(news.publishDateTime).format("DD MMMM YYYY")}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase">{dayjs(news.publishDateTime).fromNow()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsViewModal;
