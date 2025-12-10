import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getTool, getCategories, getRoles, updateTool, getCsrf, getTags } from '../../../lib/api';
import ToolForm from '../../../components/ToolForm';

export default function EditToolPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState(null);
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        await getCsrf();
        const res = await getTool(id);
        if (res.ok) {
          const json = await res.json();
          setTool(json.data || json);
        }
        const c = await getCategories();
        if (c.ok) {
          const cc = await c.json();
          setCategories(cc.data || cc);
        }
        const r = await getRoles();
        if (r.ok) {
          const rr = await r.json();
          setRoles(rr.data || rr);
        }
        const t = await getTags();
        if (t.ok) {
          const jt = await t.json();
          setTags(jt.data || jt);
        }
      } catch (err) {
        console.error(err);
      }
    })();
  }, [id]);

  if (!tool) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <h1>Edit Tool</h1>
      <ToolForm categories={categories} roles={roles} allTags={tags} tags={(tool.tags||[]).map(t=>t.name)} onSaved={() => router.push('/tools')} initial={tool} />
    </div>
  );
}
