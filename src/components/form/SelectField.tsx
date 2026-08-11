/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, Control, FieldError } from "react-hook-form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  name: string;
  label?: string;
  placeholder?: string;
  control: Control<any>;
  options: Option[];
  error?: FieldError;
  scrollable?: boolean;
};

const SelectField = ({
  name,
  label,
  placeholder = "Select option",
  control,
  options,
  error,
  scrollable = false,
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-bold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative group">
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const hasValidValue = Boolean(field.value && options?.some((opt) => opt.value === field.value));
            const selectValue = hasValidValue ? field.value : undefined;

            return (
              <Select key={selectValue || 'empty'} onValueChange={field.onChange} value={selectValue}>
                <SelectTrigger
                  className={`w-full h-11 px-4 bg-[#f8fafc] border rounded-2xl text-xs font-semibold text-gray-800 hover:bg-white focus:outline-none focus:ring-4 transition-all duration-200 cursor-pointer shadow-2xs ${
                    error
                      ? "border-red-400 focus:ring-red-100 bg-red-50/30"
                      : "border-gray-200/90 hover:border-blue-400 focus:border-blue-500 focus:ring-blue-500/10 focus:bg-white"
                  }`}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent className={`bg-white rounded-2xl border border-gray-100 shadow-2xl p-1.5 z-50 ${scrollable ? "max-h-[280px] overflow-y-auto" : ""}`}>
                  <SelectGroup>
                    {options.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl px-3 py-2.5 transition-all cursor-pointer"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            );
          }}
        />

        {error && (
          <p className="text-xs font-semibold text-red-500 mt-1 px-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectField;