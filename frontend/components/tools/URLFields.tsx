/**
 * URLFields Component
 * URL and documentation URL input fields in a grid layout
 */

import React from 'react';
import { Field, ErrorMessage } from 'formik';

export default function URLFields(): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block font-semibold mb-1 text-sm text-primary-text">Link</label>
        <Field
          name="url"
          type="url"
          placeholder="https://example.com"
          maxLength={500}
          className="w-full px-3 py-2 bg-primary-bg border border-border rounded-md text-sm text-primary-text outline-none focus:border-accent transition-colors"
        />
        <ErrorMessage name="url" component="div" className="error" />
      </div>
      <div>
        <label className="block font-semibold mb-1 text-sm text-primary-text">Documentation (link)</label>
        <Field
          name="docs_url"
          type="url"
          placeholder="https://docs.example.com"
          maxLength={500}
          className="w-full px-3 py-2 bg-primary-bg border border-border rounded-md text-sm text-primary-text outline-none focus:border-accent transition-colors"
        />
        <ErrorMessage name="docs_url" component="div" className="error" />
      </div>
    </div>
  );
}
