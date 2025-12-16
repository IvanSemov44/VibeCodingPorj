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
    <div className="p-4 border rounded bg-white hover:shadow cursor-pointer">
      <div className="text-sm text-secondary-text">{title}</div>
      <div className="text-2xl font-bold">{value ?? '—'}</div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
