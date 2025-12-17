import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useGetToolQuery, useDeleteToolMutation } from '../../../store/domains';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/Toast';
import SkeletonToolDetail from '../../../components/Loading/SkeletonToolDetail';

// types in this file are inferred from API responses — no local aliases needed

export default function ToolDetailPage(): React.ReactElement | null {
  const router = useRouter();
  const { id } = router.query;
  const toolId = Array.isArray(id) ? id[0] : id;
  const {
    data: tool,
    isLoading,
    error,
  } = useGetToolQuery(toolId as string | number | undefined, {
    enabled: !!toolId,
  });

  if (isLoading)
    return (
      <div className="max-w-[900px] my-6 mx-auto" aria-busy>
        <SkeletonToolDetail />
      </div>
    );
  if (error)
    return (
      <div className="max-w-[900px] my-6 mx-auto">
        {(error as unknown as { message?: string })?.message ?? String(error)}
      </div>
    );
  if (!tool) return null;

  const t = tool as unknown as Record<string, unknown>;
  const url = typeof t.url === 'string' ? t.url : undefined;
  const name = t.name == null ? '' : String(t.name);
  const description = t.description == null ? '' : String(t.description);

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="m-0 text-2xl font-semibold text-[var(--text-primary)]">{name}</h1>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{description}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-2">By: {(t.user as any)?.name ?? 'Unknown'}</div>
            </div>

            <div className="flex gap-2">
              {url && (
                <a href={url} target="_blank" rel="noreferrer">
                  <button className="py-2 px-3 rounded-md border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] hover:bg-[var(--secondary-bg)] transition-colors">
                    Visit
                  </button>
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <strong>Documentation:</strong>{' '}
              {t.docs_url ? (
                <a
                  href={t.docs_url as string}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  Open docs
                </a>
              ) : (
                '—'
              )}
            </div>

            <div>
              <strong>Usage</strong>
              <div className="mt-2">{t.usage ? String(t.usage) : '—'}</div>
            </div>

            {Boolean(t.examples) && (
              <div>
                <strong>Examples</strong>
                <div className="mt-2">{String(t.examples)}</div>
              </div>
            )}

            <div className="flex gap-4 flex-wrap">
              <div>
                <strong>Categories</strong>
                <div className="mt-1 text-sm">{((t.categories as any[]) || []).map((c) => c.name).join(', ') || '—'}</div>
              </div>
              <div>
                <strong>Roles</strong>
                <div className="mt-1 text-sm">{((t.roles as any[]) || []).map((r) => r.name).join(', ') || '—'}</div>
              </div>
              <div>
                <strong>Tags</strong>
                <div className="mt-1 text-sm">{((t.tags as any[]) || []).map((tg) => tg.name).join(', ') || '—'}</div>
              </div>
            </div>
          </div>

          {/* Actions for owners/admins */}
          <ToolActions tool={tool as any} />
        </div>

        <aside className="w-full lg:w-72">
          {tool.screenshots && tool.screenshots.length > 0 ? (
            <div className="space-y-3">
              {tool.screenshots.map((s: string) => (
                <div key={s} className="rounded-md overflow-hidden border border-[var(--border-color)]">
                  <Image src={s} alt="screenshot" width={400} height={260} className="object-cover w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-md border border-[var(--border-color)] text-sm text-[var(--text-secondary)]">No screenshots</div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ToolActions({ tool }: { tool: any }) {
  const { user } = useAuth(false);
  const [deleteTrigger] = useDeleteToolMutation();
  const { addToast } = useToast();

  const canManage = Boolean(user && (user.id === (tool.user && tool.user.id) || (user.roles && user.roles.includes('owner'))));

  async function handleDelete() {
    if (!confirm('Delete this tool?')) return;
    try {
      await deleteTrigger(tool.id).unwrap();
      addToast('Tool deleted', 'success');
      window.location.href = '/tools';
    } catch (e) {
      console.error(e);
      addToast('Failed to delete', 'error');
    }
  }

  return (
    <div className="mt-4">
      {canManage ? (
        <div className="flex gap-2">
          <Link href={`/tools/${tool.id}/edit`}>
            <button className="py-2 px-3 rounded-md border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)]">Edit</button>
          </Link>
          <button onClick={handleDelete} className="py-2 px-3 rounded-md border border-red-300 text-red-700 hover:bg-red-50">Delete</button>
        </div>
      ) : null}
    </div>
  );
}
