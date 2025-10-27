import React from "react";
import type { FormStep } from "./types";

interface StepIndicatorProps {
  steps: FormStep[];
  currentStep: number;
  onStepClick: (stepIndex: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="step-indicator">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index < currentStep;

          return (
            <React.Fragment key={step.id}>
              <div
                className={`flex flex-col items-center flex-1 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => isClickable && onStepClick(index)}
              >
                {/* Step Number Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-colors duration-200
                    ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }
                  `}
                >
                  {isCompleted ? "✓" : index + 1}
                </div>

                {/* Step Title */}
                <div
                  className={`
                    text-xs mt-2 text-center
                    ${
                      isCurrent ? "font-semibold text-primary" : "text-gray-600"
                    }
                  `}
                >
                  {step.title}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 mt-5
                    transition-colors duration-200
                    ${isCompleted ? "bg-green-500" : "bg-gray-200"}
                  `}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
