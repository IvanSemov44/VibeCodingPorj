import React, { JSX } from 'react';

export function SkeletonCard(): JSX.Element {
  return (
    <div className="animate-pulse p-4 border rounded bg-gray-50 dark:bg-gray-800">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
    </div>
  );
}

export default SkeletonCard;
