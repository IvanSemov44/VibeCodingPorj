import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import {
  useGetAdminTagsQuery,
  useCreateAdminTagMutation,
  useUpdateAdminTagMutation,
  useDeleteAdminTagMutation,
  useGetTagStatsQuery,
} from '../../store/domains/admin';

interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  tools_count?: number;
  created_at?: string;
}

export default function TagsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const { data, isLoading, error } = useGetAdminTagsQuery({ page, search, per_page: 20 });
  const { data: stats } = useGetTagStatsQuery();
  const [createTag, createMutation] = useCreateAdminTagMutation();
  const [updateTag, updateMutation] = useUpdateAdminTagMutation();
  const [deleteTag, deleteMutation] = useDeleteAdminTagMutation();

  const tags = data?.data || [];
  const pagination = {
    current_page: data?.current_page || 1,
    last_page: data?.last_page || 1,
    total: data?.total || 0,
  };

  const handleOpenCreate = () => {
    setFormData({ name: '', description: '' });
    setEditingTag(null);
    setShowModal(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setFormData({ name: tag.name, description: tag.description || '' });
    setEditingTag(tag);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        await updateTag({ id: editingTag.id, data: formData }).unwrap();
      } else {
        await createTag(formData).unwrap();
      }
      setShowModal(false);
      setFormData({ name: '', description: '' });
    } catch (err: any) {
      alert(err?.message || 'Failed to save tag');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      await deleteTag(id).unwrap();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete tag. It may be used by tools.');
    }
  };

  return (
    <AdminLayout title="Tags" description="Manage content tags">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--secondary-bg)] p-4 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-secondary)] text-sm">Total Tags</div>
            <div className="text-[var(--text-primary)] text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-[var(--secondary-bg)] p-4 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-secondary)] text-sm">With Tools</div>
            <div className="text-[var(--text-primary)] text-2xl font-bold">{stats.with_tools}</div>
          </div>
          <div className="bg-[var(--secondary-bg)] p-4 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-secondary)] text-sm">Without Tools</div>
            <div className="text-[var(--text-primary)] text-2xl font-bold">
              {stats.without_tools}
            </div>
          </div>
          <div className="bg-[var(--secondary-bg)] p-4 rounded-lg border border-[var(--border-color)]">
            <div className="text-[var(--text-secondary)] text-sm">Avg Tools per Tag</div>
            <div className="text-[var(--text-primary)] text-2xl font-bold">
              {stats.avg_tools_per_tag}
            </div>
          </div>
        </div>
      )}

      {/* Search and Create */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search tags..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-secondary)]"
        />
        <button
          onClick={handleOpenCreate}
          className="px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          + Create Tag
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">Loading...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">Failed to load tags</div>
      ) : tags.length === 0 ? (
        <div className="text-center py-8 text-[var(--text-secondary)]">No tags found</div>
      ) : (
        <div className="bg-[var(--secondary-bg)] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">Name</th>
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">Slug</th>
                <th className="text-left p-4 text-[var(--text-secondary)] font-medium">
                  Description
                </th>
                <th className="text-center p-4 text-[var(--text-secondary)] font-medium">Tools</th>
                <th className="text-right p-4 text-[var(--text-secondary)] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag: Tag) => (
                <tr
                  key={tag.id}
                  className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--primary-bg)] transition-colors"
                >
                  <td className="p-4 text-[var(--text-primary)] font-medium">{tag.name}</td>
                  <td className="p-4 text-[var(--text-secondary)]">{tag.slug}</td>
                  <td className="p-4 text-[var(--text-secondary)] max-w-xs truncate">
                    {tag.description || '-'}
                  </td>
                  <td className="p-4 text-center text-[var(--text-primary)]">
                    {tag.tools_count || 0}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleOpenEdit(tag)}
                      className="text-[var(--accent)] hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag.id, tag.name)}
                      className="text-red-500 hover:underline"
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={pagination.current_page}
        lastPage={pagination.last_page}
        total={pagination.total}
        perPage={20}
        onPageChange={setPage}
        loading={isLoading}
      />

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[var(--secondary-bg)] p-6 rounded-lg border border-[var(--border-color)] w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              {editingTag ? 'Edit Tag' : 'Create Tag'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[var(--text-secondary)] mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  placeholder="e.g. Machine Learning"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] resize-none"
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={
                  !formData.name.trim() || createMutation.isPending || updateMutation.isPending
                }
                className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
