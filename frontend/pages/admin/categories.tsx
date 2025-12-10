import React, { useEffect, useState } from 'react';
import { getCsrf, getCategories, createCategory, updateCategory, deleteCategory } from '../../lib/api';
import { Category } from '../../lib/types';

export default function AdminCategories(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    getCsrf().catch(() => {});
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    setError(null);
    try {
      const list = await getCategories();
      setCategories(list || []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createCategory({ name, slug: slug || undefined });
      setName('');
      setSlug('');
      await fetchCategories();
    } catch {
      setError('Create failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id: number, updated: Partial<Category>) {
    try {
      await updateCategory(id, updated);
      await fetchCategories();
    } catch {
      setError('Update failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin — Categories</h1>
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
            {categories.map((c) => (
              <CategoryRow key={c.id} category={c} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CategoryRow({ category, onUpdate, onDelete }: { category: Category; onUpdate: (id: number, updated: Partial<Category>) => Promise<void>; onDelete: (id: number) => void; }) {
  const [editing, setEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(category.name);
  const [slug, setSlug] = useState<string>(category.slug || '');
  const [saving, setSaving] = useState<boolean>(false);

  async function save() {
    setSaving(true);
    await onUpdate(category.id, { name, slug: slug || undefined });
    setSaving(false);
    setEditing(false);
  }

  return (
    <tr>
      <td>{editing ? <input value={name} onChange={(e) => setName(e.target.value)} /> : category.name}</td>
      <td>{editing ? <input value={slug} onChange={(e) => setSlug(e.target.value)} /> : category.slug}</td>
      <td>
        {editing ? (
          <>
            <button onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button onClick={() => setEditing(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={() => setEditing(true)}>Edit</button>
            <button onClick={() => onDelete(category.id)} style={{ marginLeft: 8 }}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}
