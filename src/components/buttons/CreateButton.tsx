import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import React from 'react'

const CreateButton = ({ text, className }: { text: string, className?: string }) => {
  return (
    <span className={cn('flex items-center gap-2 px-5 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer', className)}>
      <Plus className="w-4 h-4" />
      {text}
    </span>
  )
}

export default CreateButton