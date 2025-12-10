import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { createTool, getCsrf, uploadToolScreenshots, updateTool, deleteToolScreenshot } from '../lib/api';
import TagMultiSelect from './TagMultiSelect';
import type { Category, Tag, Tool, ToolCreatePayload, ToolUpdatePayload } from '../lib/types';
import { ToolCreatePayloadSchema } from '../lib/schemas';
import { zodToFormikValidate } from '../lib/formikZod';

type Role = { id: number; name: string };


type InitialTool = Partial<Tool> & {
  categories?: Category[];
  roles?: Role[];
  tags?: Tag[];
  screenshots?: string[];
};

type ToolFormProps = {
  categories?: Category[];
  roles?: Role[];
  tags?: Tag[];
  allTags?: string[] | null;
  onSaved?: (tool: Tool) => void;
  initial?: InitialTool | null;
};

export default function ToolForm({ categories = [], roles = [], allTags = null, onSaved, initial = null }: ToolFormProps): React.ReactElement {
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [, setInitialScreenshots] = useState<string[]>([]);
  // Narrow unknown error to an object with numeric `status` field
  const hasStatus = (e: unknown): e is { status: number } => {
    if (typeof e !== 'object' || e === null) return false;
    const maybe = e as Record<string, unknown>;
    return 'status' in maybe && typeof maybe.status === 'number';
  };

  useEffect(() => {
    (async () => {
      try { await getCsrf(); } catch { /* ignore */ }
    })();
  }, []);

  // Formik will manage state; helper to toggle arrays via setFieldValue passed into render

  // validation will be handled by Zod via zodToFormikValidate when using Formik

  // We'll submit via Formik's onSubmit below

  // Screenshot delete handled inline inside Formik render using values and setFieldValue

  const initialValues: ToolCreatePayload = {
    name: initial?.name || '',
    url: (typeof initial?.url === 'string' ? initial?.url : '') || undefined,
    docs_url: (typeof initial?.docs_url === 'string' ? initial?.docs_url : '') || undefined,
    description: (typeof initial?.description === 'string' ? initial?.description : '') || undefined,
    usage: (typeof initial?.usage === 'string' ? initial?.usage : '') || undefined,
    examples: (typeof initial?.examples === 'string' ? initial?.examples : '') || undefined,
    difficulty: (typeof initial?.difficulty === 'string' ? initial?.difficulty : undefined),
    categories: (initial?.categories || []).map((c: Category) => c.id),
    roles: (initial?.roles || []).map((r: Role) => r.id),
    tags: (initial?.tags || []).map((t: Tag) => t.name),
    screenshots: initial?.screenshots || [],
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(ToolCreatePayloadSchema)}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setError('');
          setSaving(true);
          try {
            let data: Tool;
            if (initial && initial.id) {
              data = await updateTool(initial.id as number, values as ToolUpdatePayload);
            } else {
              data = await createTool(values as unknown as ToolCreatePayload);
            }

            const files = fileRef.current?.files && fileRef.current.files.length > 0 ? fileRef.current.files : null;
            if (files && files.length > 0) {
              await uploadToolScreenshots(data.id, Array.from(files));
            }
            if (onSaved) onSaved(data);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err || 'Failed to save');
            setError(message);
            // try to map to form fields if possible
            setErrors({ name: message } as unknown as Record<string, string>);
          } finally {
            setSaving(false);
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Name *</label>
              <Field name="name" maxLength={255} style={{ width: '100%', padding: 8 }} />
              <ErrorMessage name="name" component="div" className="error" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600 }}>Link</label>
                <Field name="url" type="url" placeholder="https://example.com" maxLength={500} style={{ width: '100%', padding: 8 }} />
                <ErrorMessage name="url" component="div" className="error" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600 }}>Documentation (link)</label>
                <Field name="docs_url" type="url" placeholder="https://docs.example.com" maxLength={500} style={{ width: '100%', padding: 8 }} />
                <ErrorMessage name="docs_url" component="div" className="error" />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Description</label>
              <Field as="textarea" name="description" maxLength={2000} rows={4} style={{ width: '100%', padding: 8 }} />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(values.description || '').length}/2000</div>
              <ErrorMessage name="description" component="div" className="error" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Usage</label>
              <Field as="textarea" name="usage" maxLength={5000} rows={3} style={{ width: '100%', padding: 8 }} />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(values.usage || '').length}/5000</div>
              <ErrorMessage name="usage" component="div" className="error" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Examples (optional)</label>
              <Field as="textarea" name="examples" maxLength={5000} rows={2} style={{ width: '100%', padding: 8 }} />
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(values.examples || '').length}/5000</div>
              <ErrorMessage name="examples" component="div" className="error" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Roles</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {roles.map(r => (
                  <button key={r.id} type="button" onClick={() => setFieldValue('roles', (values.roles || []).includes(r.id) ? (values.roles || []).filter((x: number) => x !== r.id) : [...(values.roles || []), r.id])} style={{ padding: '6px 10px', background: (values.roles || []).includes(r.id) ? '#2563eb' : '#f3f4f6', color: (values.roles || []).includes(r.id) ? 'white' : 'inherit', borderRadius: 6 }}>{r.name}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Categories *</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => setFieldValue('categories', (values.categories || []).includes(c.id) ? (values.categories || []).filter((x: number) => x !== c.id) : [...(values.categories || []), c.id])} style={{ padding: '6px 10px', background: (values.categories || []).includes(c.id) ? '#059669' : '#f3f4f6', color: (values.categories || []).includes(c.id) ? 'white' : 'inherit', borderRadius: 6 }}>{c.name}</button>
                ))}
              </div>
              <ErrorMessage name="categories" component="div" className="error" />
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ marginTop: 8 }}>
                <TagMultiSelect
                  value={values.tags}
                  onChange={(newTags: string[]) => setFieldValue('tags', newTags)}
                  allowCreate={true}
                  placeholder="Add tags..."
                  options={allTags}
                />
              </div>
              <ErrorMessage name="tags" component="div" className="error" />
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', fontWeight: 600 }}>Screenshots (optional) {(values.screenshots || []).length > 0 && `(${(values.screenshots || []).length}/10)`}</label>
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ marginTop: 8 }} />
              <ErrorMessage name="screenshots" component="div" className="error" />

              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <input value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Image URL" style={{ flex: 1, padding: 8 }} />
                <button type="button" onClick={() => {
                  const url = (screenshotUrl || '').trim();
                  if (!url) return;
                  try { new URL(url); } catch { alert('Please enter a valid URL'); return; }
                  const newScreenshots = [...(values.screenshots || []), url];
                  setFieldValue('screenshots', newScreenshots);
                  setScreenshotUrl('');
                }} style={{ padding: '8px 10px' }}>Add</button>
              </div>

              {(values.screenshots || []).length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  {(values.screenshots || []).map((s: string) => (
                    <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Image src={s} alt="screenshot" width={120} height={80} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                      <button type="button" onClick={async () => {
                        const id = initial?.id;
                        if (!id) {
                          setFieldValue('screenshots', (values.screenshots || []).filter((x: string) => x !== s));
                          return;
                        }
                        if (!confirm('Delete this screenshot?')) return;
                        setDeleting(true);
                        try {
                          const body = await deleteToolScreenshot(id as number, s);
                          const updated = body?.screenshots || (values.screenshots || []).filter((x: string) => x !== s);
                          setFieldValue('screenshots', updated);
                          setInitialScreenshots((prev) => (prev || []).filter(x => x !== s));
                        } catch (err: unknown) {
                          if (hasStatus(err) && err.status === 401) {
                            try {
                              await getCsrf();
                              const body2 = await deleteToolScreenshot(id as number, s);
                              const updated2 = body2?.screenshots || (values.screenshots || []).filter((x: string) => x !== s);
                              setFieldValue('screenshots', updated2);
                              setInitialScreenshots((prev) => (prev || []).filter(x => x !== s));
                            } catch (err2: unknown) {
                              console.error('Retry delete after CSRF refresh failed', err2);
                              alert('Failed to delete screenshot (unauthenticated). Please sign in and try again.');
                            }
                          } else {
                            console.error('Delete screenshot error', err);
                            alert((err instanceof Error && err.message) ? err.message : 'Failed to delete screenshot');
                          }
                        } finally {
                          setDeleting(false);
                        }
                      }} disabled={deleting} style={{ marginTop: 6 }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <button type="submit" disabled={saving || isSubmitting} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', borderRadius: 6 }}>{saving || isSubmitting ? 'Saving...' : 'Save Tool'}</button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
