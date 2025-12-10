import { useState } from 'react';

type FieldRules = {
  required?: boolean;
  requiredMessage?: string;
  minLength?: number;
  minLengthMessage?: string;
  maxLength?: number;
  maxLengthMessage?: string;
  pattern?: RegExp;
  patternMessage?: string;
  match?: string;
  matchMessage?: string;
  custom?: (value: any, values: any) => string | null | undefined;
};

type ValidationRules = Record<string, FieldRules>;

export function useForm<T extends Record<string, any> = Record<string, any>>(initialValues: T, validationRules: ValidationRules = {}) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof T & string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value } as T));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field: keyof T & string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = (values as any)[field];

      if (rules.required && !value?.trim?.()) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
      } else if (rules.minLength && value?.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && value?.length > rules.maxLength) {
        newErrors[field] = rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || 'Invalid format';
      } else if (rules.match && value !== (values as any)[rules.match]) {
        newErrors[field] = rules.matchMessage || 'Values do not match';
      } else if (rules.custom) {
        const customError = rules.custom(value, values);
        if (customError) newErrors[field] = customError;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const setFieldError = (field: keyof T & string, message: string) => {
    setErrors(prev => ({ ...prev, [field]: message }));
  };

  const setErrorsFn = (next: Record<string, string>) => {
    setErrors(next);
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setFieldError,
    setErrors: setErrorsFn
  } as const;
}
