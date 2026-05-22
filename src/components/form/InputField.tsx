/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldError, UseFormRegister } from "react-hook-form";

type InputFieldProps = {
  name: string;
  title: string;
  placeholder?: string;
  type?: string;
  register: UseFormRegister<any>;
  registerOptions?: any;
  error?: FieldError;
};

const InputField = ({
  title,
  name,
  placeholder,
  type = "text",
  register,
  registerOptions,
  error,
}: InputFieldProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-[15px] font-medium text-gray-800">{title}</label>
      <div className="relative group">
        <input
          {...register(name, registerOptions)}
          type={type}
          placeholder={placeholder}
          className={`w-full bg-[#f3f4f6] border-2 rounded-lg py-3 px-6 text-gray-900 font-normal placeholder:text-gray-400 outline-none transition-all hover:bg-[#ecedf0]
        ${error
              ? "border-red-400 focus:ring-red-100 bg-red-50/30"
              : "border-transparent focus:ring-gray-200"
            }`}
        />

        {error && (
          <p className="text-sm font-normal text-red-500 mt-2 px-1">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default InputField;