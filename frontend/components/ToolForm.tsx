import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { createTool, getCsrf, uploadToolScreenshots, updateTool, deleteToolScreenshot } from '../lib/api';
import TagMultiSelect from './TagMultiSelect';
import type { Category, Tag, Tool, ToolCreatePayload, ToolUpdatePayload } from '../lib/types';

type Role = { id: number; name: string };

type ToolPayload = {
  id?: number;
  name: string;
  url?: string;
  docs_url?: string;
  description?: string;
  usage?: string;
  examples?: string;
  difficulty?: string;
  categories: number[];
  roles: number[];
  tags: string[];
  screenshots: string[];
};

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

export default function ToolForm({ categories = [], roles = [], tags = [], allTags = null, onSaved, initial = null }: ToolFormProps): React.ReactElement {
  const [form, setForm] = useState<ToolPayload>(() => ({
    name: '',
    url: '',
    docs_url: '',
    description: '',
    usage: '',
    examples: '',
    difficulty: '',
    categories: [],
    roles: [],
    tags: [],
    screenshots: []
  }));
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
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

    if (initial) {
      setForm(prev => ({
        ...prev,
        id: initial.id,
        name: initial.name || '',
        url: (typeof initial.url === 'string' ? initial.url : '') || '',
        docs_url: (typeof initial.docs_url === 'string' ? initial.docs_url : '') || '',
        description: (typeof initial.description === 'string' ? initial.description : '') || '',
        usage: (typeof initial.usage === 'string' ? initial.usage : '') || '',
        examples: (typeof initial.examples === 'string' ? initial.examples : '') || '',
        difficulty: (typeof initial.difficulty === 'string' ? initial.difficulty : '') || '',
        categories: (initial.categories || []).map((c: Category) => c.id),
        roles: (initial.roles || []).map((r: Role) => r.id),
        tags: (initial.tags || []).map((t: Tag) => t.name),
        screenshots: initial.screenshots || []
      }));
      setInitialScreenshots(initial.screenshots || []);
    }
  }, [tags, initial]);

  const toggleArray = (key: keyof ToolPayload, value: number | string) => {
    const current = (form[key] as unknown as Array<number | string>) || [];
    const newValue = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    handleFieldChange(key, newValue as Array<number | string>);
  };

  const validateField = (fieldName: keyof ToolPayload, value: unknown): string | null => {
    let error: string | null = null;
    switch (fieldName) {
      case 'name':
        if (typeof value !== 'string' || value.trim().length === 0) error = 'Tool name is required';
        else if (value.length > 255) error = 'Tool name cannot exceed 255 characters';
        break;
      case 'url':
      case 'docs_url':
        if (typeof value === 'string' && value.length > 500) error = 'URL cannot exceed 500 characters';
        break;
      case 'description':
        if (typeof value === 'string' && value.length > 2000) error = 'Description cannot exceed 2000 characters';
        break;
      case 'usage':
      case 'examples':
        if (typeof value === 'string' && value.length > 5000) error = `${String(fieldName)} cannot exceed 5000 characters`;
        break;
      case 'difficulty':
        if (typeof value === 'string' && !['beginner', 'intermediate', 'advanced', 'expert'].includes(value)) error = 'Difficulty must be: beginner, intermediate, advanced, or expert';
        break;
      case 'categories':
        if (!Array.isArray(value) || value.length === 0) error = 'Please select at least one category';
        break;
      case 'screenshots':
        if (Array.isArray(value) && value.length > 10) error = 'Maximum 10 screenshots allowed';
        break;
      case 'tags':
        if (Array.isArray(value) && value.some((t) => (String(t)).length > 50)) error = 'Tag names cannot exceed 50 characters';
        break;
    }
    return error;
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    (Object.keys(form) as Array<keyof ToolPayload>).forEach(key => {
      const value = (form as unknown as Record<string, unknown>)[key as string];
      const error = validateField(key, value);
      if (error) errors[key as string] = error;
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldName: keyof ToolPayload, value: string | number | Array<number | string>) => {
    setForm(prev => ({ ...prev, [fieldName]: value } as ToolPayload));
    if (validationErrors[fieldName as string]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName as string];
        return updated;
      });
    }
    const error = validateField(fieldName, value);
    if (error) setValidationErrors(prev => ({ ...prev, [fieldName as string]: error }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setSaving(true);
    try {
      let data: Tool;
      if (form.id) {
        const { id, ...payload } = form;
        data = await updateTool(id as number, payload as ToolUpdatePayload);
      } else {
        data = await createTool(form as unknown as ToolCreatePayload);
      }

      const files = fileRef.current?.files && fileRef.current.files.length > 0 ? fileRef.current.files : null;
      if (files && files.length > 0) {
        await uploadToolScreenshots(data.id, Array.from(files));
      }
      if (onSaved) onSaved(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err || 'Failed to save');
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScreenshot = async (url: string) => {
    if (!form.id) {
      setForm(prev => ({ ...prev, screenshots: (prev.screenshots || []).filter(s => s !== url) } as ToolPayload));
      return;
    }
    if (!confirm('Delete this screenshot?')) return;
    setDeleting(true);
    try {
      const body = await deleteToolScreenshot(form.id, url);
      const updated = body?.screenshots || (form.screenshots || []).filter(s => s !== url);
      setForm(prev => ({ ...prev, screenshots: updated } as ToolPayload));
      setInitialScreenshots(prev => (prev || []).filter(s => s !== url));
      return;
    } catch (err: unknown) {
      if (hasStatus(err) && err.status === 401) {
        try {
          await getCsrf();
          const body2 = await deleteToolScreenshot(form.id, url);
          const updated2 = body2?.screenshots || (form.screenshots || []).filter(s => s !== url);
          setForm(prev => ({ ...prev, screenshots: updated2 } as ToolPayload));
          setInitialScreenshots(prev => (prev || []).filter(s => s !== url));
          return;
        } catch (err2: unknown) {
          console.error('Retry delete after CSRF refresh failed', err2);
           
          alert('Failed to delete screenshot (unauthenticated). Please sign in and try again.');
          return;
        }
      }
      console.error('Delete screenshot error', err);
       
      alert((err instanceof Error && err.message) ? err.message : 'Failed to delete screenshot');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 800 }}>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Name *</label>
        <input
          required
          value={form.name}
          onChange={e => handleFieldChange('name', e.target.value)}
          maxLength={255}
          style={{ width: '100%', padding: 8, borderColor: validationErrors.name ? '#ef4444' : undefined }}
        />
        {validationErrors.name && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.name}</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Link</label>
          <input
            type="url"
            value={form.url}
            onChange={e => handleFieldChange('url', e.target.value)}
            maxLength={500}
            placeholder="https://example.com"
            style={{ width: '100%', padding: 8, borderColor: validationErrors.url ? '#ef4444' : undefined }}
          />
          {validationErrors.url && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.url}</div>}
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Documentation (link)</label>
          <input
            type="url"
            value={form.docs_url}
            onChange={e => handleFieldChange('docs_url', e.target.value)}
            maxLength={500}
            placeholder="https://docs.example.com"
            style={{ width: '100%', padding: 8, borderColor: validationErrors.docs_url ? '#ef4444' : undefined }}
          />
          {validationErrors.docs_url && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.docs_url}</div>}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Description</label>
        <textarea
          value={form.description}
          onChange={e => handleFieldChange('description', e.target.value)}
          maxLength={2000}
          rows={4}
          style={{ width: '100%', padding: 8, borderColor: validationErrors.description ? '#ef4444' : undefined }}
        />
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(form.description || '').length}/2000</div>
        {validationErrors.description && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.description}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Usage</label>
        <textarea
          value={form.usage}
          onChange={e => handleFieldChange('usage', e.target.value)}
          maxLength={5000}
          rows={3}
          style={{ width: '100%', padding: 8, borderColor: validationErrors.usage ? '#ef4444' : undefined }}
        />
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(form.usage || '').length}/5000</div>
        {validationErrors.usage && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.usage}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Examples (optional)</label>
        <textarea
          value={form.examples}
          onChange={e => handleFieldChange('examples', e.target.value)}
          maxLength={5000}
          rows={2}
          style={{ width: '100%', padding: 8, borderColor: validationErrors.examples ? '#ef4444' : undefined }}
        />
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{(form.examples || '').length}/5000</div>
        {validationErrors.examples && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.examples}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Roles</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {roles.map(r => (
            <button key={r.id} type="button" onClick={() => toggleArray('roles', r.id)} style={{ padding: '6px 10px', background: (form.roles || []).includes(r.id) ? '#2563eb' : '#f3f4f6', color: (form.roles || []).includes(r.id) ? 'white' : 'inherit', borderRadius: 6 }}>{r.name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Categories *</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => toggleArray('categories', c.id)} style={{ padding: '6px 10px', background: (form.categories || []).includes(c.id) ? '#059669' : '#f3f4f6', color: (form.categories || []).includes(c.id) ? 'white' : 'inherit', borderRadius: 6 }}>{c.name}</button>
          ))}
        </div>
        {validationErrors.categories && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.categories}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginTop: 8 }}>
          <TagMultiSelect
            value={form.tags}
            onChange={(newTags: string[]) => handleFieldChange('tags', newTags)}
            allowCreate={true}
            placeholder="Add tags..."
            options={allTags}
          />
        </div>
        {validationErrors.tags && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.tags}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Screenshots (optional) {(form.screenshots || []).length > 0 && `(${(form.screenshots || []).length}/10)`}</label>
        <input ref={fileRef} type="file" multiple accept="image/*" style={{ marginTop: 8 }} />
        {validationErrors.screenshots && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.screenshots}</div>}

        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <input value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Image URL" style={{ flex: 1, padding: 8 }} />
          <button type="button" onClick={() => {
            const url = (screenshotUrl || '').trim();
            if (!url) return;
            try { new URL(url); } catch { alert('Please enter a valid URL'); return; }
            const newScreenshots = [...(form.screenshots || []), url];
            handleFieldChange('screenshots', newScreenshots);
            setScreenshotUrl('');
          }} style={{ padding: '8px 10px' }}>Add</button>
        </div>

        {(form.screenshots || []).length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {(form.screenshots || []).map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Image src={s} alt="screenshot" width={120} height={80} style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                <button type="button" onClick={() => handleDeleteScreenshot(s)} disabled={deleting} style={{ marginTop: 6 }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={saving} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', borderRadius: 6 }}>{saving ? 'Saving...' : 'Save Tool'}</button>
      </div>
    </form>
  );
}
