import { useEffect, useState } from 'react';
import ToolForm from '../../components/ToolForm';
import { getCsrf, getCategories, getRoles, getTags } from '../../lib/api';

export default function NewToolPage() {
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    // Fetch categories and roles lists for selection
    async function load() {
      try {
        await getCsrf();
        const [catsRes, rolesRes] = await Promise.all([
          getCategories(),
          getRoles()
        ]);
        if (catsRes.ok) setCategories(await catsRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
        const t = await getTags();
        if (t.ok) {
          const jt = await t.json();
          setTags(jt.data || jt);
        }
      } catch {
        // ignore errors while loading lists
      }
    }
    load();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <h1 style={{ marginBottom: 16 }}>Add New AI Tool</h1>
      <ToolForm categories={categories} roles={roles} allTags={tags} onSaved={() => window.location.href = '/tools'} />
    </div>
  );
}
