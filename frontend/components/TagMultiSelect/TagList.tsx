import React from 'react';
import { useTagMultiSelectContext } from './context';

type TagListProps = {
  children?: (tag: string, idx: number, remove: (t: string) => void) => React.ReactNode;
};

export function TagList({ children }: TagListProps) {
  const ctx = useTagMultiSelectContext();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {ctx.value.map((tag, idx) =>
        children ? (
          <React.Fragment key={tag}>{children(tag, idx, ctx.removeTag)}</React.Fragment>
        ) : (
          <div
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-md text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => ctx.removeTag(tag)}
              className="bg-transparent border-none text-accent cursor-pointer text-base leading-none"
            >
              ×
            </button>
          </div>
        ),
      )}
    </div>
  );
}
