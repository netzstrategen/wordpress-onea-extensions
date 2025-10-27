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
        const dataToSave = {
          values,
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

  return {
    loadSavedData,
    saveData,
  };
}
