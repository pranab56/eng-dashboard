import { useQueryParam } from '@/hooks/useQueryParam';
import React from 'react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';

const CustomDate = ({ selectType }: { selectType: string }) => {
  const { value: selectDate, setValue: setSelectDate } = useQueryParam(selectType);

  return (
    <div className="relative flex items-center">
      <CustomDatePicker
        value={selectDate || ""}
        onChange={(val) => setSelectDate(val)}
      />
    </div>
  );
};

export default CustomDate;