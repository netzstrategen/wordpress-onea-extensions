/**
 * Type definitions for the multi-step form
 */

export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldDependency {
  field: string;
  value: string | string[];
}

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  message?: string;
  customValidation?: string;
  validationMessage?: string;
}

export interface BaseField {
  name: string;
  type: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  validation?: FieldValidation;
  dependsOn?: FieldDependency;
}

export interface TextField extends BaseField {
  type: "text" | "email";
}

export interface NumberField extends BaseField {
  type: "number";
}

export interface SelectField extends BaseField {
  type: "select";
  options: FieldOption[];
}

export interface RadioField extends BaseField {
  type: "radio";
  options: FieldOption[];
}

export interface CheckboxField extends BaseField {
  type: "checkbox";
  options: FieldOption[];
}

export interface FileField extends BaseField {
  type: "file";
  accept?: string;
}

export type FormField =
  | TextField
  | NumberField
  | SelectField
  | RadioField
  | CheckboxField
  | FileField;

export interface FieldGroup {
  title?: string;
  description?: string;
  fields: FormField[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fieldGroups: FieldGroup[];
}

export interface FormConfig {
  formId: string;
  title: string;
  description?: string;
  steps: FormStep[];
}

export interface MultiStepFormProps {
  formConfig: FormConfig;
  componentId?: string;
}

export type FormValues = Record<string, any>;
