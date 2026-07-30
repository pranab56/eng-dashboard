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
      className={cn('flex items-center gap-2 px-5 py-3.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium cursor-pointer', className)}
    >
      <Plus className="w-4 h-4" />
      {text}
    </button>
  )
}

export default CreateButton