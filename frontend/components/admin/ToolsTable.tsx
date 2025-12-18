import React from 'react';
import type { Tool } from '../../lib/types';

interface ToolsTableProps {
  tools: Tool[];
  isAdmin: boolean | undefined;
  onRequestApprove: (tool: Tool) => void;
  onRequestReject: (tool: Tool) => void;
}

export const ToolsTable: React.FC<ToolsTableProps> = ({
  tools,
  isAdmin,
  onRequestApprove,
  onRequestReject,
}) => {
  const getOwnerName = (tool: Tool): string => {
    return tool.user?.name ?? tool.author_name ?? 'Unknown';
  };

  const getStatus = (tool: Tool): string => {
    return tool.status ?? (tool.is_approved ? 'Approved' : 'Unknown');
  };

  const isPending = (tool: Tool): boolean => {
    return tool.status === 'pending' || tool.is_pending === true;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-[var(--card-bg)] border border-[var(--border-color)]">
        <thead>
          <tr className="bg-[var(--secondary-bg)]">
            <th className="p-2 text-left text-[var(--text-primary)]">Name</th>
            <th className="p-2 text-left text-[var(--text-primary)]">Owner</th>
            <th className="p-2 text-left text-[var(--text-primary)]">Status</th>
            <th className="p-2 text-left text-[var(--text-primary)]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((t: Tool) => (
            <tr key={t.id} className="border-t border-[var(--border-color)]">
              <td className="p-2 text-[var(--text-primary)]">{t.name}</td>
              <td className="p-2 text-[var(--text-primary)]">{getOwnerName(t)}</td>
              <td className="p-2 text-[var(--text-primary)]">{getStatus(t)}</td>
              <td className="p-2">
                <a
                  href={`/tools/${t.slug ?? t.id}`}
                  className="text-[var(--accent)] mr-2 hover:underline"
                >
                  View
                </a>
                {isPending(t) ? (
                  isAdmin ? (
                    <>
                      <button
                        className="ml-2 px-2 py-1 bg-[var(--accent)] text-white rounded hover:bg-[var(--accent-hover)]"
                        onClick={() => onRequestApprove(t)}
                      >
                        Approve
                      </button>
                      <button
                        className="ml-2 px-2 py-1 bg-[var(--danger)] text-white rounded hover:bg-[var(--danger-hover)]"
                        onClick={() => onRequestReject(t)}
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="ml-2 text-sm text-[var(--text-secondary)]">Pending</span>
                  )
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
