import { useState } from 'react';

/**
 * Custom hook for form state management and validation
 * @param {Object} initialValues - Initial form field values
 * @param {Object} [validationRules={}] - Validation rules for each field
 * @param {boolean} [validationRules.field.required] - Field is required
 * @param {string} [validationRules.field.requiredMessage] - Custom required error message
 * @param {number} [validationRules.field.minLength] - Minimum length
 * @param {string} [validationRules.field.minLengthMessage] - Custom min length error
 * @param {number} [validationRules.field.maxLength] - Maximum length
 * @param {string} [validationRules.field.maxLengthMessage] - Custom max length error
 * @param {RegExp} [validationRules.field.pattern] - Regex pattern to match
 * @param {string} [validationRules.field.patternMessage] - Custom pattern error
 * @param {string} [validationRules.field.match] - Field name to match against
 * @param {string} [validationRules.field.matchMessage] - Custom match error
 * @param {Function} [validationRules.field.custom] - Custom validation function
 * @returns {Object} Form state and handlers
 * @returns {Object} return.values - Current form values
 * @returns {Object} return.errors - Validation errors
 * @returns {Object} return.touched - Touched field states
 * @returns {Function} return.handleChange - Change handler (field, value)
 * @returns {Function} return.handleBlur - Blur handler (field)
 * @returns {Function} return.validate - Validate all fields, returns boolean
 * @returns {Function} return.reset - Reset form to initial state
 * @returns {Function} return.setFieldError - Set error for specific field
 * @returns {Function} return.setErrors - Set multiple errors at once
 * @example
 * const { values, errors, handleChange, validate } = useForm(
 *   { email: '', password: '' },
 *   {
 *     email: {
 *       required: true,
 *       pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
 *       patternMessage: 'Invalid email format'
 *     },
 *     password: {
 *       required: true,
 *       minLength: 8
 *     }
 *   }
 * );
 */
export function useForm(initialValues, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = values[field];

      if (rules.required && !value?.trim()) {
        newErrors[field] = rules.requiredMessage || `${field} is required`;
      } else if (rules.minLength && value?.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
      } else if (rules.maxLength && value?.length > rules.maxLength) {
        newErrors[field] = rules.maxLengthMessage || `Must be no more than ${rules.maxLength} characters`;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || 'Invalid format';
      } else if (rules.match && value !== values[rules.match]) {
        newErrors[field] = rules.matchMessage || 'Values do not match';
      } else if (rules.custom) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
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

  const setFieldError = (field, message) => {
    setErrors(prev => ({ ...prev, [field]: message }));
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
    setErrors
  };
}
