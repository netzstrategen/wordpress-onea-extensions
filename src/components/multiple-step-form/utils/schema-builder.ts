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
          field.validation.message || "Invalid format"
        );
      }

      if (field.required) {
        schema = (schema as z.ZodString).min(1, `${field.label} is required`);
      } else {
        schema = schema.optional();
      }
      break;

    case "email":
      schema = z.string().email("Invalid email address");

      if (field.required) {
        schema = (schema as z.ZodString).min(1, `${field.label} is required`);
      } else {
        schema = schema.optional();
      }
      break;

    case "number":
      let numberSchema = z.number({
        message: `${field.label} must be a number`,
      });

      if (field.validation?.min !== undefined) {
        numberSchema = numberSchema.min(
          field.validation.min,
          field.validation.message || `Minimum value is ${field.validation.min}`
        );
      }

      if (field.validation?.max !== undefined) {
        numberSchema = numberSchema.max(
          field.validation.max,
          field.validation.message || `Maximum value is ${field.validation.max}`
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
          `Please select at least one option for ${field.label}`
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
            message: `${field.label} is required`,
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

  for (const group of step.fieldGroups) {
    for (const field of group.fields) {
      // Check if field should be included based on dependencies
      if (shouldIncludeField(field, allValues)) {
        shape[field.name] = buildFieldSchema(field);
      }
    }
  }

  return z.object(shape);
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
