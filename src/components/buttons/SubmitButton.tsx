import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

const SubmitButton = ({ isSubmitting, title, className }: { isSubmitting: boolean, title: string, className?: string }) => {
  return (
    <button type="submit" disabled={isSubmitting} className={cn(`px-10 py-3 rounded-lg font-bold text-white bg-[#0f0f0f] hover:bg-black active:scale-95 transition-all text-[15px] shadow-lg shadow-black/10 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer`, className)}>
      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
      <span>{isSubmitting ? "Processing..." : title}</span>
    </button>
  )
}

export default SubmitButton