import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import type { MultiStepFormProps, FormValues, FormConfig } from "./types";
import { buildStepSchema, shouldIncludeField } from "./utils/schema-builder";
import { useFormPersistence } from "./hooks/useFormPersistence";
import { StepIndicator } from "./StepIndicator";
import { FormField } from "./FormField";
import {
  generateBillingPeriodOptions,
  calculatePreviousPeriod,
} from "./utils/billing-periods";

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  formConfig,
  componentId,
}) => {
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
  }, [billingPeriodOptions]);

  const [currentStep, setCurrentStep] = useState(0);
  const [allFormValues, setAllFormValues] = useState<FormValues>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Use ref to track latest form values without causing re-renders
  const allFormValuesRef = useRef<FormValues>({});

  // Keep ref in sync with state
  useEffect(() => {
    allFormValuesRef.current = allFormValues;
  }, [allFormValues]);

  const { loadSavedData, saveData } = useFormPersistence({
    formId: config.formId,
  });

  // Load saved data before initializing form
  const initialData = useMemo(() => {
    const savedData = loadSavedData();
    if (savedData) {
      return {
        values: savedData.values,
        step: savedData.currentStep,
      };
    }
    return { values: {}, step: 0 };
  }, []);

  // Initialize state with loaded data
  useEffect(() => {
    if (initialData.step > 0 || Object.keys(initialData.values).length > 0) {
      setAllFormValues(initialData.values);
      setCurrentStep(initialData.step);
    }
    setIsInitialized(true);
  }, []);

  const currentStepConfig = config.steps[currentStep];
  const isLastStep = currentStep === config.steps.length - 1;

  // Build schema for current step based on all form values
  const stepSchema = buildStepSchema(currentStepConfig, allFormValues);

  // Initialize form with react-hook-form using initial data
  const form = useForm<any>({
    resolver: zodResolver(stepSchema as any),
    defaultValues: initialData.values,
    mode: "onChange",
  });

  // Single watch subscription to handle all form changes
  useEffect(() => {
    if (!isInitialized) return;

    const subscription = form.watch((values, { name, type }) => {
      // Skip if this is a setValue operation (type will be undefined for programmatic changes)
      if (type !== "change") return;

      // Use ref to get current values without dependency
      let updatedValues = { ...allFormValuesRef.current };
      let needsUpdate = false;

      // Handle billing period auto-calculation
      if (name === "billingPeriod1" && values.billingPeriod1) {
        const period1Value = values.billingPeriod1;
        const period2Value = calculatePreviousPeriod(period1Value, 1);
        const period3Value = calculatePreviousPeriod(period1Value, 2);

        form.setValue("billingPeriod2", period2Value, {
          shouldValidate: false,
          shouldDirty: false,
        });
        form.setValue("billingPeriod3", period3Value, {
          shouldValidate: false,
          shouldDirty: false,
        });

        updatedValues = {
          ...updatedValues,
          billingPeriod1: period1Value,
          billingPeriod2: period2Value,
          billingPeriod3: period3Value,
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
        }

        if (unitsValue !== undefined) {
          form.setValue("numberOfUnits", unitsValue, {
            shouldValidate: true,
            shouldDirty: false,
          });

          updatedValues = {
            ...updatedValues,
            buildingType: buildingType,
            numberOfUnits: unitsValue,
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
      if (needsUpdate) {
        setAllFormValues(updatedValues);
        saveData(updatedValues, currentStep);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, saveData, isInitialized, currentStep]);

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
      saveData(updatedValues, currentStep);
    }
  });

  // Handle previous step
  const handlePrevious = () => {
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
  };

  return (
    <div className="onea-multiple-step-form" data-component-id={componentId}>
      <div className="form-header mb-8">
        <h2 className="text-2xl font-bold">{config.title}</h2>
      </div>
      <StepIndicator
        steps={config.steps}
        currentStep={currentStep}
        onStepClick={(stepIndex) => {
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
        }}
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
                    if (!shouldIncludeField(field, allFormValues)) {
                      return null;
                    }
                    return (
                      <FormField
                        key={field.name}
                        field={field}
                        form={form}
                        allFormValues={allFormValues}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Display step-level validation errors */}
          {form.formState.errors._stepValidation && (
            <div className="custom-error bg-destructive/15 text-destructive rounded-md border border-destructive/30">
              <p className="font-medium !mb-0">
                {form.formState.errors._stepValidation.message as string}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6">
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button type="button" onClick={handlePrevious}>
                  Zurück
                </Button>
              )}
            </div>
            <Button type="submit">
              {isLastStep ? "Fertigstellen" : "Weiter"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MultiStepForm;
