import { useEffect, useState } from 'react';
import { getTools, getCategories, getRoles, getTags } from '../../lib/api';
import Link from 'next/link';
import ToolEntry from '../../components/ToolEntry';
import TagMultiSelect from '../../components/TagMultiSelect';

export default function ToolsIndex() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(8);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState([]);
  const [roles, setRoles] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    load(page);
    (async () => {
      try {
        const c = await getCategories();
        if (c.ok) {
          const json = await c.json();
          setCategories(json.data || json);
        }
        const r = await getRoles();
        if (r.ok) {
          const json = await r.json();
          setRoles(json.data || json);
        }
        const t = await getTags();
        if (t.ok) {
          const json = await t.json();
          setTags(json.data || json);
        }
      } catch (err) {
        console.error('Failed to load categories/roles/tags', err);
      }
    })();
  }, []);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (p && p > 1) params.page = p;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedRole) params.role = selectedRole;
      if (selectedTags && selectedTags.length > 0) params.tags = selectedTags.join(',');
      params.per_page = perPage;
      const res = await getTools(params);
      if (res.ok) {
        const data = await res.json();
        // Laravel paginated responses include `data`, `links`, and `meta`
        setTools(data.data || data);
        setMeta(data.meta || null);
        setPage(data.meta?.current_page || p);
        setError('');
      } else {
        // Try to extract message from JSON body
        let msg = 'Unable to load tools';
        try {
          const body = await res.json();
          if (body && body.message) msg = body.message;
        } catch {
          // ignore JSON parse errors
        }
        setError(msg);
        setTools([]);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load tools (network error)');
    } finally {
      setLoading(false);
    }
  }

    // Auto-apply search: debounce typing, then reload page 1
    useEffect(() => {
      const t = setTimeout(() => {
        setPage(1);
        load(1);
      }, 300);
      return () => clearTimeout(t);
    }, [q]);
  
    // Clear all filters and reload
    function clearFilters() {
      setQ('');
      setSelectedCategory('');
      setSelectedRole('');
      setSelectedTags([]);
      setPage(1);
      load(1);
    }

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AI Tools</h1>
        <Link href="/tools/new"><button style={{ padding: '8px 12px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>Add Tool</button></Link>
      </div>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <input placeholder="Search by name..." value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', padding: 8 }} />
      </div>

      {/* Filter controls always visible so user can change filters even when no tools are present */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
        <select value={selectedCategory} onChange={e => { setSelectedCategory(e.target.value); setPage(1); load(1); }}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.slug || c.name}>{c.name}</option>)}
        </select>
        <select value={selectedRole} onChange={e => { setSelectedRole(e.target.value); setPage(1); load(1); }}>
          <option value="">All roles</option>
          {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
        </select>
        <div style={{ minWidth: 240, maxWidth: 360 }}>
          <label style={{ display: 'block', fontSize: 12 }}>Tags</label>
          <div style={{ marginTop: 6, width: '100%' }}>
              <div style={{ width: '100%' }}>
                <TagMultiSelect value={selectedTags} onChange={(vals) => { setSelectedTags(vals); setPage(1); load(1); }} allowCreate={false} placeholder="Filter tags..." options={tags} />
              </div>
          </div>
        </div>
      
          <div style={{ marginLeft: 'auto' }}>
            <button onClick={clearFilters} style={{ padding: '6px 10px', borderRadius: 6, background: '#f3f4f6' }}>Clear filters</button>
          </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ padding: 12, background: '#fee2e2', color: '#b91c1c', borderRadius: 6 }}>Unable to load tools. {error}</div>
      ) : (
        <div>
          {tools.length === 0 ? (
            <div>No tools yet.</div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {tools.map(t => (
                <ToolEntry key={t.id} tool={t} onDeleted={() => load()} />
              ))}
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
              <button onClick={() => load(Math.max(1, (meta.current_page || page) - 1))} disabled={!((meta.current_page || page) > 1)}>Prev</button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(pn => (
                <button key={pn} onClick={() => load(pn)} style={{ fontWeight: (meta.current_page || page) === pn ? '700' : '400' }}>{pn}</button>
              ))}
              <button onClick={() => load(Math.min(meta.last_page, (meta.current_page || page) + 1))} disabled={!((meta.current_page || page) < meta.last_page)}>Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
