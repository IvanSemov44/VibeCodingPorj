import React, { JSX, useState } from 'react';
import { useGetSystemReadyQuery } from '../../store/domains';
import * as api from '../../lib/api';

const statusColor = (s?: string) => {
  if (s === 'ok') return 'bg-[var(--success)]';
  if (s === 'degraded') return 'bg-[var(--alert-warning)]';
  return 'bg-[var(--danger)]';
};

export default function SystemHealthCard(): JSX.Element {
  const { data, error, isLoading, refetch } = useGetSystemReadyQuery();
  const [pinging, setPinging] = useState(false);
  const [lastPing, setLastPing] = useState<string | undefined>(undefined);

  const onQuickPing = async () => {
    setPinging(true);
    try {
      const res = await api.getHealth();
      // prefer server-provided time if available
      const time = (res && (res.time || res.timestamp)) || new Date().toISOString();
      setLastPing(String(time));
    } catch (err: any) {
      setLastPing(String(err?.message ?? err ?? 'error'));
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="p-4 rounded-md border" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium">System Health</h3>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full ${statusColor(data?.status)}`}
          style={{ color: data?.status === 'ok' ? '#fff' : 'var(--text-primary)' }}
        >
          <span className="text-sm font-semibold">
            {isLoading ? 'Checking…' : data?.status ?? (error ? 'error' : 'unknown')}
          </span>
        </div>
      </div>

      {error && (
        <div className="text-sm" style={{ color: 'var(--danger)', marginBottom: 8 }}>
          Error: {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <div className="space-y-2">
        {isLoading ? (
          <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Loading checks…
          </div>
        ) : (
          <>
            {data?.checks ? (
              <ul className="space-y-1">
                {Object.entries(data.checks).map(([k, v]) => (
                  <li key={k} className="flex items-center justify-between text-sm">
                    <span className="capitalize">{k.replace('_', ' ')}</span>
                    <span
                      className="font-medium"
                      style={{
                        color:
                          v === 'ok'
                            ? 'var(--success)'
                            : v === 'not_writable'
                            ? 'var(--alert-warning-text)'
                            : 'var(--danger)',
                      }}
                    >
                      {String(v)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                No checks available.
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => refetch()}
          className="px-3 py-1 rounded-md text-sm"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          Refresh
        </button>
        <button
          onClick={onQuickPing}
          disabled={pinging}
          className="px-3 py-1 text-sm border rounded-md"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
        >
          {pinging ? 'Pinging…' : 'Quick ping'}
        </button>
        {lastPing && (
          <div className="text-xs text-[var(--text-secondary)] self-center">Last: {lastPing}</div>
        )}
      </div>
    </div>
  );
}
