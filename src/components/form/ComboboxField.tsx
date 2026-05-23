/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Control, Controller, FieldError } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface ComboboxFieldProps {
  name: string
  label?: string
  control: Control<any>
  options: { label: string; value: string }[]
  placeholder?: string
  error?: FieldError
}

const ComboboxField = ({
  name,
  label,
  control,
  options,
  placeholder = "Select option...",
  error,
}: ComboboxFieldProps) => {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-bold text-gray-700 block">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "w-full justify-between h-12 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50 bg-white",
                  !field.value && "text-gray-400",
                  error && "border-red-500 focus-visible:ring-red-500"
                )}
              >
                {field.value
                  ? options.find((option) => option.value === field.value)?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-gray-200 shadow-xl rounded-xl overflow-hidden" align="start">
              <div className="flex items-center border-b border-gray-100 px-3 bg-gray-50">
                <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 border-none bg-transparent focus-visible:ring-0 px-0  shadow-none"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto p-1 bg-white">
                {filteredOptions.length === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-500">
                    No results found.
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <div
                      key={option.value}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none transition-colors hover:bg-blue-50 hover:text-blue-900 group",
                        field.value === option.value ? "bg-blue-50 text-blue-900 font-bold" : "text-gray-600"
                      )}
                      onClick={() => {
                        field.onChange(option.value === field.value ? "" : option.value)
                        setOpen(false)
                        setSearchTerm("")
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 transition-all",
                          field.value === option.value ? "opacity-100 scale-100" : "opacity-0 scale-50"
                        )}
                      />
                      {option.label}
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      />
      {error && (
        <p className="text-xs font-semibold text-red-500">{error.message}</p>
      )}
    </div>
  )
}

export default ComboboxField
