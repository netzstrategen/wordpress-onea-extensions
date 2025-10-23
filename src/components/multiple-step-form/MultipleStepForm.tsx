import React from "react";

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}

interface FormStep {
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormConfig {
  title?: string;
  description?: string;
  steps?: FormStep[];
}

interface MultipleStepFormProps {
  componentId?: string;
  formConfig?: FormConfig;
}

const MultipleStepForm: React.FC<MultipleStepFormProps> = ({
  componentId,
  formConfig,
}) => {
  if (!formConfig) {
    return (
      <div className="onea-multiple-step-form">
        <p>No form configuration provided.</p>
      </div>
    );
  }

  return (
    <div className="onea-multiple-step-form" data-component-id={componentId}>
      <h2>{formConfig.title || "Form"}</h2>
      {formConfig.description && <p>{formConfig.description}</p>}

      <div className="form-steps">
        {formConfig.steps?.map((step, stepIndex) => (
          <div key={stepIndex} className="form-step">
            <h3>
              Step {stepIndex + 1}: {step.title}
            </h3>
            {step.description && <p>{step.description}</p>}

            <div className="form-fields">
              {step.fields.map((field, fieldIndex) => (
                <div key={fieldIndex} className="form-field">
                  <strong>{field.label}</strong>
                  {field.required && <span className="required"> *</span>}
                  <br />
                  <span className="field-info">
                    Name: {field.name} | Type: {field.type}
                    {field.placeholder && ` | Placeholder: "${field.placeholder}"`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="debug-info">
        <h4>Full Configuration:</h4>
        <pre>{JSON.stringify(formConfig, null, 2)}</pre>
      </div>
    </div>
  );
};

export default MultipleStepForm;
