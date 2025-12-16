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
  const displayValue = (() => {
    if (value !== undefined && value !== null) return value;
    if (title.toLowerCase().includes('user')) return 0;
    return '—';
  })();

  const inner = (
    <div className="relative overflow-hidden rounded-lg shadow-lg transform hover:-translate-y-1 transition p-5 bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-800/30 border border-transparent">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-1 text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-gray-100">{displayValue}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold shadow-sm">{String(displayValue).slice(0,1)}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-gray-400">Manage: {title}</div>
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
