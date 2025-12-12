/**
 * ToolForm Component
 * Main form for creating and editing tools
 * Refactored to use sub-components for better organization
 */

import React, { useEffect, useRef, useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { createTool, getCsrf, uploadToolScreenshots, updateTool } from '../lib/api';
import { useToast } from './Toast';
import TagMultiSelect from './TagMultiSelect';
import NameField from './tools/NameField';
import URLFields from './tools/URLFields';
import TextAreaField from './tools/TextAreaField';
import RoleSelector from './tools/RoleSelector';
import CategorySelector from './tools/CategorySelector';
import ScreenshotManager from './tools/ScreenshotManager';
import type { Category, Tag, Tool, ToolCreatePayload, ToolUpdatePayload } from '../lib/types';
import { ToolCreatePayloadSchema } from '../lib/schemas';
import { zodToFormikValidate } from '../lib/formikZod';
import styles from './ToolForm.module.css';
import { cx } from '../lib/classNames';

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

export default function ToolForm({
  categories = [],
  roles = [],
  allTags = null,
  onSaved,
  initial = null
}: ToolFormProps): React.ReactElement {
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        await getCsrf();
      } catch {
        /* ignore */
      }
    })();
  }, []);

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
    <div className={styles.wrapper}>
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(ToolCreatePayloadSchema)}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setError('');
          setSaving(true);
          try {
            let data: Tool;
            const isUpdate = initial && initial.id;

            if (isUpdate) {
              data = await updateTool(initial.id as number, values as ToolUpdatePayload);
            } else {
              data = await createTool(values as unknown as ToolCreatePayload);
            }

            const files = fileRef.current?.files && fileRef.current.files.length > 0 ? fileRef.current.files : null;
            if (files && files.length > 0) {
              await uploadToolScreenshots(data.id, Array.from(files));
              addToast(`Tool ${isUpdate ? 'updated' : 'created'} with ${files.length} screenshot(s)!`, 'success');
            } else {
              addToast(`Tool ${isUpdate ? 'updated' : 'created'} successfully! 🎉`, 'success');
            }

            if (onSaved) onSaved(data);
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err || 'Failed to save');
            setError(message);
            addToast(message, 'error');
            setErrors({ name: message } as unknown as Record<string, string>);
          } finally {
            setSaving(false);
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, isSubmitting }) => (
          <Form>
            {error && <div className={styles.error}>{error}</div>}

            <NameField />

            <URLFields />

            <TextAreaField
              name="description"
              label="Description"
              maxLength={2000}
              rows={4}
              value={values.description || ''}
            />

            <TextAreaField
              name="usage"
              label="Usage"
              maxLength={5000}
              rows={3}
              value={values.usage || ''}
            />

            <TextAreaField
              name="examples"
              label="Examples"
              maxLength={5000}
              rows={2}
              value={values.examples || ''}
              optional
            />

            <RoleSelector
              roles={roles}
              selectedRoles={values.roles || []}
              onToggle={(roleId) =>
                setFieldValue(
                  'roles',
                  (values.roles || []).includes(roleId)
                    ? (values.roles || []).filter(x => x !== roleId)
                    : [...(values.roles || []), roleId]
                )
              }
            />

            <CategorySelector
              categories={categories}
              selectedCategories={values.categories || []}
              onToggle={(categoryId) =>
                setFieldValue(
                  'categories',
                  (values.categories || []).includes(categoryId)
                    ? (values.categories || []).filter(x => x !== categoryId)
                    : [...(values.categories || []), categoryId]
                )
              }
            />

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

            <ScreenshotManager
              screenshots={values.screenshots || []}
              toolId={initial?.id as number | undefined}
              onScreenshotsChange={(screenshots) => setFieldValue('screenshots', screenshots)}
              fileInputRef={fileRef}
            />

            <div className={styles.submit}>
              <button
                type="submit"
                disabled={saving || isSubmitting}
                className={cx(styles.submitButton, (saving || isSubmitting) ? styles.submitButtonDisabled : '')}
              >
                {saving || isSubmitting ? 'Saving...' : 'Save Tool'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
