import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import React from 'react'

interface SubmitButtonProps {
  isSubmitting?: boolean;
  isLoading?: boolean;
  title?: string;
  text?: string;
  disabled?: boolean;
  className?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isSubmitting,
  isLoading,
  title,
  text,
  disabled,
  className,
}) => {
  const loading = Boolean(isSubmitting || isLoading);
  const buttonText = title || text || "Submit";

  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(
        `px-10 py-3 rounded-lg font-medium text-white bg-[#0f0f0f] hover:bg-black active:scale-95 transition-all text-[15px] shadow-lg shadow-black/10 flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer`,
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      <span>{loading ? "Processing..." : buttonText}</span>
    </button>
  )
}

export default SubmitButton