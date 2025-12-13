/**
 * TagSelector Component
 * Displays tag options as toggleable buttons
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTags } from '../../../lib/api';
import type { Tag } from '../../../lib/types';

interface TagSelectorProps {
  selectedTags: string[];
  onToggle: (tag: string) => void;
}

export default function TagSelector({ selectedTags, onToggle }: TagSelectorProps): React.ReactElement {
  const { data: tags = [], isLoading, isError } = useQuery<Tag[]>({ queryKey: ['tags'], queryFn: getTags, staleTime: 1000 * 60 * 5 });

  const display: string[] = React.useMemo(() => {
    if (isLoading) return ['loading...'];
    if (isError) return ['error'];
    return tags.map(t => t?.name ?? String(t?.id ?? ''));
  }, [isLoading, isError, tags]);

  return (
    <div>
      <label className="block text-[13px] font-semibold text-secondary-text mb-2">
        Tags (optional)
      </label>
      <div className="flex gap-1.5 flex-wrap">
        {display.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={`px-3 py-1.5 border rounded-md cursor-pointer text-xs font-medium transition-all duration-200 ${
              selectedTags.includes(tag)
                ? 'bg-accent border-accent text-white'
                : 'bg-primary-bg border-border text-secondary-text hover:bg-secondary-bg'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
