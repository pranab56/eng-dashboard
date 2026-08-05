import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import React from 'react'

interface CreateButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

const CreateButton = ({ text, className, onClick }: CreateButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 active:scale-98 transition-all duration-150 text-sm font-semibold shadow-xs border border-slate-800 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 select-none',
        className
      )}
    >
      <Plus className="w-4 h-4 text-slate-300" aria-hidden="true" />
      <span>{text}</span>
    </button>
  );
};

export default CreateButton