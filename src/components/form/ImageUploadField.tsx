/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef } from "react";
import { Controller, Control, FieldError } from "react-hook-form";
import { CloudUpload, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

type ImageUploadFieldProps = {
  name: string;
  label?: string;
  control: Control<any>;
  error?: FieldError;
  maxSizeMB?: number;
  children?: React.ReactNode;
};

const ImageUploadField = ({
  name,
  label,
  control,
  error,
  maxSizeMB = 5,
  children,
}: ImageUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-[15px] font-semibold text-gray-800">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field }) => {

          const preview = field.value ? typeof field.value === "string" ? field.value : URL.createObjectURL(field.value) : null;

          return (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                className={`group relative border-2 border-dashed rounded-xl px-2 pt-4 flex flex-col items-center justify-center space-y-5 cursor-pointer transition-all border-gray-300 hover:border-black/20`}
              >
                {preview ? (
                  <div className="relative w-full max-w-[400px] aspect-[2/1] bg-white rounded-lg overflow-hidden shadow-sm border border-gray-100 animate-in zoom-in-95 duration-300">
                    <Image
                      src={preview}
                      alt="Logo Preview"
                      fill
                      className="object-contain p-4"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        field.onChange(null);
                        if (inputRef.current) inputRef.current.value = "";
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/80 text-white rounded-full hover:bg-black transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  children
                )}

                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    if (file.size > maxSizeMB * 1024 * 1024) {
                      toast.error(`File size must be less than ${maxSizeMB}MB`);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      field.onChange(file);
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-red-500 mt-2 px-1">
                  {error.message}
                </p>
              )}
            </>
          );
        }}
      />
    </div>
  );
};


export const ImageChildrenComponent = ({ maxSizeMB }: { maxSizeMB: number }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-5">
      <div className="bg-[#0f0f0f] p-4 rounded-lg shadow-lg ring-4 ring-black/5 group-hover:scale-110 transition-transform duration-300">
        <CloudUpload className="w-8 h-8 text-yellow-500" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-[17px] font-bold text-gray-900">
          Upload Image Here
        </p>
        <p className="text-[13px] font-medium text-gray-400">
          SVG, PNG, JPG or GIF (max. {maxSizeMB}MB)
        </p>
      </div>
    </div>
  );
}

export default ImageUploadField;