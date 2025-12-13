/**
 * NameField Component
 * Name input field with Formik integration
 */

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function NameField(): React.ReactElement {
  return (
    <div className="mb-3">
      <label className="block font-semibold mb-1 text-sm text-primary-text">Name *</label>
      <Field
        name="name"
        maxLength={255}
        className="w-full px-3 py-2 bg-primary-bg border border-border rounded-md text-sm text-primary-text outline-none focus:border-accent transition-colors"
      />
      <ErrorMessage name="name" component="div" className="error" />
    </div>
  );
}
