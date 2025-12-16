import React from 'react';

export default function StatsCard({ title, value }: { title: string; value: number | string | undefined }) {
  return (
    <div className="p-4 border rounded bg-white">
      <div className="text-sm text-secondary-text">{title}</div>
      <div className="text-2xl font-bold">{value ?? '—'}</div>
    </div>
  );
}
