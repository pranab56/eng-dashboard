import { cn } from '@/lib/utils';
import React from 'react'
import { MdOutlineFileDownload } from 'react-icons/md'

const ExportButton = ({ url, className }: { url: string, className?: string }) => {

  const downloadFile = () => {
    alert(url);
  }

  return (
    <button onClick={downloadFile} className={cn('flex items-center gap-2 bg-[#F3F3F3] px-4 py-2 rounded-md cursor-pointer hover:bg-[#EABB00] text-gray-700 hover:text-white transition-colors duration-300 font-semibold', className)}>
      <MdOutlineFileDownload className='size-5' />
      <span>Export</span>
    </button>
  )
}

export default ExportButton