import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useGetToolQuery, useDeleteToolMutation } from '../../../store/domains';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../components/Toast';
import SkeletonToolDetail from '../../../components/Loading/SkeletonToolDetail';
import StarRating from '../../../components/ratings/StarRating';
import CommentList from '../../../components/comments/CommentList';

// types in this file are inferred from API responses — no local aliases needed

export default function ToolDetailPage(): React.ReactElement | null {
  const router = useRouter();
  const { id } = router.query;
  const toolId = Array.isArray(id) ? id[0] : id;
  const { user } = useAuth(false);
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
  const averageRating = typeof t.average_rating === 'number' ? t.average_rating : 0;
  const ratingCount = typeof t.rating_count === 'number' ? t.rating_count : 0;
  const userRatingScore = user && t.user_rating ? (t.user_rating as any).score : undefined;

  return (
    <div className="max-w-7xl my-6 mx-auto px-4">
      {/* Header Card */}
      <div className="bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="m-0 text-3xl font-bold text-[var(--text-primary)] mb-2">{name}</h1>
                <p className="text-base text-[var(--text-secondary)] mb-3">{description}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <span>Created by</span>
                  <span className="font-semibold text-[var(--text-primary)]">
                    {(t.user as any)?.name ?? 'Unknown'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {url && (
                  <a href={url} target="_blank" rel="noreferrer">
                    <button className="py-2 px-4 rounded-md bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors font-medium">
                      Visit Website →
                    </button>
                  </a>
                )}
                {typeof t.docs_url === 'string' && t.docs_url ? (
                  <a href={t.docs_url} target="_blank" rel="noreferrer">
                    <button className="py-2 px-4 rounded-md border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] hover:bg-[var(--secondary-bg)] transition-colors">
                      Docs
                    </button>
                  </a>
                ) : null}
              </div>
            </div>

            {/* Star Rating Section */}
            <div className="bg-[var(--secondary-bg)] rounded-lg p-4 border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Rate this tool
                  </h3>
                  <StarRating
                    toolId={Number(toolId)}
                    currentRating={userRatingScore}
                    averageRating={averageRating}
                    ratingCount={ratingCount}
                    editable={Boolean(user)}
                  />
                </div>
                {!user && (
                  <div className="text-sm text-[var(--text-secondary)] italic">Sign in to rate</div>
                )}
              </div>
            </div>

            {/* Actions for owners/admins */}
            <ToolActions tool={tool as any} />
          </div>

          {/* Screenshots Sidebar */}
          <aside className="w-full lg:w-80">
            {tool.screenshots && tool.screenshots.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                  Screenshots
                </h3>
                {tool.screenshots.map((s: string, idx: number) => (
                  <div
                    key={s}
                    className="rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--secondary-bg)]"
                  >
                    <Image
                      src={s}
                      alt={`Screenshot ${idx + 1}`}
                      width={400}
                      height={260}
                      className="object-cover w-full"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-lg border border-[var(--border-color)] text-sm text-[var(--text-secondary)] text-center">
                No screenshots available
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Usage Card */}
        {t.usage ? (
          <div className="lg:col-span-2 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Usage</h2>
            <div className="text-[var(--text-secondary)] whitespace-pre-wrap">
              {String(t.usage)}
            </div>
          </div>
        ) : null}

        {/* Meta Information Card */}
        <div
          className={`bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg p-6 ${
            !t.usage ? 'lg:col-span-3' : ''
          }`}
        >
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Information</h2>
          <div className="space-y-3">
            {((t.categories as any[]) || []).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Categories
                </div>
                <div className="flex flex-wrap gap-2">
                  {((t.categories as any[]) || []).map((c) => (
                    <span
                      key={c.id}
                      className="px-2 py-1 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded text-sm"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {((t.roles as any[]) || []).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Roles
                </div>
                <div className="flex flex-wrap gap-2">
                  {((t.roles as any[]) || []).map((r) => (
                    <span
                      key={r.id}
                      className="px-2 py-1 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded text-sm"
                    >
                      {r.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {((t.tags as any[]) || []).length > 0 && (
              <div>
                <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase mb-1">
                  Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {((t.tags as any[]) || []).map((tg) => (
                    <span
                      key={tg.id}
                      className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      #{tg.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Examples Card */}
      {Boolean(t.examples) && (
        <div className="bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">Examples</h2>
          <div className="text-[var(--text-secondary)] whitespace-pre-wrap">
            {String(t.examples)}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg p-6">
        <CommentList toolId={Number(toolId)} currentUserId={user?.id} />
      </div>
    </div>
  );
}

function ToolActions({ tool }: { tool: any }) {
  const { user } = useAuth(false);
  const [deleteTrigger] = useDeleteToolMutation();
  const { addToast } = useToast();

  const canManage = Boolean(
    user &&
      (user.id === (tool.user && tool.user.id) || (user.roles && user.roles.includes('owner'))),
  );

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

  if (!canManage) return null;

  return (
    <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
      <div className="flex gap-2">
        <Link href={`/tools/${tool.id}/edit`}>
          <button className="py-2 px-4 rounded-md border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] hover:bg-[var(--secondary-bg)] transition-colors">
            ✏️ Edit Tool
          </button>
        </Link>
        <button
          onClick={handleDelete}
          className="py-2 px-4 rounded-md border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
        >
          🗑️ Delete Tool
        </button>
      </div>
    </div>
  );
}
