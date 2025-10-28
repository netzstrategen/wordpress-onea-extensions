/**
 * Dynamically generate Zod schemas from form field configurations
 */
import { z } from "zod";
import type { FormField, FormStep, FormValues } from "../types";

/**
 * Build a Zod schema for a single field based on its configuration
 */
export function buildFieldSchema(field: FormField): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  switch (field.type) {
    case "text":
      schema = z.string();

      if (field.validation?.pattern) {
        schema = (schema as z.ZodString).regex(
          new RegExp(field.validation.pattern),
          field.validation.message || "Ungültiges Format"
        );
      }

      if (field.required) {
        schema = (schema as z.ZodString).min(
          1,
          `${field.label} ist erforderlich`
        );
      } else {
        schema = schema.optional();
      }
      break;

    case "email":
      schema = z.string().email("Ungültige E-Mail-Adresse");

      if (field.required) {
        schema = (schema as z.ZodString).min(
          1,
          `${field.label} ist erforderlich`
        );
      } else {
        schema = schema.optional();
      }
      break;

    case "number":
      let numberSchema = z.number({
        message: `${field.label} muss eine Zahl sein`,
      });

      if (field.validation?.min !== undefined) {
        numberSchema = numberSchema.min(
          field.validation.min,
          field.validation.message || `Mindestwert ist ${field.validation.min}`
        );
      }

      if (field.validation?.max !== undefined) {
        numberSchema = numberSchema.max(
          field.validation.max,
          field.validation.message || `Maximalwert ist ${field.validation.max}`
        );
      }

      if (field.required) {
        schema = z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          return Number(val);
        }, numberSchema);
      } else {
        schema = z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          return Number(val);
        }, numberSchema.optional());
      }
      break;

    case "select":
    case "radio":
      if (field.type === "select" || field.type === "radio") {
        // Check if options exist (some fields like auto-calculated ones may not have options)
        if (field.options && Array.isArray(field.options)) {
          const validValues = field.options.map((opt) => opt.value);
          if (validValues.length > 0) {
            const enumSchema = z.enum(validValues as [string, ...string[]]);
            if (field.required) {
              schema = enumSchema;
            } else {
              schema = enumSchema.optional();
            }
          } else {
            schema = field.required ? z.string() : z.string().optional();
          }
        } else {
          // No options defined (e.g., auto-calculated fields)
          schema = field.required ? z.string() : z.string().optional();
        }
      } else {
        schema = z.string().optional();
      }
      break;

    case "checkbox":
      schema = z.array(z.string());

      if (field.required) {
        schema = (schema as z.ZodArray<z.ZodString>).min(
          1,
          `Bitte wählen Sie mindestens eine Option für ${field.label}`
        );
      } else {
        schema = schema.optional();
      }
      break;

    case "file":
      // For file inputs, we'll handle validation separately
      // as we're storing File objects or base64 strings
      if (field.required) {
        schema = z
          .any()
          .refine((val) => val !== null && val !== undefined && val !== "", {
            message: `${field.label} ist erforderlich`,
          });
      } else {
        schema = z.any().optional();
      }
      break;

    default:
      schema = z.string().optional();
      break;
  }

  return schema;
}

/**
 * Build a Zod schema for an entire step
 */
export function buildStepSchema(
  step: FormStep,
  allValues: FormValues = {}
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};
  const customValidations: Array<{
    field: FormField;
    validation: string;
  }> = [];

  for (const group of step.fieldGroups) {
    for (const field of group.fields) {
      // Check if field should be included based on dependencies
      if (shouldIncludeField(field, allValues)) {
        shape[field.name] = buildFieldSchema(field);

        // Collect custom validations that need access to other field values
        if (field.validation?.customValidation) {
          customValidations.push({
            field,
            validation: field.validation.customValidation,
          });
        }
      }
    }
  }

  let schema = z.object(shape);

  // Apply custom cross-field validations
  for (const { field, validation } of customValidations) {
    schema = schema.refine(
      (data) => {
        try {
          // Handle OR conditions (||)
          if (validation.includes("||")) {
            const conditions = validation.split("||").map((s) => s.trim());
            return conditions.some((condition) =>
              evaluateCondition(condition, data)
            );
          }

          // Handle AND conditions (&&)
          if (validation.includes("&&")) {
            const conditions = validation.split("&&").map((s) => s.trim());
            return conditions.every((condition) =>
              evaluateCondition(condition, data)
            );
          }

          // Handle single condition
          return evaluateCondition(validation, data);
        } catch (error) {
          console.error("Custom validation error:", error);
          return true;
        }
      },
      {
        message:
          field.validation?.validationMessage ||
          field.validation?.message ||
          `Validierung für ${field.label} fehlgeschlagen`,
        path: [field.name],
      }
    );
  }

  return schema;
}

