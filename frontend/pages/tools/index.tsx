import React, { useEffect, useMemo, useState } from 'react';
import {
  useGetToolsQuery,
  useGetCategoriesQuery,
  useGetRolesQuery,
  useGetTagsQuery,
} from '../../store/domains';
import Link from 'next/link';
import ToolEntry from '../../components/ToolEntry';
import TagMultiSelect from '../../components/TagMultiSelect';

export default function ToolsIndex(): React.ReactElement {
  const [page, setPage] = useState<number>(1);
  const perPage = 8;
  const [q, setQ] = useState<string>('');
  const { data: categoriesRes } = useGetCategoriesQuery();
  const categories = categoriesRes || [];
  const { data: rolesRes } = useGetRolesQuery();
  const roles = rolesRes || [];
  const { data: tagsRes } = useGetTagsQuery();
  const tags = tagsRes || [];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  useEffect(() => {
    // initial load handled by React Query hooks below
  }, []);

  // Debounce search input
  const [qDebounced, setQDebounced] = useState(q);
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    const p: Record<string, string | number> = {};
    if (qDebounced) p.q = qDebounced;
    if (page && page > 1) p.page = page;
    if (selectedCategory) p.category = selectedCategory;
    if (selectedRole) p.role = selectedRole;
    if (selectedTags && selectedTags.length > 0) p.tags = selectedTags.join(',');
    p.per_page = perPage;
    // Only show approved tools on the public tools listing
    p.status = 'approved';
    return p;
  }, [qDebounced, page, selectedCategory, selectedRole, selectedTags, perPage]);

  const {
    data: toolsRes,
    isLoading,
    error: queryError,
    refetch,
  } = useGetToolsQuery(params, {
    keepPreviousData: true,
  });

  const toolsData = toolsRes?.data || [];
  const metaData = toolsRes?.meta || null;

  useEffect(() => {
    if (metaData && metaData.current_page) setPage(metaData.current_page);
  }, [metaData]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  function clearFilters() {
    setQ('');
    setSelectedCategory('');
    setSelectedRole('');
    setSelectedTags([]);
    setPage(1);
    refetch();
  }

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="mb-4">AI Tools</h1>
        <Link href="/tools/new">
          <button className="py-2 px-3 rounded-md bg-[var(--accent)] text-white border-none cursor-pointer hover:bg-[var(--accent-hover)] transition-colors">
            Add Tool
          </button>
        </Link>
      </div>

      <div className="my-3">
        <input
          placeholder="Search by name..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full p-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] box-border"
        />
      </div>

      <div className="flex gap-3 mb-3 items-center flex-wrap">
          <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
            refetch();
          }}
          className="p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
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
            refetch();
          }}
          className="p-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
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
            onChange={(vals: string[]) => {
              setSelectedTags(vals);
              setPage(1);
              refetch();
            }}
            allowCreate={false}
            placeholder="Filter tags..."
            options={tags}
          />
        </div>
        <div className="ml-auto">
          <button
            onClick={clearFilters}
            className="py-1.5 px-2.5 rounded-md bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
          >
            Clear filters
          </button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : queryError ? (
        <div className="p-3 rounded-md alert-error">
          Unable to load tools. {String(queryError)}
        </div>
      ) : (
        <div>
          {toolsData.length === 0 ? (
            <div>No tools yet.</div>
          ) : (
            <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
              {toolsData.map((t) => (
                <ToolEntry key={t.id} tool={t} onDeleted={() => refetch()} />
              ))}
            </div>
          )}

          {metaData && metaData.last_page > 1 && (
            <div className="flex gap-2 mt-3 items-center flex-wrap">
              <button
                onClick={() => {
                  const pn = Math.max(1, (metaData.current_page || page) - 1);
                  setPage(pn);
                }}
                disabled={!((metaData.current_page || page) > 1)}
                className="py-1.5 px-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)] transition-colors"
              >
                Prev
              </button>
              {Array.from({ length: metaData.last_page }, (_, i) => i + 1).map((pn) => (
                <button
                  key={pn}
                  onClick={() => setPage(pn)}
                  className={`py-1.5 px-2 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors ${
                      (metaData.current_page || page) === pn ? 'font-bold' : 'font-normal'
                    }`}
                >
                  {pn}
                </button>
              ))}
              <button
                onClick={() =>
                  setPage(Math.min(metaData.last_page, (metaData.current_page || page) + 1))
                }
                disabled={!((metaData.current_page || page) < metaData.last_page)}
                className="py-1.5 px-2.5 rounded-md border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--bg-secondary)] transition-colors"
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
