import React from 'react';
import Link from 'next/link';

type FeatureProps = { title: string; desc: string };

export default function Home(): React.ReactElement {
  return (
    <section className="grid grid-cols-1 gap-6">
      <div className="flex gap-6 items-center flex-wrap lg:flex-nowrap">
        <div className="flex-1">
          <h2 className="text-[38px] m-0 mb-3 text-primary-text">Build faster. Ship smarter.</h2>
          <p className="m-0 mb-5 text-secondary-text max-w-[680px]">
            A minimal full-stack starter kit with Laravel API and Next.js frontend — authentication,
            permissions, and a lightweight developer experience.
          </p>
          <div className="flex gap-3">
            <Link
              href="/register"
              className="py-3 px-[18px] bg-accent text-white rounded-lg no-underline font-semibold transition-colors hover:bg-accent-hover"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="py-3 px-[18px] bg-transparent text-primary-text rounded-lg no-underline font-semibold border border-border transition-all hover:border-accent hover:text-accent"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-[360px] h-[220px] rounded-xl bg-secondary-bg flex items-center justify-center shadow-lg border border-border transition-all duration-300 hover:shadow-xl">
          <div className="text-center">
            <div className="text-[40px] font-bold text-primary-text">VC</div>
            <div className="text-secondary-text mt-2">Starter Kit</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <Feature
          title="Auth + Roles"
          desc="Cookie-based SPA auth (Laravel Sanctum) and role-based access with Spatie."
        />
        <Feature
          title="Next.js Frontend"
          desc="Pages router scaffolded, login and dashboard pages ready."
        />
        <Feature
          title="Local Dev"
          desc="Docker Compose stack with MySQL, Redis and PHP-FPM for quick iteration."
        />
      </div>
    </section>
  );
}

function Feature({ title, desc }: FeatureProps): React.ReactElement {
  return (
    <div className="p-[18px] rounded-[10px] bg-[var(--card-bg)] shadow-md border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="m-0 text-base text-primary-text">{title}</h3>
      <p className="mt-2 text-secondary-text text-sm">{desc}</p>
    </div>
  );
}
