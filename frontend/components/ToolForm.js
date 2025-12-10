import { useState, useEffect, useRef } from 'react';
import { createTool, getCsrf, uploadToolScreenshots, updateTool, deleteToolScreenshot } from '../lib/api';
import TagMultiSelect from './TagMultiSelect';

export default function ToolForm({ categories = [], roles = [], tags = [], allTags = null, onSaved, initial = null }) {
  const [form, setForm] = useState(() => ({
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const fileRef = useRef(null);
  const [deleting, setDeleting] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [initialScreenshots, setInitialScreenshots] = useState([]);

  useEffect(() => {
    // Ensure CSRF token is fetched for authenticated requests
    (async () => {
      try {
        await getCsrf();
      } catch {
        // ignore
      }
    })();

    // If editing an existing tool, populate form
    if (initial) {
      setForm(prev => ({
        ...prev,
        id: initial.id,
        name: initial.name || '',
        url: initial.url || '',
        docs_url: initial.docs_url || '',
        description: initial.description || '',
        usage: initial.usage || '',
        examples: initial.examples || '',
        difficulty: initial.difficulty || '',
        categories: (initial.categories || []).map(c => c.id),
        roles: (initial.roles || []).map(r => r.id),
        tags: (initial.tags || []).map(t => t.name),
        screenshots: initial.screenshots || []
      }));
      setInitialScreenshots(initial.screenshots || []);
    }
  }, [tags]);

  const toggleArray = (key, value) => {
    const newValue = form[key].includes(value)
      ? form[key].filter(v => v !== value)
      : [...form[key], value];

    handleFieldChange(key, newValue);
  };

  const validateField = (fieldName, value) => {
    let error = null;

    switch (fieldName) {
      case 'name':
        if (!value || value.trim().length === 0) {
          error = 'Tool name is required';
        } else if (value.length > 255) {
          error = 'Tool name cannot exceed 255 characters';
        }
        break;

      case 'url':
        if (value && value.length > 500) {
          error = 'URL cannot exceed 500 characters';
        }
        break;

      case 'docs_url':
        if (value && value.length > 500) {
          error = 'Documentation URL cannot exceed 500 characters';
        }
        break;

      case 'description':
        if (value && value.length > 2000) {
          error = 'Description cannot exceed 2000 characters';
        }
        break;

      case 'usage':
        if (value && value.length > 5000) {
          error = 'Usage cannot exceed 5000 characters';
        }
        break;

      case 'examples':
        if (value && value.length > 5000) {
          error = 'Examples cannot exceed 5000 characters';
        }
        break;

      case 'difficulty':
        if (value && !['beginner', 'intermediate', 'advanced', 'expert'].includes(value)) {
          error = 'Difficulty must be: beginner, intermediate, advanced, or expert';
        }
        break;

      case 'categories':
        if (!value || value.length === 0) {
          error = 'Please select at least one category';
        }
        break;

      case 'screenshots':
        if (value && value.length > 10) {
          error = 'Maximum 10 screenshots allowed';
        }
        break;

      case 'tags':
        if (value && value.some(t => t.length > 50)) {
          error = 'Tag names cannot exceed 50 characters';
        }
        break;
    }

    return error;
  };

  const validateForm = () => {
    const errors = {};
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key]);
      if (error) errors[key] = error;
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFieldChange = (fieldName, value) => {
    setForm(prev => ({ ...prev, [fieldName]: value }));

    // Clear error for this field when user starts typing
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }

    // Validate field dynamically
    const error = validateField(fieldName, value);
    if (error) {
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});

    // Client-side validation
    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setSaving(true);
    try {
      // If editing existing tool (form.id present), call update
      let res;
      if (form.id) {
        const payload = { ...form };
        delete payload.id;
        res = await updateTool(form.id, payload);
      } else {
        res = await createTool(form);
      }

      if (res.ok) {
        const data = await res.json();

        // If files selected for screenshots, upload them after creating the tool
        const files = fileRef.current && fileRef.current.files ? fileRef.current.files : null;
        if (files && files.length > 0) {
          await uploadToolScreenshots(data.id, files);
          // refresh tool data by refetching onSaved consumer if needed
        }

        if (onSaved) onSaved(data);
      } else {
        const err = await res.json().catch(() => ({}));
        // Handle Laravel validation errors (422)
        if (res.status === 422 && err.errors) {
          setValidationErrors(err.errors);
          setError('Please fix the validation errors');
        } else {
          setError(err.message || 'Failed to save');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteScreenshot = async (url) => {
    // If tool is not yet saved, just remove locally
    if (!form.id) {
      setForm(prev => ({ ...prev, screenshots: (prev.screenshots || []).filter(s => s !== url) }));
      return;
    }

    if (!confirm('Delete this screenshot?')) return;

    setDeleting(true);
    try {
      try {
        const res = await deleteToolScreenshot(form.id, url);
        const body = await res.json().catch(() => null);
        const updated = body?.screenshots || (form.screenshots || []).filter(s => s !== url);
        setForm(prev => ({ ...prev, screenshots: updated }));
        setInitialScreenshots(prev => (prev || []).filter(s => s !== url));
        return;
      } catch (err) {
        // If 401, try refreshing CSRF once and retry
        if (err && err.status === 401) {
          try {
            await getCsrf();
            const res2 = await deleteToolScreenshot(form.id, url);
            const body2 = await res2.json().catch(() => null);
            const updated2 = body2?.screenshots || (form.screenshots || []).filter(s => s !== url);
            setForm(prev => ({ ...prev, screenshots: updated2 }));
            setInitialScreenshots(prev => (prev || []).filter(s => s !== url));
            return;
          } catch (err2) {
            console.error('Retry delete after CSRF refresh failed', err2);
            alert('Failed to delete screenshot (unauthenticated). Please sign in and try again.');
            return;
          }
        }

        console.error('Delete screenshot error', err);
        alert(err?.message || 'Failed to delete screenshot');
      }
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
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{form.description?.length || 0}/2000</div>
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
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{form.usage?.length || 0}/5000</div>
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
        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{form.examples?.length || 0}/5000</div>
        {validationErrors.examples && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.examples}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Roles</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {roles.map(r => (
            <button key={r.id} type="button" onClick={() => toggleArray('roles', r.id)} style={{ padding: '6px 10px', background: form.roles.includes(r.id) ? '#2563eb' : '#f3f4f6', color: form.roles.includes(r.id) ? 'white' : 'inherit', borderRadius: 6 }}>{r.name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Categories *</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => toggleArray('categories', c.id)} style={{ padding: '6px 10px', background: form.categories.includes(c.id) ? '#059669' : '#f3f4f6', color: form.categories.includes(c.id) ? 'white' : 'inherit', borderRadius: 6 }}>{c.name}</button>
          ))}
        </div>
        {validationErrors.categories && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.categories}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ marginTop: 8 }}>
          <TagMultiSelect
            value={form.tags}
            onChange={(newTags) => handleFieldChange('tags', newTags)}
            allowCreate={true}
            placeholder="Add tags..."
            options={allTags}
          />
        </div>
        {validationErrors.tags && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.tags}</div>}
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Screenshots (optional) {form.screenshots?.length > 0 && `(${form.screenshots.length}/10)`}</label>
        <input ref={fileRef} type="file" multiple accept="image/*" style={{ marginTop: 8 }} />
        {validationErrors.screenshots && <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4 }}>{validationErrors.screenshots}</div>}

        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <input value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)} placeholder="Image URL" style={{ flex: 1, padding: 8 }} />
          <button type="button" onClick={() => {
            const url = (screenshotUrl || '').trim();
            if (!url) return;
            try { new URL(url); } catch (err) { alert('Please enter a valid URL'); return; }
            const newScreenshots = [...(form.screenshots || []), url];
            handleFieldChange('screenshots', newScreenshots);
            setScreenshotUrl('');
          }} style={{ padding: '8px 10px' }}>Add</button>
        </div>

        {form.screenshots && form.screenshots.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {form.screenshots.map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img src={s} alt="screenshot" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
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
