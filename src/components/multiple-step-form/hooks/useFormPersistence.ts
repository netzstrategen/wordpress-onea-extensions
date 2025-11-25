import { useCallback } from "react";
import type { FormValues } from "../types";

const STORAGE_PREFIX = "multi-step-form";

interface UseFormPersistenceOptions {
  formId: string;
  enabled?: boolean;
}

export function useFormPersistence({
  formId,
  enabled = true,
}: UseFormPersistenceOptions) {
  const storageKey = `${STORAGE_PREFIX}-${formId}`;

  const loadSavedData = useCallback((): {
    values: FormValues;
    currentStep: number;
  } | null => {
    if (!enabled) return null;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error("Failed to load form data from localStorage:", error);
    }
    return null;
  }, [storageKey, enabled]);

  const saveData = useCallback(
    (values: FormValues, currentStep: number) => {
      if (!enabled) return;

      try {
        // Filter out file objects and file metadata - they cannot be properly stored in localStorage
        const serializableValues: FormValues = {};
        for (const [key, value] of Object.entries(values)) {
          // Skip File objects and file metadata
          if (value instanceof File || value instanceof FileList) {
            continue;
          }
          // Skip objects that look like file metadata from localStorage
          if (value && typeof value === "object" && "_isFile" in value) {
            continue;
          }
          serializableValues[key] = value;
        }

        const dataToSave = {
          values: serializableValues,
          currentStep,
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Failed to save form data to localStorage:", error);
      }
    },
    [storageKey, enabled]
  );

  const clearData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear form data from localStorage:", error);
    }
  }, [storageKey]);

  return {
    loadSavedData,
    saveData,
    clearData,
  };
}
