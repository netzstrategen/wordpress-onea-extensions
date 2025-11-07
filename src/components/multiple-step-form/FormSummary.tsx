import React from "react";
import { Button } from "@/components/ui/button";
import type { FormValues, FormConfig } from "./types";
import { formatPeriodLabel } from "./utils/billing-periods";

interface FormSummaryProps {
  formValues: FormValues;
  config: FormConfig;
  onEdit: () => void;
}

export const FormSummary: React.FC<FormSummaryProps> = ({
  formValues,
  config,
  onEdit,
}) => {
  // Helper function to get select option label
  const getSelectLabel = (fieldName: string, value: any): string => {
    for (const step of config.steps) {
      for (const group of step.fieldGroups) {
        const field = group.fields.find((f) => f.name === fieldName);
        if (field && field.type === "select" && field.options) {
          const option = field.options.find((opt) => opt.value === value);
          return option?.label || value;
        }
      }
    }
    return value;
  };

  // Helper function to format value for display
  const formatValue = (fieldName: string, value: any): string => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }

    // Handle arrays (checkboxes)
    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      // Capitalize each item
      return value
        .map((v) => String(v).charAt(0).toUpperCase() + String(v).slice(1))
        .join(", ");
    }

    // Handle booleans
    if (typeof value === "boolean") {
      return value ? "Ja" : "Nein";
    }

    // Handle files
    if (value instanceof FileList) {
      const fileCount = value.length;
      if (fileCount === 0) return "-";
      const fileNames = Array.from(value)
        .map((f) => f.name)
        .join(", ");
      return fileNames;
    }

    if (value instanceof File) {
      return value.name;
    }

    // Get the field to check its type
    const field = config.steps
      .flatMap((s) => s.fieldGroups)
      .flatMap((g) => g.fields)
      .find((f) => f.name === fieldName);

    // Handle file type fields - check if it's a file object
    if (field?.type === "file") {
      if (typeof value === "object" && value !== null) {
        // Check for file metadata properties that persist through serialization
        if ("_fileName" in value && value._fileName) {
          return String(value._fileName);
        }
        // Handle serialized file object with name property
        if ("name" in value && value.name) {
          return String(value.name);
        }
        // Fallback for other object structures
        return "-";
      }
      return String(value);
    }

    // Handle billing period fields - format them to human-readable dates
    if (fieldName.startsWith("billingPeriod") && typeof value === "string") {
      const formatted = formatPeriodLabel(value);
      return formatted || value;
    }

    // Handle select fields - get the label and capitalize
    if (field?.type === "select") {
      const label = getSelectLabel(fieldName, value);
      return label.charAt(0).toUpperCase() + label.slice(1);
    }

    // Handle numbers - display as-is without formatting
    if (field?.type === "number" && typeof value === "number") {
      return String(value);
    }

    // Default: capitalize first letter
    const stringValue = String(value);
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
  };

  // Group values by step
  const stepSummaries = config.steps
    .filter((step) => step.id !== "summary") // Don't include summary step itself
    .map((step) => {
      const stepFields: Array<{ label: string; value: string }> = [];

      step.fieldGroups.forEach((group) => {
        group.fields.forEach((field) => {
          // Skip fields that have dependencies and aren't shown
          if (field.dependsOn) {
            const dependentValue = formValues[field.dependsOn.field];
            if (Array.isArray(field.dependsOn.value)) {
              if (!field.dependsOn.value.includes(dependentValue)) {
                return;
              }
            } else if (dependentValue !== field.dependsOn.value) {
              return;
            }
          }

          const value = formValues[field.name];
          if (value !== undefined && value !== "" && value !== null) {
            stepFields.push({
              label: field.label,
              value: formatValue(field.name, value),
            });
          }
        });
      });

      return {
        title: step.title,
        fields: stepFields,
      };
    });

  return (
    <div className="space-y-6">
      <div className="summary-subheading flex items-center justify-between">
        <p className="text-sm">
          Bitte überprüfen Sie Ihre Eingaben, bevor Sie das Formular absenden.
        </p>

        <Button
          type="button"
          onClick={onEdit}
          className="ml-4 summary-edit-button"
        >
          Bearbeiten
        </Button>
      </div>

      {stepSummaries.map((stepSummary, index) => (
        <div key={index} className="field-group">
          <h4 className="text-base font-semibold mb-4">{stepSummary.title}</h4>
          {stepSummary.fields.length > 0 ? (
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {stepSummary.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className="summary-field-wrapper border-b border-border"
                >
                  <dt className="text-sm font-medium text-muted-foreground">
                    {field.label}
                  </dt>
                  <dd className="text-sm font-semibold">{field.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">
              Keine Daten eingegeben
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
