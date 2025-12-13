import { useState } from 'react';

type FieldRules<TValues extends Record<string, unknown> = Record<string, unknown>> = {
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
  custom?: (value: unknown, values: TValues) => string | null | undefined;
};

type ValidationRules<TValues extends Record<string, unknown>> = Record<string, FieldRules<TValues>>;

export function useForm<T extends Record<string, unknown> = Record<string, unknown>>(
  initialValues: T,
  validationRules: ValidationRules<T> = {} as ValidationRules<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof T & string, value: unknown) => {
    setValues((prev) => ({ ...prev, [field]: value } as T));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field: keyof T & string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    Object.keys(validationRules).forEach((field) => {
      const rules = validationRules[field] as FieldRules<T>;
      const rawValue = (values as unknown as Record<string, unknown>)[field];
      const valueStr =
        typeof rawValue === 'string' ? rawValue : rawValue == null ? '' : String(rawValue);

      if (rules.required && valueStr.trim().length === 0) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
      } else if (rules.minLength && valueStr.length < rules.minLength) {
        newErrors[field] =
          rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && valueStr.length > rules.maxLength) {
        newErrors[field] =
          rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`;
      } else if (rules.pattern && !rules.pattern.test(valueStr)) {
        newErrors[field] = rules.patternMessage || 'Invalid format';
      } else if (rules.match) {
        const other = (values as unknown as Record<string, unknown>)[rules.match];
        const otherStr = typeof other === 'string' ? other : other == null ? '' : String(other);
        if (valueStr !== otherStr) newErrors[field] = rules.matchMessage || 'Values do not match';
      } else if (rules.custom) {
        const customError = rules.custom(rawValue, values);
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
    setErrors((prev) => ({ ...prev, [field]: message }));
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
    setErrors: setErrorsFn,
  } as const;
}
