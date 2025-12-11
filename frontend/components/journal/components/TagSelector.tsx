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
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
        Tags (optional)
      </label>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {display.map(tag => (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            style={{
              padding: '6px 12px',
              background: selectedTags.includes(tag) ? 'var(--accent-primary)' : 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 500,
              color: selectedTags.includes(tag) ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
