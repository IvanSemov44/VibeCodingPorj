import React from 'react';

interface Props {
  tool: any;
  onApprove: (id: number | string) => Promise<void>;
  onRequestReject?: (tool: any) => void;
  isAdmin?: boolean;
}

export default function ToolApprovalCard({ tool, onApprove, onRequestReject, isAdmin = false }: Props) {
  return (
    <div className="border rounded p-4 bg-white">
      <h3 className="text-lg font-semibold">{tool.name}</h3>
      <div className="text-sm text-secondary-text">By: {tool.user?.name ?? tool.author_name}</div>
      <p className="mt-2 text-sm text-secondary-text line-clamp-3">{tool.description}</p>
      <div className="mt-3 flex gap-2 items-center">
        {isAdmin ? (
          <>
            <button onClick={() => onApprove(tool.id)} className="px-3 py-1 bg-green-500 text-white rounded">
              Approve
            </button>
            <button
              onClick={() => onRequestReject && onRequestReject(tool)}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              Reject
            </button>
          </>
        ) : (
          <span className="text-sm text-tertiary-text">Pending review</span>
        )}
        <a href={`/tools/${tool.slug ?? tool.id}`} className="ml-auto text-sm text-primary">
          View Details
        </a>
      </div>
    </div>
  );
}
