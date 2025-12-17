import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

const navItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/tools', label: 'Tools', icon: '🛠️' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/activity', label: 'Activity Logs', icon: '📋' },
];

export default function AdminNav() {
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(href);
  };

  return (
    <nav className="border-b border-[var(--border-color)] mb-6">
      <div className="flex gap-1 overflow-x-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2
                transition-colors whitespace-nowrap
                ${
                  active
                    ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--secondary-bg)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--secondary-bg)]'
                }
              `}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
