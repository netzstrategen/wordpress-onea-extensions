import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import type { FormConfig, FormStep, FieldGroup, FormField } from "../types";

interface UseResetDependentFieldsProps {
  form: UseFormReturn<any>;
  config: FormConfig;
  isInitialized: boolean;
  setAllFormValues: React.Dispatch<React.SetStateAction<any>>;
}

/**
 * Hook that resets dependent fields when their parent field value changes
 * and no longer satisfies the dependency condition.
 *
 * Example: If a user selects "Ja" and fills dependent fields, then changes to "Nein",
 * the dependent fields will be automatically cleared.
 */
export function useResetDependentFields({
  form,
  config,
  isInitialized,
  setAllFormValues,
}: UseResetDependentFieldsProps) {
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((values, { name }) => {
      if (!name) return;

      // Find all fields that depend on the changed field
      const allFields: FormField[] = config.steps.flatMap((step: FormStep) =>
        step.fieldGroups.flatMap((group: FieldGroup) => group.fields)
      );

      const dependentFields = allFields.filter(
        (field: FormField) =>
          field.dependsOn &&
          field.dependsOn.field === name &&
          values[name] !== field.dependsOn.value &&
          (Array.isArray(field.dependsOn.value)
            ? !field.dependsOn.value.includes(values[name])
            : true)
      );

      // Reset the value of dependent fields
      dependentFields.forEach((field: FormField) => {
        if (values[field.name] !== undefined && values[field.name] !== "") {
          form.setValue(field.name, undefined as any);
          // Also update allFormValues
          setAllFormValues((prev: any) => {
            const updated = { ...prev };
            delete updated[field.name];
            return updated;
          });
        }
      });
    });

    return () => subscription.unsubscribe();
  }, [form, config.steps, isInitialized, setAllFormValues]);
}
