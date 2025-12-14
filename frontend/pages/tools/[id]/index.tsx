import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { useGetToolQuery } from '../../../store/api';

type Category = { id: number; name: string };
type Role = { id: number; name: string };
type Tag = { id: number; name: string };

type Tool = {
  id: number | string;
  name?: string;
  description?: string;
  url?: string;
  docs_url?: string | null;
  usage?: string | null;
  examples?: string | null;
  categories?: Category[];
  roles?: Role[];
  tags?: Tag[];
  screenshots?: string[];
};

export default function ToolDetailPage(): React.ReactElement | null {
  const router = useRouter();
  const { id } = router.query;
  const toolId = Array.isArray(id) ? id[0] : id;
  const { data: tool, isLoading, error } = useGetToolQuery(toolId as string | number | undefined, {
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

  return (
    <div className="max-w-[900px] my-6 mx-auto">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="m-0">{tool.name}</h1>
          <div className="text-gray-500">{tool.description}</div>
        </div>
        <div className="flex gap-2">
          <a href={tool.url} target="_blank" rel="noreferrer">
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
        {tool.docs_url ? (
          <a
            href={tool.docs_url}
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
        <div className="mt-2">{tool.usage || '—'}</div>
      </div>

      {tool.examples && (
        <div className="mt-4">
          <strong>Examples</strong>
          <div className="mt-2">{tool.examples}</div>
        </div>
      )}

      <div className="mt-4">
        <strong>Categories</strong>
        <div className="mt-2">{(tool.categories || []).map((c) => c.name).join(', ') || '—'}</div>
      </div>

      <div className="mt-4">
        <strong>Roles</strong>
        <div className="mt-2">{(tool.roles || []).map((r) => r.name).join(', ') || '—'}</div>
      </div>

      <div className="mt-4">
        <strong>Tags</strong>
        <div className="mt-2">{(tool.tags || []).map((t) => t.name).join(', ') || '—'}</div>
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
