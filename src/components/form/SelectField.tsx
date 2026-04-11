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
};

const SelectField = ({
  name,
  label,
  placeholder = "Select option",
  control,
  options,
  error,
}: SelectFieldProps) => {
  return (
    <div className="space-y-3">
      {label && (<label className="block text-[15px] font-semibold text-gray-800">{label}</label>)}

      <div className="relative group">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger
                size="lg"
                className={`w-full h-20 py-3 bg-gray-100 ${error ? "border-red-400" : ""
                  }`}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />

        {error && (
          <p className="text-sm font-medium text-red-500 mt-2 px-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectField;