import React, { useEffect, useState } from 'react';

export default function ThemeToggle(): JSX.Element {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // also toggle .dark class for compatibility with Tailwind's class strategy
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      className="px-3 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--secondary-bg-hover)] text-sm"
    >
      {theme === 'light' ? '🌞 Light' : '🌙 Dark'}
    </button>
  );
}
