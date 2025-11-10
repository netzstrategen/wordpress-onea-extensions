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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { FormField as FormFieldType, FormStep } from "./types";
import { formatPeriodLabel } from "./utils/billing-periods";
import { getConsumptionFieldUnit } from "./utils/consumption-fields";

interface FormFieldProps {
  field: FormFieldType;
  form: UseFormReturn<any>;
  allFormValues?: any;
  currentStepConfig?: FormStep;
  buildingImages?: {
    rechteck?: string;
    lForm?: string;
    tForm?: string;
    uForm?: string;
  };
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  form,
  allFormValues,
  currentStepConfig,
  buildingImages,
}) => {
  const consumptionUnit = getConsumptionFieldUnit(
    field.name,
    allFormValues,
    currentStepConfig
  );

  return (
    <ShadcnFormField
      control={form.control}
      name={field.name}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
            {consumptionUnit && (
              <span className="consumption-unit text-muted-foreground font-normal">
                (in {consumptionUnit})
              </span>
            )}
            {field.tooltip && (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="tooltip-trigger">i</div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="tooltip-content">{field.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </FormLabel>

          <FormControl>
            {renderFieldInput(field, formField, allFormValues, buildingImages)}
          </FormControl>

          {field.description && (
            <FormDescription>{field.description}</FormDescription>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
};

function renderFieldInput(
  field: FormFieldType,
  formField: any,
  allFormValues?: any,
  buildingImages?: {
    rechteck?: string;
    lForm?: string;
    tForm?: string;
    uForm?: string;
  }
) {
  // Check if this is the numberOfUnits field and determine if it should be disabled
  const isNumberOfUnitsField = field.name === "numberOfUnits";
  const buildingType = allFormValues?.buildingType;
  const shouldDisableNumberOfUnits =
    isNumberOfUnitsField &&
    (buildingType === "einfamilienhaus" || buildingType === "zweifamilienhaus");

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
      // Handle disabled number field (e.g., numberOfUnits for einfamilienhaus/zweifamilienhaus)
      if (shouldDisableNumberOfUnits) {
        return (
          <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm">
            <span>{formField.value || ""}</span>
          </div>
        );
      }

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
        // Handle disabled select fields (auto-calculated billing periods)
        if (field.disabled) {
          const displayLabel = formField.value
            ? formatPeriodLabel(formField.value)
            : field.placeholder || "";

          return (
            <div className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-muted px-3 py-2 text-sm">
              <span className={formField.value ? "" : "text-muted-foreground"}>
                {displayLabel}
              </span>
            </div>
          );
        }

        // Normal select field
        return (
          <Select onValueChange={formField.onChange} value={formField.value}>
            <SelectTrigger className="select-trigger">
              <SelectValue
                placeholder={field.placeholder || "Bitte auswählen..."}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options && field.options.length > 0 ? (
                field.options.map((option) => {
                  // Check if option should be disabled based on business logic
                  let isDisabled = option.disabled || false;

                  // Special logic: if this is the fuelType field and heatingSystemType is "fernheizung"
                  // only allow fernwaermeKWK and fernwaermeHeizwerk
                  if (
                    field.name === "fuelType" &&
                    allFormValues?.heatingSystemType === "fernheizung"
                  ) {
                    const allowedFuels = [
                      "fernwaermeKWK",
                      "fernwaermeHeizwerk",
                    ];
                    if (!allowedFuels.includes(option.value)) {
                      isDisabled = true;
                    }
                  }

                  return (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      disabled={isDisabled}
                    >
                      {option.label}
                      {(option as any).unit && (
                        <span className="text-muted-foreground">
                          {" "}
                          ({(option as any).unit})
                        </span>
                      )}
                    </SelectItem>
                  );
                })
              ) : (
                <SelectItem value="no-options" disabled>
                  Keine Optionen verfügbar
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        );
      }
      return null;

    case "image-select":
      if (field.type === "image-select") {
        // Default placeholder SVG images - used when no custom images are uploaded
        const defaultImageMap: Record<string, string> = {
          rechteck:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect x='54' y='24' width='234' height='128' fill='%23e5e7eb' stroke='%236b7280' stroke-width='3'/%3E%3Ctext x='150' y='40' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Ed%3C/text%3E%3Ctext x='30' y='90' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Eb%3C/text%3E%3Ctext x='150' y='170' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ea%3C/text%3E%3Cpath d='M54,24 L54,16 M288,24 L288,16' stroke='%239ca3af' stroke-width='2'/%3E%3Cpath d='M54,16 L288,16' stroke='%239ca3af' stroke-width='2' marker-start='url(%23arrowgray)' marker-end='url(%23arrowgray)'/%3E%3Cpath d='M54,152 L54,160 M288,152 L288,160' stroke='%23f59e0b' stroke-width='2'/%3E%3Cpath d='M54,160 L288,160' stroke='%23f59e0b' stroke-width='2' marker-start='url(%23arroworange)' marker-end='url(%23arroworange)'/%3E%3Cdefs%3E%3Cmarker id='arrowgray' markerWidth='10' markerHeight='10' refX='5' refY='5' orient='auto'%3E%3Cpolygon points='0,5 10,0 10,10' fill='%239ca3af'/%3E%3C/marker%3E%3Cmarker id='arroworange' markerWidth='10' markerHeight='10' refX='5' refY='5' orient='auto'%3E%3Cpolygon points='0,5 10,0 10,10' fill='%23f59e0b'/%3E%3C/marker%3E%3C/defs%3E%3C/svg%3E",
          lForm:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='250' viewBox='0 0 300 250'%3E%3Cpath d='M60,40 L150,40 L150,90 L240,90 L240,210 L60,210 Z' fill='%23e5e7eb' stroke='%236b7280' stroke-width='3'/%3E%3Ctext x='105' y='30' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ea%3C/text%3E%3Ctext x='195' y='70' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ee%3C/text%3E%3Ctext x='105' y='65' text-anchor='end' fill='%239ca3af' font-family='Arial' font-size='14'%3Eg%3C/text%3E%3Ctext x='160' y='125' text-anchor='start' fill='%239ca3af' font-family='Arial' font-size='14'%3Eb%3C/text%3E%3Ctext x='30' y='125' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Ed%3C/text%3E%3Ctext x='230' y='110' text-anchor='end' fill='%239ca3af' font-family='Arial' font-size='14'%3Ec%3C/text%3E%3C/svg%3E",
          tForm:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='250' viewBox='0 0 300 250'%3E%3Cpath d='M80,40 L140,40 L140,80 L220,80 L220,140 L140,140 L140,210 L80,210 L80,140 L40,140 L40,80 L80,80 Z' fill='%23e5e7eb' stroke='%236b7280' stroke-width='3'/%3E%3Ctext x='110' y='30' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ed%3C/text%3E%3Ctext x='180' y='110' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Ee%3C/text%3E%3Ctext x='110' y='230' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ea%3C/text%3E%3Ctext x='230' y='65' text-anchor='start' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Eb%3C/text%3E%3Ctext x='30' y='65' text-anchor='end' fill='%239ca3af' font-family='Arial' font-size='14'%3Ef%3C/text%3E%3Ctext x='150' y='110' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Eg%3C/text%3E%3C/svg%3E",
          uForm:
            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='250' viewBox='0 0 300 250'%3E%3Cpath d='M40,40 L100,40 L100,140 L200,140 L200,40 L260,40 L260,210 L40,210 Z' fill='%23e5e7eb' stroke='%236b7280' stroke-width='3'/%3E%3Ctext x='70' y='30' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ef%3C/text%3E%3Ctext x='230' y='30' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Eb%3C/text%3E%3Ctext x='150' y='230' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ed%3C/text%3E%3Ctext x='30' y='125' text-anchor='middle' fill='%23f59e0b' font-family='Arial' font-size='14' font-weight='bold'%3Ea%3C/text%3E%3Ctext x='270' y='125' text-anchor='start' fill='%239ca3af' font-family='Arial' font-size='14'%3Eh%3C/text%3E%3Ctext x='150' y='125' text-anchor='middle' fill='%239ca3af' font-family='Arial' font-size='14'%3Eg%3C/text%3E%3C/svg%3E",
        };

        // Use custom uploaded images if available and not empty, otherwise fall back to defaults
        const imageMap: Record<string, string> = {
          rechteck:
            buildingImages?.rechteck && buildingImages.rechteck.trim()
              ? buildingImages.rechteck
              : defaultImageMap.rechteck,
          lForm:
            buildingImages?.lForm && buildingImages.lForm.trim()
              ? buildingImages.lForm
              : defaultImageMap.lForm,
          tForm:
            buildingImages?.tForm && buildingImages.tForm.trim()
              ? buildingImages.tForm
              : defaultImageMap.tForm,
          uForm:
            buildingImages?.uForm && buildingImages.uForm.trim()
              ? buildingImages.uForm
              : defaultImageMap.uForm,
        };

        return (
          <div className="grid grid-cols-2 gap-4">
            {field.options.map((option) => {
              const isSelected = formField.value === option.value;
              const imageKey = (option as any).image || option.value;
              const imageSrc = imageMap[imageKey] || defaultImageMap.rechteck;

              return (
                <div
                  key={option.value}
                  onClick={() => formField.onChange(option.value)}
                  className={`
                    relative cursor-pointer rounded-lg border-2 p-4 transition-all
                    ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-gray-300 hover:border-gray-400 hover:shadow-sm"
                    }
                  `}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-md bg-white">
                    <img
                      src={imageSrc}
                      alt={option.label}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">
                    {option.label}
                  </p>
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      return null;

    case "radio":
      if (field.type === "radio") {
        return (
          <RadioGroup
            onValueChange={formField.onChange}
            value={formField.value}
            className="flex flex-row px-4"
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
                // Store file with metadata that can be serialized
                const fileWithMeta = Object.assign(file, {
                  _fileName: file.name,
                  _fileSize: file.size,
                  _fileType: file.type,
                });
                formField.onChange(fileWithMeta);
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
