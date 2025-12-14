import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useGetToolQuery } from '../../../store/api2';

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

  if (isLoading) return <div className="max-w-[900px] my-6 mx-auto">Loading...</div>;
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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="m-0">{name}</h1>
          <div className="text-gray-500">{description}</div>
        </div>
        <div className="flex gap-2">
          <a href={url} target="_blank" rel="noreferrer">
            <button className="py-2 px-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              Visit
            </button>
          </a>
          <Link href={`/tools/${tool.id}/edit`}>
            <button className="py-2 px-3 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
              Edit
            </button>
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <strong>Documentation:</strong>{' '}
        {t.docs_url ? (
          <a
            href={t.docs_url as string}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            Open docs
          </a>
        ) : (
          '—'
        )}
      </div>

      <div className="mt-4">
        <strong>Usage</strong>
        <div className="mt-2">{t.usage ? String(t.usage) : '—'}</div>
      </div>

      {Boolean(t.examples) && (
        <div className="mt-4">
          <strong>Examples</strong>
          <div className="mt-2">{String(t.examples)}</div>
        </div>
      )}

      <div className="mt-4">
        <strong>Categories</strong>
        <div className="mt-2">
          {((t.categories as unknown as Array<{ name?: string }>) || [])
            .map((c) => c.name)
            .join(', ') || '—'}
        </div>
      </div>

      <div className="mt-4">
        <strong>Roles</strong>
        <div className="mt-2">
          {((t.roles as unknown as Array<{ name?: string }>) || []).map((r) => r.name).join(', ') ||
            '—'}
        </div>
      </div>

      <div className="mt-4">
        <strong>Tags</strong>
        <div className="mt-2">
          {((t.tags as unknown as Array<{ name?: string }>) || [])
            .map((t2) => t2.name)
            .join(', ') || '—'}
        </div>
      </div>

      {tool.screenshots && tool.screenshots.length > 0 && (
        <div className="mt-5">
          <strong>Screenshots</strong>
          <div className="flex gap-2 mt-2 flex-wrap">
            {tool.screenshots.map((s) => (
              <Image
                key={s}
                src={s}
                alt="screenshot"
                width={240}
                height={160}
                className="object-cover rounded-md border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
