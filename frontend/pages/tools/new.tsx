import React, { useEffect, useState } from 'react';
import ToolForm from '../../components/ToolForm';
import { getCsrf, getCategories, getRoles, getTags } from '../../lib/api';
import { Category, Tag, Role } from '../../lib/types';

export default function NewToolPage(): React.ReactElement {
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function load() {
      try {
        await getCsrf();
        const [catsRes, rolesRes] = await Promise.all([getCategories(), getRoles()]);
        setCategories(catsRes || []);
        setRoles(rolesRes || []);
        const t = await getTags();
        setTags(t || []);
      } catch {
        // ignore list-loading errors
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <h1 className="mb-4">Add New AI Tool</h1>
      <ToolForm
        categories={categories}
        roles={roles}
        allTags={tags.map((t) => t.name)}
        onSaved={() => (window.location.href = '/tools')}
      />
    </div>
  );
}
