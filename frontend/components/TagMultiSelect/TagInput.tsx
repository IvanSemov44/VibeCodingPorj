import React from 'react';
import { useTagMultiSelectContext } from './context';

type TagInputProps = {
  children?: (tag: string, idx: number, remove: (t: string) => void) => React.ReactNode;
};

export function TagInput({ children }: TagInputProps) {
  const ctx = useTagMultiSelectContext();

  return (
    <div
      onClick={() => {
        ctx.setOpen(true);
        ctx.inputRef?.current?.focus();
      }}
      className="min-h-[42px] w-full flex flex-wrap items-center gap-2 px-3 py-2 bg-primary-bg border border-border rounded-lg cursor-text transition-colors hover:border-accent focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
      aria-haspopup="listbox"
    >
      {ctx.value.map((tag, idx) =>
        children ? (
          <React.Fragment key={tag}>{children(tag, idx, ctx.removeTag)}</React.Fragment>
        ) : (
          <div
            key={tag}
            tabIndex={0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-md text-sm font-medium focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          >
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                ctx.removeTag(tag);
              }}
              className="bg-transparent border-none text-accent cursor-pointer text-base leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
            >
              ×
            </button>
          </div>
        ),
      )}

      <div className="relative flex-1">
        <input
          ref={ctx.inputRef}
          id={ctx.inputId}
          value={ctx.input}
          onChange={(e) => {
            ctx.setInput(e.target.value);
            ctx.setOpen(true);
            ctx.setActiveIndex(-1);
          }}
          onKeyDown={ctx.handleKey}
          placeholder="Add tags..."
          aria-expanded={ctx.open}
          aria-controls={ctx.listId}
          aria-autocomplete="list"
          role="combobox"
          aria-activedescendant={
            ctx.open && ctx.activeIndex >= 0 ? `${ctx.listId}-option-${ctx.activeIndex}` : undefined
          }
          className="w-full min-w-[120px] bg-transparent border-none outline-none text-sm text-primary-text placeholder:text-secondary-text focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        />
      </div>
    </div>
  );
}
