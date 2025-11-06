import { useEffect, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import type { FormValues } from "../types";
import { calculatePreviousPeriod } from "../utils/billing-periods";

interface UseFormAutoCalculationsProps {
  form: UseFormReturn<any>;
  isInitialized: boolean;
  currentStep: number;
  allFormValues: FormValues;
  setAllFormValues: (values: FormValues) => void;
  saveData: (values: FormValues, step: number) => void;
}

/**
 * Hook to handle automatic calculations for billing periods and number of units
 */
export function useFormAutoCalculations({
  form,
  isInitialized,
  currentStep,
  allFormValues,
  setAllFormValues,
  saveData,
}: UseFormAutoCalculationsProps) {
  // Use ref to track latest form values without causing re-renders
  const allFormValuesRef = useRef<FormValues>({});

  // Keep ref in sync with state
  useEffect(() => {
    allFormValuesRef.current = allFormValues;
  }, [allFormValues]);

  // Single watch subscription to handle all form changes
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((values, { name, type }) => {
      // Skip if this is a setValue operation (type will be undefined for programmatic changes)
      if (type !== "change") return;

      // Use ref to get current values without dependency
      let updatedValues = { ...allFormValuesRef.current };
      let needsUpdate = false;
      let skipSave = false; // Flag to prevent saving during intermediate updates

      // Handle billing period auto-calculation
      if (name === "billingPeriod1" && values.billingPeriod1) {
        const period1Value = values.billingPeriod1;
        const period2Value = calculatePreviousPeriod(period1Value, 1);
        const period3Value = calculatePreviousPeriod(period1Value, 2);

        // Use batch updates to prevent multiple re-renders
        skipSave = true; // Don't save yet
        setTimeout(() => {
          form.setValue("billingPeriod2", period2Value, {
            shouldValidate: false,
            shouldDirty: false,
          });
          form.setValue("billingPeriod3", period3Value, {
            shouldValidate: false,
            shouldDirty: false,
          });

          // Now update state and save
          const finalValues = {
            ...allFormValuesRef.current,
            billingPeriod1: period1Value,
            billingPeriod2: period2Value,
            billingPeriod3: period3Value,
          };
          setAllFormValues(finalValues);
          saveData(finalValues, currentStep);
        }, 0);

        updatedValues = {
          ...updatedValues,
          billingPeriod1: period1Value,
        };
        needsUpdate = true;
      }
      // Handle buildingType auto-set numberOfUnits
      else if (name === "buildingType" && values.buildingType) {
        const buildingType = values.buildingType;
        let unitsValue: number | undefined;

        if (buildingType === "einfamilienhaus") {
          unitsValue = 1;
        } else if (buildingType === "zweifamilienhaus") {
          unitsValue = 2;
        } else if (buildingType === "mehrfamilienhaus") {
          const currentUnits = allFormValuesRef.current.numberOfUnits;
          // Only set to 3 if coming from einfamilienhaus/zweifamilienhaus or not set
          if (
            currentUnits === undefined ||
            currentUnits === 1 ||
            currentUnits === 2
          ) {
            unitsValue = 3;
          }
        } else if (
          buildingType === "wohnteilGemischt" ||
          buildingType === "sonstiges"
        ) {
          // Always reset to 1 for these building types
          unitsValue = 1;
        }

        if (unitsValue !== undefined) {
          // Use batch update
          skipSave = true;
          setTimeout(() => {
            form.setValue("numberOfUnits", unitsValue, {
              shouldValidate: true,
              shouldDirty: false,
            });

            // Now update state and save
            const finalValues = {
              ...allFormValuesRef.current,
              buildingType: buildingType,
              numberOfUnits: unitsValue,
            };
            setAllFormValues(finalValues);
            saveData(finalValues, currentStep);
          }, 0);

          updatedValues = {
            ...updatedValues,
            buildingType: buildingType,
          };
          needsUpdate = true;
        } else {
          updatedValues = {
            ...updatedValues,
            buildingType: buildingType,
          };
          needsUpdate = true;
        }
      }
      // Handle regular field changes
      else if (name && values[name] !== allFormValuesRef.current[name]) {
        updatedValues = { ...updatedValues, [name]: values[name] };
        needsUpdate = true;
      }

      // Only update state if something actually changed
      if (needsUpdate && !skipSave) {
        setAllFormValues(updatedValues);
        saveData(updatedValues, currentStep);
      } else if (needsUpdate && skipSave) {
        // Update state but don't save (will be saved in the setTimeout)
        setAllFormValues(updatedValues);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, saveData, isInitialized, currentStep, setAllFormValues]);
}
