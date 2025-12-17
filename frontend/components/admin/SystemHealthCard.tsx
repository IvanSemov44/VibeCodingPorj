import React, { JSX, useEffect, useState } from 'react';

type Checks = Record<string, any>;

export default function SystemHealthCard(): JSX.Element {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ status?: string; checks?: Checks } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function fetchReady() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ready');
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setError(`status ${res.status}`);
      }
      setData(json);
    } catch (e: any) {
      setError(e?.message ?? 'network error');
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReady();
  }, []);

  const statusColor = (s?: string) => {
    if (s === 'ok') return 'bg-green-100 text-green-800';
    if (s === 'degraded') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-4 rounded-md shadow-sm border" style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">System Health</h3>
        <div className={`inline-flex items-center px-3 py-1 rounded-full ${statusColor(data?.status)}`} style={{ background: data?.status === 'ok' ? 'var(--success)' : data?.status === 'degraded' ? 'var(--alert-warning-bg)' : 'var(--alert-error-bg)', color: data?.status === 'ok' ? '#fff' : 'var(--text-primary)' }}>
          <span className="text-sm font-semibold">{loading ? 'Checking…' : data?.status ?? (error ? 'error' : 'unknown')}</span>
        </div>
      </div>

      {error && (
        <div className="text-sm" style={{ color: 'var(--danger)', marginBottom: 8 }}>Error: {error}</div>
      )}

      <div className="space-y-2">
        {loading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading checks…</div>
        ) : (
          <> 
            {data?.checks ? (
              <ul className="space-y-1">
                {Object.entries(data.checks).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{k.replace('_', ' ')}</span>
                    <span className="font-medium" style={{ color: v === 'ok' ? 'var(--success)' : v === 'not_writable' ? 'var(--alert-warning-text)' : 'var(--danger)' }}>
                      {String(v)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No checks available.</div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={fetchReady}
          className="px-3 py-1 rounded-md text-sm"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Refresh
        </button>
        <a href="/api/health" className="px-3 py-1 text-sm border rounded-md" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>Quick ping</a>
      </div>
    </div>
  );
}
