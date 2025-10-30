import { useMemo } from "react";
import type { FormConfig } from "../types";
import { generateBillingPeriodOptions } from "../utils/billing-periods";

/**
 * Hook to inject dynamic billing period options into form configuration
 */
export function useBillingPeriodOptions(formConfig: FormConfig) {
  // Generate dynamic billing period options
  const billingPeriodOptions = useMemo(
    () => generateBillingPeriodOptions(),
    []
  );

  const config = useMemo(() => {
    const configCopy = JSON.parse(JSON.stringify(formConfig)) as FormConfig;

    // Find and update billing period fields with dynamic options
    configCopy.steps.forEach((step) => {
      step.fieldGroups.forEach((group) => {
        group.fields.forEach((field) => {
          if (field.name === "billingPeriod1" && field.type === "select") {
            (field as any).options = billingPeriodOptions;
          }
          if (
            (field.name === "billingPeriod2" ||
              field.name === "billingPeriod3") &&
            field.type === "select"
          ) {
            (field as any).options = [];
          }
        });
      });
    });

    return configCopy;
  }, [formConfig, billingPeriodOptions]);

  return config;
}
