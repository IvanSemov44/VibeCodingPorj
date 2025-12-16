import React from 'react';

export type FeatureProps = { title: string; desc: string };

export default function Feature({ title, desc }: FeatureProps): React.ReactElement {
  return (
    <div className="p-[18px] rounded-[10px] bg-[var(--card-bg)] shadow-md border border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <h3 className="m-0 text-base text-primary-text">{title}</h3>
      <p className="mt-2 text-secondary-text text-sm">{desc}</p>
    </div>
  );
}
