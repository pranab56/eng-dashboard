"use client";

import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryParam } from "@/hooks/useQueryParam";

type TSelectProps = {
  selectValues: { value: string; label: string }[];
  selectType: string;
};

const CustomSelect = ({ selectValues, selectType }: TSelectProps) => {
  const { value: selectValue, setValue: setSelectValue } = useQueryParam(selectType);

  return (
    <Select onValueChange={setSelectValue} value={selectValue || selectValues[0].value}>
      <SelectTrigger className="min-w-[120px] bg-gray-100">
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {selectValues.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default CustomSelect;