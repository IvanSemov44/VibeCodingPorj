import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Pagination from '../../components/admin/Pagination';
import { CreateEditModal, type FieldConfig } from '../../components/admin/CreateEditModal';
import {
  useGetAdminTagsQuery,
  useCreateAdminTagMutation,
  useUpdateAdminTagMutation,
  useDeleteAdminTagMutation,
  useGetTagStatsQuery,
} from '../../store/domains/admin';
import type { Tag } from '../../lib/types';

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

  const tagFields: FieldConfig[] = [
    { name: 'name', label: 'Name *', type: 'text', required: true, placeholder: 'e.g. Machine Learning' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Optional description...' },
  ];

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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save tag';
      alert(message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete tag "${name}"?`)) return;
    try {
      await deleteTag(id).unwrap();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete tag. It may be used by tools.';
      alert(message);
    }
  };

  return (
    <AdminLayout title="Tags" description="Manage content tags">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-label">Total Tags</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">With Tools</div>
            <div className="stat-value">{stats.with_tools}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Without Tools</div>
            <div className="stat-value">
              {stats.without_tools}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Tools per Tag</div>
            <div className="stat-value">
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
          className="input-secondary flex-1"
        />
        <button
          onClick={handleOpenCreate}
          className="btn-primary"
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
        <div className="card-secondary overflow-hidden">
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
                  className="table-row-hover"
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
      <CreateEditModal
        isOpen={showModal}
        title={editingTag ? 'Edit Tag' : 'Create Tag'}
        formData={formData}
        onFormChange={setFormData}
        onSave={handleSave}
        fields={tagFields}
        isLoading={createMutation.isPending || updateMutation.isPending}
        saveBtnText={createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
        onClose={() => setShowModal(false)}
      />
    </AdminLayout>
  );
}
