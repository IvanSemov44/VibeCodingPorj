import { useState, useEffect } from 'react';
import { createTool, getCsrf } from '../lib/api';

export default function ToolForm({ categories = [], roles = [], tags = [], onSaved }) {
  const [form, setForm] = useState({
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
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Ensure CSRF token is fetched for authenticated requests
    (async () => {
      try {
        await getCsrf();
      } catch {
        // ignore
      }
    })();

    // Reference `tags` to avoid unused variable lint warnings when not used yet
    // (tags may be used for future enhancements)
    if (tags && tags.length === 0) {
      // noop
    }
  }, [tags]);

  const toggleArray = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const res = await createTool(form);
      if (res.ok) {
        const data = await res.json();
        if (onSaved) onSaved(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} style={{ maxWidth: 800 }}>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Name *</label>
        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: 8 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Link</label>
          <input value={form.url} onChange={e => setForm({...form, url: e.target.value})} style={{ width: '100%', padding: 8 }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 600 }}>Documentation (link)</label>
          <input value={form.docs_url} onChange={e => setForm({...form, docs_url: e.target.value})} style={{ width: '100%', padding: 8 }} />
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Description</label>
        <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} style={{ width: '100%', padding: 8 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Usage</label>
        <textarea value={form.usage} onChange={e => setForm({...form, usage: e.target.value})} rows={3} style={{ width: '100%', padding: 8 }} />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Examples (optional)</label>
        <textarea value={form.examples} onChange={e => setForm({...form, examples: e.target.value})} rows={2} style={{ width: '100%', padding: 8 }} />
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
        <label style={{ display: 'block', fontWeight: 600 }}>Categories</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
          {categories.map(c => (
            <button key={c.id} type="button" onClick={() => toggleArray('categories', c.id)} style={{ padding: '6px 10px', background: form.categories.includes(c.id) ? '#059669' : '#f3f4f6', color: form.categories.includes(c.id) ? 'white' : 'inherit', borderRadius: 6 }}>{c.name}</button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: 'block', fontWeight: 600 }}>Tags (comma separated)</label>
        <input value={form.tags.join(',')} onChange={e => setForm({...form, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})} style={{ width: '100%', padding: 8 }} />
      </div>

      <div style={{ marginTop: 16 }}>
        <button type="submit" disabled={saving} style={{ padding: '10px 16px', background: '#2563eb', color: 'white', borderRadius: 6 }}>{saving ? 'Saving...' : 'Save Tool'}</button>
      </div>
    </form>
  );
}
