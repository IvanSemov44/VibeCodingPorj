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
  optional = false
}: TextAreaFieldProps): React.ReactElement {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>
        {label} {optional && '(optional)'}
      </label>
      <Field
        as="textarea"
        name={name}
        maxLength={maxLength}
        rows={rows}
        style={{ width: '100%', padding: 8 }}
      />
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
        {(value || '').length}/{maxLength}
      </div>
      <ErrorMessage name={name} component="div" className="error" />
    </div>
  );
}
