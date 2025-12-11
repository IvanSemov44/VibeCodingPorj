/**
 * URLFields Component
 * URL and documentation URL input fields in a grid layout
 */

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function URLFields(): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      <div>
        <label style={{ display: 'block', fontWeight: 600 }}>Link</label>
        <Field
          name="url"
          type="url"
          placeholder="https://example.com"
          maxLength={500}
          style={{ width: '100%', padding: 8 }}
        />
        <ErrorMessage name="url" component="div" className="error" />
      </div>
      <div>
        <label style={{ display: 'block', fontWeight: 600 }}>Documentation (link)</label>
        <Field
          name="docs_url"
          type="url"
          placeholder="https://docs.example.com"
          maxLength={500}
          style={{ width: '100%', padding: 8 }}
        />
        <ErrorMessage name="docs_url" component="div" className="error" />
      </div>
    </div>
  );
}
