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
    } catch {
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
    } catch {
      setError('Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number, updated: Partial<Tag>) {
    try {
      await updateTag(id, updated);
      await fetchTags();
    } catch {
      setError('Update failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tag?')) return;
    try {
      await deleteTag(id);
      await fetchTags();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div className="p-5">
      <h1>Admin — Tags</h1>
      <form onSubmit={handleCreate} className="mb-5">
        <div>
          <label>Name</label>
          <br />
          <input value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 p-2 border border-gray-200 rounded-md" />
        </div>
        <div className="mt-2">
          <label>Slug (optional)</label>
          <br />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 p-2 border border-gray-200 rounded-md" />
        </div>
        <div className="mt-3">
          <button type="submit" disabled={saving} className="py-2 px-3 bg-accent text-white rounded-md border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors">{saving ? 'Saving...' : 'Create'}</button>
        </div>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="border-0 w-full">
          <thead>
            <tr className="text-left">
              <th className="p-2 border-b border-gray-200">Name</th>
              <th className="p-2 border-b border-gray-200">Slug</th>
              <th className="p-2 border-b border-gray-200">Actions</th>
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
    <tr className="border-b border-gray-100">
      <td className="p-2">{editing ? <input value={name} onChange={(e) => setName(e.target.value)} className="p-1 border border-gray-200 rounded" /> : tag.name}</td>
      <td className="p-2">{editing ? <input value={slug} onChange={(e) => setSlug(e.target.value)} className="p-1 border border-gray-200 rounded" /> : tag.slug}</td>
      <td className="p-2">
        {editing ? (
          <>
            <button onClick={save} disabled={saving} className="py-1 px-2 bg-green-600 text-white text-sm rounded border-none cursor-pointer disabled:opacity-50 hover:bg-green-700 transition-colors">{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(false)} className="ml-2 py-1 px-2 bg-gray-200 text-gray-800 text-sm rounded border-none cursor-pointer hover:bg-gray-300 transition-colors">Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)} className="py-1 px-2 bg-blue-600 text-white text-sm rounded border-none cursor-pointer hover:bg-blue-700 transition-colors">Edit</button>
            <button onClick={() => onDelete(tag.id)} className="ml-2 py-1 px-2 bg-red-600 text-white text-sm rounded border-none cursor-pointer hover:bg-red-700 transition-colors">Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
