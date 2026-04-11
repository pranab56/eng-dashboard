import { cn } from '@/lib/utils'
import React from 'react'

const CustomButton = ({ onClick, title, className }: { onClick: () => void, title: string, className?: string }) => {
  return (
    <button type="button" onClick={() => onClick()} className={cn(`px-10 py-3 rounded-lg font-bold text-white bg-[#0f0f0f] hover:bg-black active:scale-95 transition-all text-[15px] shadow-lg shadow-black/10 flex items-center space-x-2 cursor-pointer`, className)}>
      {title}
    </button>
  )
}

export default CustomButton