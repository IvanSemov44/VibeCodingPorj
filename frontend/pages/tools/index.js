import { useEffect, useState } from 'react';
import { getTools } from '../../lib/api';
import Link from 'next/link';

export default function ToolsIndex() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getTools();
      if (res.ok) {
        const data = await res.json();
        setTools(data.data || data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: '24px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>AI Tools</h1>
        <Link href="/tools/new"><button style={{ padding: '8px 12px', borderRadius: 6, background: '#2563eb', color: '#fff' }}>Add Tool</button></Link>
      </div>

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        <input placeholder="Search by name..." value={q} onChange={e => setQ(e.target.value)} style={{ width: '100%', padding: 8 }} />
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : tools.length === 0 ? (
        <div>No tools yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {tools.map(t => (
            <div key={t.id} style={{ padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{t.description}</div>
                </div>
                <div>
                  <a href={t.url} target="_blank" rel="noreferrer">Visit</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
