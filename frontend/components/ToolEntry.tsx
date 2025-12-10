import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { deleteTool } from '../lib/api';
import type { Tool } from '../lib/types';

interface Props {
  tool: Tool;
  onDeleted?: (id: string | number) => void;
}

export default function ToolEntry({ tool, onDeleted }: Props): React.ReactElement {
  // router not used here

  const handleDelete = async () => {
    if (!confirm('Delete this tool?')) return;
    try {
      await deleteTool(tool.id);
      if (onDeleted) onDeleted(tool.id);
    } catch (err) {
       
      console.error(err);
       
      alert('Failed to delete');
    }
  };

  return (
    <div style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {tool.screenshots && tool.screenshots[0] ? (
            <Image src={tool.screenshots[0]} alt="thumb" width={96} height={64} style={{ objectFit: 'cover', borderRadius: 6 }} />
          ) : null}
          <div>
            <div style={{ fontWeight: 700 }}>
              <Link href={`/tools/${tool.id}`}>{tool.name ?? `Tool ${tool.id}`}</Link>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{tool.description ?? ''}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tool.url ? (
            <a href={tool.url} target="_blank" rel="noreferrer">Visit</a>
          ) : (
            <span style={{ color: 'var(--text-tertiary)' }}>Visit</span>
          )}
          <Link href={`/tools/${tool.id}/edit`}><button style={{ padding: '6px 10px' }}>Edit</button></Link>
          <button onClick={handleDelete} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', borderRadius: 6 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
