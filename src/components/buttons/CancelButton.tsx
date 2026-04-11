import { cn } from '@/lib/utils'
import React from 'react'

const CancelButton = ({ onClick, title, className }: { onClick: () => void, title: string, className?: string }) => {
  return (
    <button type="button" onClick={() => onClick()} className={cn(`px-10 py-3 rounded-lg font-bold text-[#f43f5e] bg-[#fee2e2]/60 hover:bg-[#fee2e2] active:scale-95 transition-all text-[15px] cursor-pointer`, className)}>
      {title}
    </button>
  )
}

export default CancelButton