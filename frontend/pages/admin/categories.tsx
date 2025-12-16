import React, { useEffect, useState } from 'react';
// AdminGuard removed: rely on Next middleware for server-side protection
import { Category } from '../../lib/types';
import {
  useGetCsrfMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from '../../store/domains';

export default function AdminCategories(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const { data: categoriesData, isLoading, refetch } = useGetCategoriesQuery();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const [csrfTrigger] = useGetCsrfMutation();
  const [createTrigger] = useCreateCategoryMutation();
  const [updateTrigger] = useUpdateCategoryMutation();
  const [deleteTrigger] = useDeleteCategoryMutation();

  useEffect(() => {
    csrfTrigger()
      .unwrap()
      .catch(() => {});
  }, [csrfTrigger]);

  useEffect(() => {
    setCategories(categoriesData || []);
  }, [categoriesData]);

  async function fetchCategories() {
    setError(null);
    try {
      await refetch();
    } catch {
      setError('Failed to load categories');
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await createTrigger({ name, slug: slug || undefined }).unwrap();
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
      await updateTrigger({ id, body: updated }).unwrap();
      await fetchCategories();
    } catch {
      setError('Update failed');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteTrigger(id).unwrap();
      await fetchCategories();
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div className="p-5">
      <h1>Admin — Categories</h1>
      <form onSubmit={handleCreate} className="mb-5">
        <div>
          <label>Name</label>
          <br />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 p-2 border border-gray-200 rounded-md"
          />
        </div>
        <div className="mt-2">
          <label>Slug (optional)</label>
          <br />
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 p-2 border border-gray-200 rounded-md"
          />
        </div>
        <div className="mt-3">
          <button
            type="submit"
            disabled={saving}
            className="py-2 px-3 bg-accent text-white rounded-md border-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover transition-colors"
          >
            {saving ? 'Saving...' : 'Create'}
          </button>
        </div>
      </form>

      {error && <div className="text-red-600">{error}</div>}

      {isLoading ? (
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
            {categories.map((c) => (
              <CategoryRow
                key={c.id}
                category={c}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      )}
      </div>
  );
}

function CategoryRow({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category;
  onUpdate: (id: number, updated: Partial<Category>) => Promise<void>;
  onDelete: (id: number) => void;
}) {
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
    <tr className="border-b border-gray-100">
      <td className="p-2">
        {editing ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-1 border border-gray-200 rounded"
          />
        ) : (
          category.name
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="p-1 border border-gray-200 rounded"
          />
        ) : (
          category.slug
        )}
      </td>
      <td className="p-2">
        {editing ? (
          <>
            <button
              onClick={save}
              disabled={saving}
              className="py-1 px-2 bg-green-600 text-white text-sm rounded border-none cursor-pointer disabled:opacity-50 hover:bg-green-700 transition-colors"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="ml-2 py-1 px-2 bg-gray-200 text-gray-800 text-sm rounded border-none cursor-pointer hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="py-1 px-2 bg-blue-600 text-white text-sm rounded border-none cursor-pointer hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="ml-2 py-1 px-2 bg-red-600 text-white text-sm rounded border-none cursor-pointer hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
