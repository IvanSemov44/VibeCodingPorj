/**
 * WelcomeHeader Component
 * Displays welcome message with user name
 */

import React from 'react';

interface WelcomeHeaderProps {
  userName: string;
}

export default function WelcomeHeader({ userName }: WelcomeHeaderProps): React.ReactElement {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ margin: 0, marginBottom: 8, fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
        Welcome back, {userName}! 👋
      </h1>
      <p style={{ margin: 0, fontSize: 16, color: 'var(--text-secondary)' }}>
        Here is what is happening with your projects today.
      </p>
    </div>
  );
}
