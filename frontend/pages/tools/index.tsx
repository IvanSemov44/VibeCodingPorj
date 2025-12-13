import React, { useEffect, useState } from 'react';
import { getTools, getCategories, getRoles, getTags } from '../../lib/api';
import { Tool, Category, Tag, Role, PaginationMeta } from '../../lib/types';
import Link from 'next/link';
import ToolEntry from '../../components/ToolEntry';
import TagMultiSelect from '../../components/TagMultiSelect';

export default function ToolsIndex(): React.ReactElement {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState<number>(1);
  const [perPage] = useState<number>(8);
  const [q, setQ] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    load(page);
    (async () => {
      try {
        const c = await getCategories();
        setCategories(c || []);
        const r = await getRoles();
        setRoles(r || []);
        const t = await getTags();
        setTags(t || []);
      } catch (err) {
        console.error('Failed to load categories/roles/tags', err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(p = 1) {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean> = {};
      if (q) params.q = q;
      if (p && p > 1) params.page = p;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedRole) params.role = selectedRole;
      if (selectedTags && selectedTags.length > 0) params.tags = selectedTags.join(',');
      params.per_page = perPage;
      const res = await getTools(params);
      setTools(res.data || []);
      setMeta(res.meta || null);
      const current = res.meta?.current_page ?? p;
      setPage(current);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Unable to load tools (network error)');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      load(1);
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function clearFilters() {
    setQ('');
    setSelectedCategory('');
    setSelectedRole('');
    setSelectedTags([]);
    setPage(1);
    load(1);
  }

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="mb-4">AI Tools</h1>
        <Link href="/tools/new">
          <button className="py-2 px-3 rounded-md bg-blue-600 text-white border-none cursor-pointer hover:bg-blue-700 transition-colors">
            Add Tool
          </button>
        </Link>
      </div>

      <div className="my-3">
        <input
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full p-2.5 rounded-md border border-gray-200 box-border"
        />
      </div>

      <div className="flex gap-3 mb-3 items-center flex-wrap">
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
            load(1);
          }}
          className="p-2 rounded-md border border-gray-200"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug || c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={selectedRole}
          onChange={(e) => {
            setSelectedRole(e.target.value);
            setPage(1);
            load(1);
          }}
          className="p-2 rounded-md border border-gray-200"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="min-w-[240px] max-w-[360px] flex-1">
          <TagMultiSelect
            value={selectedTags}
            onChange={(vals) => {
              setSelectedTags(vals);
              setPage(1);
              load(1);
            }}
            allowCreate={false}
            placeholder="Filter tags..."
            options={tags}
          />
        </div>
        <div className="ml-auto">
          <button
            onClick={clearFilters}
            className="py-1.5 px-2.5 rounded-md bg-gray-100 border border-gray-200 cursor-pointer hover:bg-gray-200 transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">Unable to load tools. {error}</div>
      ) : (
        <div>
          {tools.length === 0 ? (
            <div>No tools yet.</div>
          ) : (
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
              {tools.map((t) => (
                <ToolEntry key={t.id} tool={t} onDeleted={() => load()} />
              ))}
            </div>
          )}

          {meta && meta.last_page > 1 && (
            <div className="flex gap-2 mt-3 items-center flex-wrap">
              <button
                onClick={() => load(Math.max(1, (meta.current_page || page) - 1))}
                disabled={!((meta.current_page || page) > 1)}
                className="py-1.5 px-2.5 rounded-md border border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pn) => (
                <button
                  key={pn}
                  onClick={() => load(pn)}
                  className={`py-1.5 px-2 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                    (meta.current_page || page) === pn ? 'font-bold' : 'font-normal'
                  }`}
                >
                  {pn}
                </button>
              ))}
              <button
                onClick={() => load(Math.min(meta.last_page, (meta.current_page || page) + 1))}
                disabled={!((meta.current_page || page) < meta.last_page)}
                className="py-1.5 px-2.5 rounded-md border border-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
