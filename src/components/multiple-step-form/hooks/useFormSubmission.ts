import { useState, useCallback } from "react";
import type { FormValues, FormConfig, FormSubmissionResponse } from "../types";

interface UseFormSubmissionProps {
  config: FormConfig;
  productId?: string;
  nonce?: string;
}

interface SubmitFormDataParams {
  formValues: FormValues;
}

/**
 * Hook to handle form submission to WordPress REST API
 */
export function useFormSubmission({
  config,
  productId,
  nonce,
}: UseFormSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Build FormData object with all form values including files
   */
  const buildFormData = useCallback(
    (formValues: FormValues): FormData => {
      const formData = new FormData();

      // Add basic form metadata
      formData.append("form_id", config.formId);
      if (productId) {
        formData.append("product_id", productId);
      }

      // Process each field and add to FormData
      config.steps.forEach((step) => {
        step.fieldGroups.forEach((group) => {
          group.fields.forEach((field) => {
            const value = formValues[field.name];

            if (value === undefined || value === null || value === "") {
              return;
            }

            // Handle file uploads separately
            if (field.type === "file") {
              if (value instanceof FileList) {
                // Multiple files
                Array.from(value).forEach((file, index) => {
                  formData.append(`files[${field.name}][${index}]`, file);
                });
              } else if (value instanceof File) {
                // Single file
                formData.append(`files[${field.name}]`, value);
              }
              // Add file field metadata
              formData.append(
                `fields[${field.name}]`,
                JSON.stringify({ label: field.label, type: "file" })
              );
            }
            // Handle regular fields with value and label
            else {
              const fieldData = {
                value: Array.isArray(value) ? value : String(value),
                label: field.label,
              };
              formData.append(
                `fields[${field.name}]`,
                JSON.stringify(fieldData)
              );
            }
          });
        });
      });

      return formData;
    },
    [config, productId]
  );

  /**
   * Submit form data to WordPress REST API
   */
  const submitFormData = useCallback(
    async ({
      formValues,
    }: SubmitFormDataParams): Promise<FormSubmissionResponse> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const formData = buildFormData(formValues);

        // Get WordPress REST API URL from global
        const restUrl = (window as any).wpApiSettings?.root || "/wp-json/";
        const endpoint = `${restUrl}onea/v1/form-submission`;

        // Make request with nonce
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "X-WP-Nonce": nonce || "",
          },
          body: formData,
          credentials: "same-origin",
        });

        // Parse response
        const data: FormSubmissionResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Form submission failed");
        }

        setIsSubmitting(false);
        return data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        setIsSubmitting(false);

        return {
          success: false,
          message: errorMessage,
        };
      }
    },
    [buildFormData, nonce]
  );

  return {
    submitFormData,
    isSubmitting,
    error,
  };
}
