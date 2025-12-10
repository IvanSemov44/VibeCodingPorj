import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getTool, getCategories, getRoles, getCsrf, getTags } from '../../../lib/api';
import ToolForm from '../../../components/ToolForm';
import { Tool, Category, Tag, Role } from '../../../lib/types';

export default function EditToolPage(): React.ReactElement | null {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState<Tool | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await getCsrf();
        const toolObj = await getTool(String(id));
        setTool(toolObj as Tool);
        const cc = await getCategories();
        setCategories(cc || []);
        const rr = await getRoles();
        setRoles(rr || []);
        const jt = await getTags();
        setTags(jt || []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
      }
    })();
  }, [id]);

  if (!tool) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <h1>Edit Tool</h1>
      <ToolForm
        categories={categories}
        roles={roles}
        allTags={tags.map((t) => t.name)}
        tags={Array.isArray(tool.tags) ? tool.tags : []}
        onSaved={() => router.push('/tools')}
        initial={tool}
      />
    </div>
  );
}
