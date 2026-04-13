/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Control, Controller, FieldError } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

type Option = {
  label: string
  value: string
}

type CheckboxGroupProps = {
  name: string
  label?: string
  description?: string
  control: Control<any>
  options: Option[]
  error?: FieldError
}

const CheckboxGroup = ({
  name,
  label,
  description,
  control,
  options,
  error,
}: CheckboxGroupProps) => {
  return (
    <FieldSet>
      {label && <FieldLegend variant="label">{label}</FieldLegend>}
      {description && (
        <FieldDescription>{description}</FieldDescription>
      )}

      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value: string[] = field.value || []

          const toggleValue = (val: string) => {
            if (value.includes(val)) {
              field.onChange(value.filter((v) => v !== val))
            } else {
              field.onChange([...value, val])
            }
          }

          return (
            <FieldGroup className="gap-3">
              {options.map((option) => (
                <Field orientation="horizontal" key={option.value}>
                  <Checkbox
                    checked={value.includes(option.value)}
                    onCheckedChange={() => toggleValue(option.value)}
                  />
                  <FieldLabel htmlFor={option.value} className="font-normal">
                    {option.label}
                  </FieldLabel>
                </Field>
              ))}
            </FieldGroup>
          )
        }}
      />

      {error && (
        <p className="text-sm text-red-500 mt-2">
          {error.message}
        </p>
      )}
    </FieldSet>
  )
}

export default CheckboxGroup