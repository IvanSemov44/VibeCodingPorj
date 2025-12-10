import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getTool } from '../../../lib/api';
import Link from 'next/link';

export default function ToolDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await getTool(id);
        if (res.ok) {
          const json = await res.json();
          setTool(json.data || json);
          setError('');
        } else if (res.status === 404) {
          setError('Not found');
        } else {
          setError('Failed to load tool');
        }
      } catch (err) {
        console.error(err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div style={{ maxWidth: 900, margin: '24px auto' }}>Loading...</div>;
  if (error) return <div style={{ maxWidth: 900, margin: '24px auto' }}>{error}</div>;
  if (!tool) return null;

  return (
    <div style={{ maxWidth: 900, margin: '24px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>{tool.name}</h1>
          <div style={{ color: '#6b7280' }}>{tool.description}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href={tool.url} target="_blank" rel="noreferrer"><button style={{ padding: '8px 12px' }}>Visit</button></a>
          <Link href={`/tools/${tool.id}/edit`}><button style={{ padding: '8px 12px' }}>Edit</button></Link>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Documentation:</strong> {tool.docs_url ? <a href={tool.docs_url} target="_blank" rel="noreferrer">Open docs</a> : '—'}
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Usage</strong>
        <div style={{ marginTop: 8 }}>{tool.usage || '—'}</div>
      </div>

      {tool.examples && (
        <div style={{ marginTop: 16 }}>
          <strong>Examples</strong>
          <div style={{ marginTop: 8 }}>{tool.examples}</div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <strong>Categories</strong>
        <div style={{ marginTop: 8 }}>{(tool.categories || []).map(c => c.name).join(', ') || '—'}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Roles</strong>
        <div style={{ marginTop: 8 }}>{(tool.roles || []).map(r => r.name).join(', ') || '—'}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Tags</strong>
        <div style={{ marginTop: 8 }}>{(tool.tags || []).map(t => t.name).join(', ') || '—'}</div>
      </div>

      {tool.screenshots && tool.screenshots.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <strong>Screenshots</strong>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {tool.screenshots.map(s => (
              <img key={s} src={s} alt="screenshot" style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
