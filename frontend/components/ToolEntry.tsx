import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDeleteToolMutation } from '../store/domains';
import { useAuth } from '../hooks/useAuth';
import type { Tool } from '../lib/types';

interface Props {
  tool: Tool;
  onDeleted?: (id: string | number) => void;
}

export default function ToolEntry({ tool, onDeleted }: Props): React.ReactElement {
  // router not used here

  const [deleteTrigger] = useDeleteToolMutation();
  const { user } = useAuth(false);

  const canManage = Boolean(
    user && (user.id === (tool.user && (tool.user as Record<string, unknown>).id) || (user.roles && user.roles.includes('owner')))
  );

  const handleDelete = async () => {
    if (!confirm('Delete this tool?')) return;
    try {
      await deleteTrigger(tool.id).unwrap();
      if (onDeleted) onDeleted(tool.id);
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };
  return (
    <div className="bg-[var(--card-bg)] border border-border rounded-xl p-4 transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {tool.screenshots && tool.screenshots[0] ? (
            <Image
              src={tool.screenshots[0]}
              alt="thumb"
              width={96}
              height={64}
              className="rounded-lg object-cover flex-shrink-0"
            />
          ) : null}
          <div className="flex-1 min-w-0">
            <div className="mb-1">
              <Link
                href={`/tools/${tool.id}`}
                className="text-lg font-semibold text-primary-text hover:text-accent transition-colors no-underline"
              >
                {tool.name ?? `Tool ${tool.id}`}
              </Link>
            </div>
            <div className="text-sm text-secondary-text line-clamp-2">{tool.description ?? ''}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {tool.url ? (
            <a
              className="px-3 py-1.5 text-sm font-medium text-accent hover:text-accent-hover no-underline transition-colors"
              href={tool.url}
              target="_blank"
              rel="noreferrer"
            >
              Visit
            </a>
          ) : (
            <span className="px-3 py-1.5 text-sm font-medium text-tertiary-text">Visit</span>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="mt-3 flex items-center justify-end gap-2">
          <Link href={`/tools/${tool.id}/edit`}>
            <button className="px-3 py-1 text-sm rounded-md border border-transparent bg-accent text-white hover:bg-accent-hover transition-colors">
              Edit
            </button>
          </Link>
          <button
            onClick={handleDelete}
            className="px-3 py-1 text-sm rounded-md border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
