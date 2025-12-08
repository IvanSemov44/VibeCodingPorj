import Link from 'next/link';

export default function Home() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 38, margin: '0 0 12px', color: 'var(--text-primary)' }}>Build faster. Ship smarter.</h2>
          <p style={{ margin: '0 0 20px', color: 'var(--text-secondary)', maxWidth: 680 }}>A minimal full-stack starter kit with Laravel API and Next.js frontend — authentication, permissions, and a lightweight developer experience.</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/register" style={{ padding: '12px 18px', background: 'var(--accent-primary)', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}>Get Started</Link>
            <Link href="/login" style={{ padding: '12px 18px', background: 'transparent', color: 'var(--text-primary)', borderRadius: 8, textDecoration: 'none', fontWeight: 600, border: '1px solid var(--border-color)', transition: 'all 0.2s' }}>Sign In</Link>
          </div>
        </div>
        <div style={{ width: 360, height: 220, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)' }}>VC</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Starter Kit</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <Feature title="Auth + Roles" desc="Cookie-based SPA auth (Laravel Sanctum) and role-based access with Spatie." />
        <Feature title="Next.js Frontend" desc="Pages router scaffolded, login and dashboard pages ready." />
        <Feature title="Local Dev" desc="Docker Compose stack with MySQL, Redis and PHP-FPM for quick iteration." />
      </div>
    </section>
  );
}

function Feature({ title, desc }) {
  return (
    <div style={{ padding: 18, borderRadius: 10, background: 'var(--card-bg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }}>
      <h3 style={{ margin: 0, fontSize: 16, color: 'var(--text-primary)' }}>{title}</h3>
      <p style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 14 }}>{desc}</p>
    </div>
  );
}
