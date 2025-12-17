import React, { JSX, useEffect, useState } from 'react';

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Read stored theme and mark mounted on client only
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (stored) setTheme(stored);
    } catch {}
    setMounted(true);
  }, []);

  // Apply theme attributes when theme changes (client only)
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme, mounted]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      className="px-3 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--secondary-bg-hover)] text-sm"
    >
      {mounted ? (theme === 'light' ? '🌞 Light' : '🌙 Dark') : 'Theme'}
    </button>
  );
}
