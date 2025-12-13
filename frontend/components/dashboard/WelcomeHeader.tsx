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
    <div className="mb-8">
      <h1 className="m-0 mb-2 text-4xl font-bold text-primary-text">
        Welcome back, {userName}! 👋
      </h1>
      <p className="m-0 text-base text-secondary-text">
        Here is what is happening with your projects today.
      </p>
    </div>
  );
}
