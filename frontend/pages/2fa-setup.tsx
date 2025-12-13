import React from 'react';
import dynamic from 'next/dynamic';

// Load component dynamically to avoid SSR issues with canvas
const TwoFactorSetup = dynamic(() => import('../components/TwoFactorSetup'), { ssr: false });

export default function TwoFactorSetupPage() {
  return (
    <main className="p-6">
      <h1>Two-Factor Setup</h1>
      <TwoFactorSetup />
    </main>
  );
}
