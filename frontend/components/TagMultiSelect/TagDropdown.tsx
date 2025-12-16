/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useTagMultiSelectContext } from './context';

type TagDropdownProps = {
  children?: (option: string, idx: number, active: boolean, select: () => void) => React.ReactNode;
};

export function TagDropdown({ children }: TagDropdownProps) {
  const ctx = useTagMultiSelectContext();

  if (!ctx.open) return null;

  const listId = ctx.listId || 'tag-suggestions';

  const renderOption = (s: string, idx: number) => {
    const active = ctx.activeIndex === idx;
    const select = () => ctx.addTag(s);
    return children ? (
      <React.Fragment key={s}>{children(s, idx, active, select)}</React.Fragment>
    ) : (
      <div
        key={s}
        id={`${listId}-option-${idx}`}
        role="option"
        aria-selected={active}
        onMouseEnter={() => ctx.setActiveIndex(idx)}
        onMouseDown={(e) => e.preventDefault()}
        onClick={select}
        className={`px-3 py-2 text-sm text-primary-text cursor-pointer transition-colors ${
          active ? 'bg-accent/10 text-accent' : 'hover:bg-secondary-bg'
        }`}
      >
        {s}
      </div>
    );
  };

  return (
    <div
      role="listbox"
      id={listId}
      ref={ctx.floatingRefs?.setFloating as any}
      style={{ ...(ctx.floatingStyles || {}), minWidth: '220px', zIndex: 9999 }}
      className="mt-1 bg-primary-bg border border-border rounded-lg shadow-lg"
    >
      {ctx.filteredList.length > (ctx.virtualizeThreshold || 100) && ctx.virtualizer ? (
        <div ref={ctx.parentRef as any} className="max-h-60 overflow-y-auto relative">
          <div style={{ height: `${ctx.virtualizer.getTotalSize()}px`, position: 'relative' }}>
            {ctx.virtualizer.getVirtualItems().map((virtualRow: any) => {
              const idx = virtualRow.index;
              const s = ctx.filteredList[idx];
              return (
                <div
                  key={s}
                  id={`${listId}-option-${idx}`}
                  role="option"
                  aria-selected={ctx.activeIndex === idx}
                  onMouseEnter={() => ctx.setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => ctx.addTag(s)}
                  className={`absolute left-0 w-full px-3 py-2 text-sm text-primary-text cursor-pointer transition-colors ${
                    ctx.activeIndex === idx ? 'bg-accent/10 text-accent' : 'hover:bg-secondary-bg'
                  }`}
                  style={{
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {s}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto">
          {ctx.filteredList.map((s, idx) => renderOption(s, idx))}
        </div>
      )}

      {ctx.allowCreate &&
        ctx.input.trim() !== '' &&
        !ctx.options.map((o) => o.toLowerCase()).includes(ctx.input.trim().toLowerCase()) &&
        (children ? (
          <React.Fragment key="__create">
            {children(
              ctx.input.trim(),
              ctx.filteredList.length,
              ctx.activeIndex === ctx.filteredList.length,
              () => ctx.addTag(ctx.input.trim()),
            )}
          </React.Fragment>
        ) : (
          <div
            role="option"
            aria-selected={ctx.activeIndex === ctx.filteredList.length}
            onMouseEnter={() => ctx.setActiveIndex(ctx.filteredList.length)}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => ctx.addTag(ctx.input.trim())}
            className="px-3 py-2 text-sm text-accent font-medium cursor-pointer border-t border-border bg-accent/5 hover:bg-accent/10 transition-colors"
          >
            {`Create "${ctx.input.trim()}"`}
          </div>
        ))}
    </div>
  );
}
