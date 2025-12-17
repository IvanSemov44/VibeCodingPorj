import React, { JSX } from 'react';

export function SkeletonTableRow(): JSX.Element {
  return (
    <tr className="animate-pulse">
      <td className="py-2 px-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
      </td>
      <td className="py-2 px-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40" />
      </td>
      <td className="py-2 px-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </td>
    </tr>
  );
}

export default SkeletonTableRow;
