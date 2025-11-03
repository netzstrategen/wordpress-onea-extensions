import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { MultiStepFormProps, FormValues } from "./types";
import {
  buildStepSchema,
  shouldIncludeField,
  extractDefaultValues,
} from "./utils/schema-builder";
import { useFormPersistence } from "./hooks/useFormPersistence";
import { useBillingPeriodOptions } from "./hooks/useBillingPeriodOptions";
import { useFormAutoCalculations } from "./hooks/useFormAutoCalculations";
import { useFormNavigation } from "./hooks/useFormNavigation";
import { StepIndicator } from "./StepIndicator";
import { FormField } from "./FormField";

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  formConfig,
  componentId,
  productId,
  nonce,
}) => {
  // Inject dynamic billing period options into form config
  const config = useBillingPeriodOptions(formConfig);

  const [currentStep, setCurrentStep] = useState(0);
  const [allFormValues, setAllFormValues] = useState<FormValues>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { loadSavedData, saveData, clearData } = useFormPersistence({
    formId: config.formId,
  });

  // Extract default values from form configuration
  const schemaDefaultValues = useMemo(() => {
    return extractDefaultValues(config.steps);
  }, [config.steps]);

  // Load saved data before initializing form
  const initialData = useMemo(() => {
    const savedData = loadSavedData();
    if (savedData) {
      // Merge schema defaults with saved data (saved data takes precedence)
      return {
        values: { ...schemaDefaultValues, ...savedData.values },
        step: savedData.currentStep,
      };
    }
    // Use schema defaults if no saved data
    return { values: schemaDefaultValues, step: 0 };
  }, [loadSavedData, schemaDefaultValues]);

  // Initialize state with loaded data
  useEffect(() => {
    if (initialData.step > 0 || Object.keys(initialData.values).length > 0) {
      setAllFormValues(initialData.values);
      setCurrentStep(initialData.step);
    }
    setIsInitialized(true);
  }, [initialData]);

  const currentStepConfig = config.steps[currentStep];

  // Build schema for current step based on all form values
  const stepSchema = buildStepSchema(currentStepConfig, allFormValues);

  // Initialize form with react-hook-form using initial data
  const form = useForm<any>({
    resolver: zodResolver(stepSchema as any),
    defaultValues: initialData.values,
    mode: "onChange", // Validate on change for instant feedback
    reValidateMode: "onChange", // Continue validating on change
  });

  // Handle automatic calculations (billing periods, number of units)
  useFormAutoCalculations({
    form,
    isInitialized,
    currentStep,
    allFormValues,
    setAllFormValues,
    saveData,
  });

  // Handle navigation (next, previous, step click, reset)
  const {
    isLastStep,
    handleNext,
    handlePrevious,
    handleStepClick,
    handleReset,
    isSubmitting,
    submissionError,
  } = useFormNavigation({
    form,
    config,
    currentStep,
    setCurrentStep,
    allFormValues,
    setAllFormValues,
    saveData,
    clearData,
    productId,
    nonce,
  });

  return (
    <div className="onea-multiple-step-form" data-component-id={componentId}>
      <div className="form-header mb-8">
        <h2 className="text-2xl font-bold">{config.title}</h2>
      </div>
      <StepIndicator
        steps={config.steps}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
      <Form {...form}>
        <form onSubmit={handleNext} className="space-y-6 mt-8">
          <div className="step-header mb-6">
            <h3 className="text-xl font-semibold">{currentStepConfig.title}</h3>
          </div>

          {/* Fields rendered in groups */}
          <div className="space-y-6">
            {currentStepConfig.fieldGroups.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="field-group p-6 border border-border rounded-lg bg-card"
              >
                {group.title && (
                  <h4 className="text-base font-semibold mb-4">
                    {group.title}
                  </h4>
                )}
                {group.description && (
                  <p className="text-sm text-muted-foreground mb-4">
                    {group.description}
                  </p>
                )}
                <div className="space-y-4">
                  {group.fields.map((field) => {
                    // Collect all fields from current step for nested dependency checking
                    const allStepFields = currentStepConfig.fieldGroups.flatMap(
                      (g) => g.fields
                    );
                    if (
                      !shouldIncludeField(field, allFormValues, allStepFields)
                    ) {
                      return null;
                    }
                    return (
                      <FormField
                        key={field.name}
                        field={field}
                        form={form}
                        allFormValues={allFormValues}
                        currentStepConfig={currentStepConfig}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Display submission errors */}
          {submissionError && (
            <div className="custom-error bg-destructive/15 text-destructive rounded-md border border-destructive/30">
              <p className="font-medium !mb-0">
                Fehler beim Absenden: {submissionError}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  className="previous-button"
                  type="button"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                >
                  Zurück
                </Button>
              )}
              {currentStep === 0 && (
                <Button
                  className="reset-button bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                >
                  Formular zurücksetzen
                </Button>
              )}
            </div>
            <Button
              className="next-button"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Wird gesendet..."
                : isLastStep
                ? "Fertigstellen"
                : "Weiter"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MultiStepForm;
