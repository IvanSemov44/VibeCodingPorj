import React from 'react';
import Link from 'next/link';

export default function StatsCard({
  title,
  value,
  href,
}: {
  title: string;
  value: number | string | undefined;
  href?: string;
}) {
  const inner = (
    <div className="p-4 border border-[var(--border-color)] rounded bg-[var(--card-bg)] hover:shadow cursor-pointer">
      <div className="text-sm text-[var(--text-secondary)]">{title}</div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">
        {(() => {
          if (value !== undefined && value !== null) return value;
          // Default to 0 for user counts to avoid empty UI in dashboard
          if (title.toLowerCase().includes('user')) return 0;
          return '—';
        })()}
      </div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
