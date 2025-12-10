import React, { useEffect, useState } from 'react';
import {
  getCsrf,
  getTags,
  createTag,
  updateTag,
  deleteTag,
} from '../../lib/api';
import { Tag } from '../../lib/types';

export default function AdminTags(): React.ReactElement {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    getCsrf().catch(() => {});
    fetchTags();
  }, []);

  async function fetchTags() {
    setLoading(true);
    setError(null);
    try {
      const list = await getTags();
      setTags(list || []);
    } catch (err) {
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createTag({ name, slug: slug || undefined });
      setName('');
      setSlug('');
      await fetchTags();
    } catch (err) {
      setError('Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number, updated: Partial<Tag>) {
    try {
      await updateTag(id, updated);
      await fetchTags();
    } catch (err) {
      setError('Update failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tag?')) return;
    try {
      await deleteTag(id);
      await fetchTags();
    } catch (err) {
      setError('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Tags</h1>
      <form onSubmit={handleCreate} style={{ marginBottom: 20 }}>
        <div>
          <label>Name</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div style={{ marginTop: 8 }}>
          <label>Slug (optional)</label>
          <br />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table border={0} cellPadding={8}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((t) => (
              <TagRow key={t.id} tag={t} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TagRow({ tag, onUpdate, onDelete }: { tag: Tag; onUpdate: (id: number, updated: Partial<Tag>) => Promise<void>; onDelete: (id: number) => void; }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(tag.name);
  const [slug, setSlug] = useState<string>(tag.slug || '');
  const [saving, setSaving] = useState<boolean>(false);

  async function save() {
    setSaving(true);
    await onUpdate(tag.id, { name, slug: slug || undefined });
    setSaving(false);
    setEditing(false);
  }

  return (
    <tr>
      <td>{editing ? <input value={name} onChange={(e) => setName(e.target.value)} /> : tag.name}</td>
      <td>{editing ? <input value={slug} onChange={(e) => setSlug(e.target.value)} /> : tag.slug}</td>
      <td>
        {editing ? (
          <>
            <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(tag.id)} style={{ marginLeft: 8 }}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
