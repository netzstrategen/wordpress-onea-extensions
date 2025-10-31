import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import type { FormValues, FormConfig } from "../types";

interface UseFormNavigationProps {
  form: UseFormReturn<any>;
  config: FormConfig;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  allFormValues: FormValues;
  setAllFormValues: (values: FormValues) => void;
  saveData: (values: FormValues, step: number) => void;
  clearData: () => void;
  productId?: string;
}

/**
 * Hook to handle form navigation (next, previous, reset)
 */
export function useFormNavigation({
  form,
  config,
  currentStep,
  setCurrentStep,
  allFormValues,
  setAllFormValues,
  saveData,
  clearData,
  productId,
}: UseFormNavigationProps) {
  const isLastStep = currentStep === config.steps.length - 1;

  // Helper function to build submission data with labels
  const buildSubmissionData = useCallback(
    (values: FormValues) => {
      const submissionData: Array<{
        fieldName: string;
        label: string;
        value: any;
      }> = [];

      config.steps.forEach((step) => {
        step.fieldGroups.forEach((group) => {
          group.fields.forEach((field) => {
            if (values[field.name] !== undefined && values[field.name] !== "") {
              submissionData.push({
                fieldName: field.name,
                label: field.label,
                value: values[field.name],
              });
            }
          });
        });
      });

      return submissionData;
    },
    [config]
  );

  // Handle next step
  const handleNext = form.handleSubmit(async (data) => {
    const updatedValues = { ...allFormValues, ...data };
    setAllFormValues(updatedValues);

    if (!isLastStep) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      saveData(updatedValues, newStep);
      setTimeout(() => {
        form.reset(updatedValues);
      }, 0);
    } else {
      // Final step - submit the form
      saveData(updatedValues, currentStep);

      // Build structured submission data with labels
      const submissionData = buildSubmissionData(updatedValues);

      // TODO: Replace with actual API call when endpoint is ready
      console.log("=== FORM SUBMISSION ===");
      console.log("Form ID:", config.formId);
      console.log("Product ID:", productId);
      console.log(JSON.stringify(submissionData, null, 2));
      console.log("======================");

      // Simulate API call
      alert(
        `Form submitted successfully!\n\nCheck the browser console to see all form data.\n\nTotal fields: ${
          Object.keys(updatedValues).length
        }\nProduct ID: ${productId || "N/A"}`
      );
    }
  });

  // Handle previous step
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      const currentValues = form.getValues();
      const updatedValues = { ...allFormValues, ...currentValues };
      const newStep = currentStep - 1;
      setAllFormValues(updatedValues);
      setCurrentStep(newStep);
      saveData(updatedValues, newStep);
      setTimeout(() => {
        form.reset(updatedValues);
      }, 0);
    }
  }, [
    currentStep,
    form,
    allFormValues,
    setAllFormValues,
    setCurrentStep,
    saveData,
  ]);

  // Handle step click in indicator
  const handleStepClick = useCallback(
    (stepIndex: number) => {
      if (stepIndex < currentStep) {
        const currentValues = form.getValues();
        const updatedValues = { ...allFormValues, ...currentValues };
        setAllFormValues(updatedValues);
        setCurrentStep(stepIndex);
        saveData(updatedValues, stepIndex);
        // Defer form.reset to next tick to ensure state updates complete
        // Without setTimeout, form.reset triggers form.watch which saves with old currentStep
        setTimeout(() => {
          form.reset(updatedValues);
        }, 0);
      }
    },
    [
      currentStep,
      form,
      allFormValues,
      setAllFormValues,
      setCurrentStep,
      saveData,
    ]
  );

  // Handle form reset
  const handleReset = useCallback(() => {
    // Clear localStorage
    clearData();

    // Create explicit empty values for all fields
    const emptyValues: Record<string, any> = {};
    config.steps.forEach((step) => {
      step.fieldGroups.forEach((group) => {
        group.fields.forEach((field) => {
          if (field.type === "checkbox") {
            emptyValues[field.name] = [];
          } else if (field.type === "number") {
            emptyValues[field.name] = "";
          } else {
            emptyValues[field.name] = "";
          }
        });
      });
    });

    // Reset form immediately with empty values
    form.reset(emptyValues, {
      keepErrors: false,
      keepDirty: false,
      keepIsSubmitted: false,
      keepTouched: false,
      keepIsValid: false,
      keepSubmitCount: false,
    });

    // Reset all state
    setAllFormValues({});
    setCurrentStep(0);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [clearData, config, form, setAllFormValues, setCurrentStep]);

  return {
    isLastStep,
    handleNext,
    handlePrevious,
    handleStepClick,
    handleReset,
  };
}
