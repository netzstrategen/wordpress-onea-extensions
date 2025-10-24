import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { FormField as FormFieldType } from "./types";

interface FormFieldProps {
  field: FormFieldType;
  form: UseFormReturn<any>;
}

export const FormField: React.FC<FormFieldProps> = ({ field, form }) => {
  return (
    <ShadcnFormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>

          <FormControl>{renderFieldInput(field, formField)}</FormControl>

          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

function renderFieldInput(field: FormFieldType, formField: any) {
  switch (field.type) {
    case "text":
    case "email":
      return (
        <Input
          {...formField}
          type={field.type}
          placeholder={field.placeholder}
        />
      );

    case "number":
      return (
        <Input
          {...formField}
          type="number"
          placeholder={field.placeholder}
          onChange={(e) => {
            const value = e.target.value;
            formField.onChange(value === "" ? "" : Number(value));
          }}
        />
      );

    case "select":
      if (field.type === "select") {
        return (
          <Select
            onValueChange={formField.onChange}
            defaultValue={formField.value}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }
      return null;

    case "radio":
      if (field.type === "radio") {
        return (
          <RadioGroup
            onValueChange={formField.onChange}
            defaultValue={formField.value}
            className="flex flex-col space-y-1"
          >
            {field.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={`${field.name}-${option.value}`}
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      }
      return null;

    case "checkbox":
      if (field.type === "checkbox") {
        return (
          <div className="space-y-2">
            {field.options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.name}-${option.value}`}
                  checked={formField.value?.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = formField.value || [];
                    if (checked) {
                      formField.onChange([...currentValues, option.value]);
                    } else {
                      formField.onChange(
                        currentValues.filter(
                          (val: string) => val !== option.value
                        )
                      );
                    }
                  }}
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      }
      return null;

    case "file":
      if (field.type === "file") {
        return (
          <Input
            type="file"
            accept={field.accept}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // For now, store the file object
                // In production, you might want to convert to base64
                formField.onChange(file);
              }
            }}
          />
        );
      }
      return null;

    default:
      return null;
  }
}
