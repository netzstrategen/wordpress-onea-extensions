import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import type { FormStep } from "../types";

interface UseFormValidationWatchProps {
  form: UseFormReturn<any>;
  isInitialized: boolean;
  currentStepConfig: FormStep;
}

/**
 * Hook to watch for field changes and trigger re-validation for custom validations
 * This ensures error messages disappear/appear immediately when values change
 */
export function useFormValidationWatch({
  form,
  isInitialized,
  currentStepConfig,
}: UseFormValidationWatchProps) {
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((value, { name }) => {
      if (name) {
        const fieldsToRevalidate = new Set<string>();

        // Check field-level custom validations
        currentStepConfig.fieldGroups.forEach((group) => {
          group.fields.forEach((field) => {
            if (field.validation?.customValidations) {
              const hasReference = field.validation.customValidations.some(
                (rule) => rule.condition.includes(name)
              );
              // Revalidate this field if its condition references the changed field,
              // or if this is the changed field itself
              if (hasReference || field.name === name) {
                fieldsToRevalidate.add(field.name);
              }
            }
          });
        });

        // Trigger validation for affected fields asynchronously
        if (fieldsToRevalidate.size > 0) {
          setTimeout(() => {
            fieldsToRevalidate.forEach((fieldName) => {
              form.trigger(fieldName);
            });
          }, 0);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form, isInitialized, currentStepConfig]);
}