/**
 * Evaluate a single condition (e.g., "field >= 5", "field <= otherField", "field !== value")
 */
function evaluateCondition(condition: string, data: any): boolean {
  // Handle >= operator
  if (condition.includes(">=")) {
    const [leftField, rightPart] = condition.split(">=").map((s) => s.trim());
    const leftValue = data[leftField];

    // Check if rightPart is a number or a field name
    const rightValue = isNaN(Number(rightPart))
      ? data[rightPart]
      : Number(rightPart);

    if (leftValue !== undefined && rightValue !== undefined) {
      return Number(leftValue) >= Number(rightValue);
    }
    return true; // Skip validation if values are not present
  }

  // Handle <= operator
  if (condition.includes("<=")) {
    const [leftField, rightPart] = condition.split("<=").map((s) => s.trim());
    const leftValue = data[leftField];

    const rightValue = isNaN(Number(rightPart))
      ? data[rightPart]
      : Number(rightPart);

    if (leftValue !== undefined && rightValue !== undefined) {
      return Number(leftValue) <= Number(rightValue);
    }
    return true;
  }

  // Handle !== operator
  if (condition.includes("!==")) {
    const [leftField, rightPart] = condition.split("!==").map((s) => s.trim());
    const leftValue = data[leftField];

    // Check if rightPart is a field name or a literal value
    const rightValue =
      data[rightPart] !== undefined ? data[rightPart] : rightPart;

    if (leftValue !== undefined && rightValue !== undefined) {
      return leftValue !== rightValue;
    }
    return true;
  }

  // Handle > operator
  if (condition.includes(">") && !condition.includes(">=")) {
    const [leftField, rightPart] = condition.split(">").map((s) => s.trim());
    const leftValue = data[leftField];

    const rightValue = isNaN(Number(rightPart))
      ? data[rightPart]
      : Number(rightPart);

    if (leftValue !== undefined && rightValue !== undefined) {
      return Number(leftValue) > Number(rightValue);
    }
    return true;
  }

  // Handle < operator
  if (condition.includes("<") && !condition.includes("<=")) {
    const [leftField, rightPart] = condition.split("<").map((s) => s.trim());
    const leftValue = data[leftField];

    const rightValue = isNaN(Number(rightPart))
      ? data[rightPart]
      : Number(rightPart);

    if (leftValue !== undefined && rightValue !== undefined) {
      return Number(leftValue) < Number(rightValue);
    }
    return true;
  }

  return true;
}

/**
 * Check if a field should be included based on its dependencies
 */
export function shouldIncludeField(
  field: FormField,
  values: FormValues
): boolean {
  if (!field.dependsOn) {
    return true;
  }

  const { field: dependencyField, value: dependencyValue } = field.dependsOn;
  const currentValue = values[dependencyField];

  if (Array.isArray(dependencyValue)) {
    return dependencyValue.includes(currentValue);
  }

  return currentValue === dependencyValue;
}

/**
 * Build a schema for the entire form (all steps combined)
 * Useful for final validation before submission
 */
export function buildFormSchema(
  steps: FormStep[],
  allValues: FormValues = {}
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const step of steps) {
    for (const group of step.fieldGroups) {
      for (const field of group.fields) {
        if (shouldIncludeField(field, allValues)) {
          shape[field.name] = buildFieldSchema(field);
        }
      }
    }
  }

  return z.object(shape);
}
