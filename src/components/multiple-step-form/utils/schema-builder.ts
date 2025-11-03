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

      // Add date validation for dateNotInPast
      if (field.validation?.dateNotInPast) {
        schema = (schema as z.ZodString).refine(
          (val) => {
            if (!val) return true; // Skip if empty (handled by required)
            try {
              // Parse DD.MM.YYYY format
              const parts = val.split(".");
              if (parts.length !== 3) return true; // Invalid format, let pattern handle it
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
              const year = parseInt(parts[2], 10);

              const inputDate = new Date(year, month, day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              return inputDate >= today;
            } catch {
              return true; // If parsing fails, let pattern validation handle it
            }
          },
          {
            message:
              field.validation.dateNotInPastMessage ||
              "Das Datum darf nicht in der Vergangenheit liegen",
          }
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
      // Create a more lenient number schema that allows undefined during typing
      let numberSchema = z.number();

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

      // Use z.union to allow undefined during typing, but validate when value is present
      if (field.required) {
        schema = z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.union([z.undefined(), numberSchema]));
      } else {
        schema = z.preprocess((val) => {
          if (val === "" || val === null || val === undefined) return undefined;
          const num = Number(val);
          return isNaN(num) ? undefined : num;
        }, z.union([z.undefined(), numberSchema]).optional());
      }
      break;

    case "select":
    case "radio":
      if (field.type === "select" || field.type === "radio") {
        // Check if options exist (some fields like auto-calculated ones may not have options)
        if (field.options && Array.isArray(field.options)) {
          const validValues = field.options.map((opt) => opt.value);
          if (validValues.length > 0) {
            const enumSchema = z.enum(validValues as [string, ...string[]], {
              message: "Bitte Eingabe kontrollieren",
            });
            if (field.required) {
              schema = enumSchema;
            } else {
              schema = enumSchema.optional();
            }
          } else {
            schema = field.required
              ? z.string({ message: "Bitte Eingabe kontrollieren" })
              : z.string().optional();
          }
        } else {
          // No options defined (e.g., auto-calculated fields)
          schema = field.required
            ? z.string({ message: "Bitte Eingabe kontrollieren" })
            : z.string().optional();
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
  const customValidationRules: Array<{
    field: FormField;
    rules: Array<{ condition: string; message: string }>;
  }> = [];

  // Collect all fields from the step for nested dependency checking
  const allFields: FormField[] = [];
  for (const group of step.fieldGroups) {
    allFields.push(...group.fields);
  }

  for (const group of step.fieldGroups) {
    for (const field of group.fields) {
      // Check if field should be included based on dependencies
      if (shouldIncludeField(field, allValues, allFields)) {
        shape[field.name] = buildFieldSchema(field);

        // Collect custom validation rules (array-based structure)
        if (
          field.validation?.customValidations &&
          Array.isArray(field.validation.customValidations)
        ) {
          customValidationRules.push({
            field,
            rules: field.validation.customValidations,
          });
        }
      }
    }
  }

  let schema = z.object(shape);

  // Apply field-level custom validation rules
  for (const { field, rules } of customValidationRules) {
    for (const rule of rules) {
      schema = schema.refine(
        (data) => {
          try {
            // Merge allValues with current step data to access fields from other steps
            const completeData = { ...allValues, ...data };
            const condition = rule.condition.trim();
            const result = evaluateComplexCondition(condition, completeData);
            return result;
          } catch (error) {
            console.error("Custom validation error:", error);
            return true;
          }
        },
        {
          message: rule.message,
          path: [field.name],
        }
      );
    }
  }

  return schema;
}

/**
 * Evaluate complex conditions with proper parentheses handling
 */
function evaluateComplexCondition(condition: string, data: any): boolean {
  condition = condition.trim();

  // Find top-level OR operators (not inside parentheses)
  const orParts = splitByTopLevelOperator(condition, "||");
  if (orParts.length > 1) {
    const result = orParts.some((part) => {
      const partResult = evaluateComplexCondition(part, data);
      return partResult;
    });
    return result;
  }

  // Find top-level AND operators (not inside parentheses)
  const andParts = splitByTopLevelOperator(condition, "&&");
  if (andParts.length > 1) {
    const result = andParts.every((part) => {
      const partResult = evaluateComplexCondition(part, data);
      return partResult;
    });
    return result;
  }

  // Remove outer parentheses if present
  if (condition.startsWith("(") && condition.endsWith(")")) {
    return evaluateComplexCondition(condition.slice(1, -1), data);
  }

  // Single condition - evaluate it
  return evaluateCondition(condition, data);
}

/**
 * Split a condition string by a top-level operator (not inside parentheses)
 */
function splitByTopLevelOperator(
  condition: string,
  operator: string
): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let i = 0;

  while (i < condition.length) {
    const char = condition[i];

    if (char === "(") {
      depth++;
      current += char;
      i++;
    } else if (char === ")") {
      depth--;
      current += char;
      i++;
    } else if (
      depth === 0 &&
      condition.slice(i, i + operator.length) === operator
    ) {
      // Found top-level operator
      parts.push(current.trim());
      current = "";
      i += operator.length;
    } else {
      current += char;
      i++;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts.length > 0 ? parts : [condition];
}

/**
 * Evaluate a single condition (e.g., "field >= 5", "field <= otherField", "field !== value")
 */
function evaluateCondition(condition: string, data: any): boolean {
  // Handle === operator (must come before !==)
  if (condition.includes("===")) {
    const [leftField, rightPart] = condition.split("===").map((s) => s.trim());
    const leftValue = data[leftField];

    // Remove quotes from string literals
    const rightValue =
      rightPart.startsWith("'") || rightPart.startsWith('"')
        ? rightPart.slice(1, -1)
        : data[rightPart] !== undefined
        ? data[rightPart]
        : rightPart;

    if (leftValue !== undefined && rightValue !== undefined) {
      return leftValue === rightValue;
    }
    return true;
  }

  // Handle !== operator
  if (condition.includes("!==")) {
    const [leftField, rightPart] = condition.split("!==").map((s) => s.trim());
    const leftValue = data[leftField];

    // Remove quotes from string literals
    const rightValue =
      rightPart.startsWith("'") || rightPart.startsWith('"')
        ? rightPart.slice(1, -1)
        : data[rightPart] !== undefined
        ? data[rightPart]
        : rightPart;

    if (leftValue !== undefined && rightValue !== undefined) {
      return leftValue !== rightValue;
    }
    return true;
  }

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
 * This function recursively checks if dependency fields are themselves visible
 */
export function shouldIncludeField(
  field: FormField,
  values: FormValues,
  allFields?: FormField[]
): boolean {
  if (!field.dependsOn) {
    return true;
  }

  const {
    field: dependencyField,
    value: dependencyValue,
    contains,
  } = field.dependsOn;
  const currentValue = values[dependencyField];

  // Check if the current field's dependency is met
  let isDependencyMet = false;

  // Handle 'contains' check for array values (e.g., checkbox fields)
  if (contains !== undefined) {
    if (Array.isArray(currentValue)) {
      isDependencyMet = currentValue.includes(contains);
    } else {
      isDependencyMet = false;
    }
  }
  // Handle normal value check
  else if (dependencyValue !== undefined) {
    if (Array.isArray(dependencyValue)) {
      isDependencyMet = dependencyValue.includes(currentValue);
    } else {
      isDependencyMet = currentValue === dependencyValue;
    }
  }

  // If the dependency is not met, the field should not be included
  if (!isDependencyMet) {
    return false;
  }

  // If allFields is provided, recursively check if the dependency field itself is visible
  if (allFields) {
    const dependencyFieldConfig = allFields.find(
      (f) => f.name === dependencyField
    );
    if (dependencyFieldConfig && dependencyFieldConfig.dependsOn) {
      // Recursively check if the dependency field is visible
      return shouldIncludeField(dependencyFieldConfig, values, allFields);
    }
  }

  return true;
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

  // Collect all fields from all steps for nested dependency checking
  const allFields: FormField[] = [];
  for (const step of steps) {
    for (const group of step.fieldGroups) {
      allFields.push(...group.fields);
    }
  }

  for (const step of steps) {
    for (const group of step.fieldGroups) {
      for (const field of group.fields) {
        if (shouldIncludeField(field, allValues, allFields)) {
          shape[field.name] = buildFieldSchema(field);
        }
      }
    }
  }

  return z.object(shape);
}

/**
 * Extract default values from form configuration
 * Returns an object with field names as keys and their default values
 */
export function extractDefaultValues(steps: FormStep[]): FormValues {
  const defaultValues: FormValues = {};

  for (const step of steps) {
    for (const group of step.fieldGroups) {
      for (const field of group.fields) {
        if (field.defaultValue !== undefined) {
          defaultValues[field.name] = field.defaultValue;
        }
      }
    }
  }

  return defaultValues;
}
