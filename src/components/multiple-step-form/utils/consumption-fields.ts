import type { FormStep } from "../types";

/**
 * Get the unit for consumption fields by looking up the selected fuel's unit from the JSON config
 */
export function getConsumptionFieldUnit(
  fieldName: string,
  allFormValues: any,
  currentStepConfig?: FormStep
): string | null {
  // Determine which fuel field to look up based on consumption field name
  let fuelFieldName: string | null = null;

  if (fieldName.startsWith("fuelConsumption")) {
    fuelFieldName = "mainFuel";
  } else if (fieldName.startsWith("secondFuelConsumption")) {
    fuelFieldName = "secondFuel";
  } else if (fieldName.startsWith("hotWaterConsumption")) {
    fuelFieldName = "hotWaterFuel";
  }

  if (!fuelFieldName || !allFormValues?.[fuelFieldName] || !currentStepConfig) {
    return null;
  }

  const selectedFuelValue = allFormValues[fuelFieldName];

  // Find the fuel field in the step config to get its options
  for (const group of currentStepConfig.fieldGroups) {
    const fuelField = group.fields.find((f) => f.name === fuelFieldName);
    if (fuelField && fuelField.type === "select") {
      const fuelOptions = (fuelField as any).options;
      if (fuelOptions) {
        const selectedOption = fuelOptions.find(
          (opt: any) => opt.value === selectedFuelValue
        );
        return selectedOption?.unit || null;
      }
    }
  }

  return null;
}
