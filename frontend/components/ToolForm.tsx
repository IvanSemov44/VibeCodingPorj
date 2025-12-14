/**
 * ToolForm Component
 * Main form for creating and editing tools
 * Refactored to use sub-components for better organization
 */

import React, { useEffect, useRef, useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import { getCsrf } from '../lib/api';
import {
  useCreateToolMutation,
  useUpdateToolMutation,
  useUploadToolScreenshotsMutation,
} from '../store/api';
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
  initial = null,
}: ToolFormProps): React.ReactElement {
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { addToast } = useToast();
  const [createTrigger] = useCreateToolMutation();
  const [updateTrigger] = useUpdateToolMutation();
  const [uploadTrigger] = useUploadToolScreenshotsMutation();

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
    description:
      (typeof initial?.description === 'string' ? initial?.description : '') || undefined,
    usage: (typeof initial?.usage === 'string' ? initial?.usage : '') || undefined,
    examples: (typeof initial?.examples === 'string' ? initial?.examples : '') || undefined,
    difficulty: typeof initial?.difficulty === 'string' ? initial?.difficulty : undefined,
    categories: (initial?.categories || []).map((c: Category) => c.id),
    roles: (initial?.roles || []).map((r: Role) => r.id),
    tags: (initial?.tags || []).map((t: Tag) => t.name),
    screenshots: initial?.screenshots || [],
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Formik
        initialValues={initialValues}
        validate={zodToFormikValidate(ToolCreatePayloadSchema)}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setError('');
          setSaving(true);
          try {
            let data: Tool;
            const isUpdate = !!(initial && initial.id);

            if (isUpdate) {
              data = await updateTrigger({ id: initial!.id as number, body: values as ToolUpdatePayload }).unwrap();
            } else {
              data = await createTrigger(values as unknown as ToolCreatePayload).unwrap();
            }

            const files =
              fileRef.current?.files && fileRef.current.files.length > 0
                ? fileRef.current.files
                : null;
            if (files && files.length > 0) {
              const arr = Array.from(files) as File[];
              await uploadTrigger({ id: data.id, files: arr }).unwrap();
              addToast(
                `Tool ${isUpdate ? 'updated' : 'created'} with ${arr.length} screenshot(s)!`,
                'success',
              );
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
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                    ? (values.roles || []).filter((x) => x !== roleId)
                    : [...(values.roles || []), roleId],
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
                    ? (values.categories || []).filter((x) => x !== categoryId)
                    : [...(values.categories || []), categoryId],
                )
              }
            />

            <div className="mt-3">
              <div className="mt-2">
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

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving || isSubmitting}
                className={`px-8 py-3 bg-accent text-white text-base font-semibold rounded-lg border-none cursor-pointer transition-all ${
                  saving || isSubmitting
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-lg'
                }`}
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
