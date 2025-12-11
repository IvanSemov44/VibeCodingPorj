/**
 * NameField Component
 * Name input field with Formik integration
 */

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function NameField(): React.ReactElement {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>Name *</label>
      <Field name="name" maxLength={255} style={{ width: '100%', padding: 8 }} />
      <ErrorMessage name="name" component="div" className="error" />
    </div>
  );
}
