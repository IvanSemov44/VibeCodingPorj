import Link from 'next/link';
import { useRouter } from 'next/router';
import { deleteTool } from '../lib/api';

export default function ToolEntry({ tool, onDeleted }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Delete this tool?')) return;
    try {
      const res = await deleteTool(tool.id);
      if (res.ok) {
        if (onDeleted) onDeleted(tool.id);
      } else {
        alert('Failed to delete');
      }
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
            <img src={tool.screenshots[0]} alt="thumb" style={{ width: 96, height: 64, objectFit: 'cover', borderRadius: 6 }} />
          ) : null}
          <div>
            <div style={{ fontWeight: 700 }}>
              <Link href={`/tools/${tool.id}`}>{tool.name}</Link>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{tool.description}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={tool.url} target="_blank" rel="noreferrer">Visit</a>
          <Link href={`/tools/${tool.id}/edit`}><button style={{ padding: '6px 10px' }}>Edit</button></Link>
          <button onClick={handleDelete} style={{ padding: '6px 10px', background: '#ef4444', color: 'white', borderRadius: 6 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}
