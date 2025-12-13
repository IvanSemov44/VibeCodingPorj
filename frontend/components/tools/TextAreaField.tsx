/**
 * TextAreaField Component
 * Reusable textarea field with character counter and Formik integration
 */

import React from 'react';
import { Field, ErrorMessage } from 'formik';

interface TextAreaFieldProps {
  name: string;
  label: string;
  maxLength: number;
  rows: number;
  value: string;
  optional?: boolean;
}

export default function TextAreaField({
  name,
  label,
  maxLength,
  rows,
  value,
  optional = false,
}: TextAreaFieldProps): React.ReactElement {
  return (
    <div className="mt-3">
      <label className="block font-semibold mb-1 text-sm text-primary-text">
        {label} {optional && '(optional)'}
      </label>
      <Field
        as="textarea"
        name={name}
        maxLength={maxLength}
        rows={rows}
        className="w-full px-3 py-2 bg-primary-bg border border-border rounded-md text-sm text-primary-text outline-none focus:border-accent transition-colors resize-y font-[inherit]"
      />
      <div className="text-xs text-gray-500 mt-1 text-right">
        {(value || '').length}/{maxLength}
      </div>
      <ErrorMessage name={name} component="div" className="error" />
    </div>
  );
}
