import { useQueryParam } from '@/hooks/useQueryParam';
import React from 'react'

const CustomDate = ({selectType}: {selectType: string}) => {
  const { value:selectDate, setValue:setSelectDate } = useQueryParam( selectType );

  return (
    <div className="relative flex items-center">
      <input onChange={(e) => setSelectDate(e.target.value)} value={selectDate} type="date" placeholder="mm/dd/yyyy" className="px-4 py-2 bg-gray-100 border-none rounded-md text-sm text-gray-700 focus:ring-1 focus:ring-blue-500 outline-none" />
    </div>
  )
}

export default CustomDate