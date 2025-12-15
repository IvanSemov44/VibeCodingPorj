import React, { useId } from 'react';
import { useTagMultiSelect } from '../hooks/useTagMultiSelect';

type TagMultiSelectProps = {
  value?: string[];
  onChange: (v: string[]) => void;
  allowCreate?: boolean;
  placeholder?: string;
  options?: (string | { name: string })[] | null;
  maxTags?: number;
  maxTagLength?: number;
  tagPattern?: RegExp;
  onError?: (message: string) => void;
  id?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export default function TagMultiSelect({
  value = [],
  onChange,
  allowCreate = true,
  placeholder = 'Add tags...',
  options: externalOptions = null,
  maxTags = 10,
  maxTagLength = 50,
  tagPattern = /^[a-zA-Z0-9\s\-_]+$/,
  onError,
  id,
  label,
  className = '',
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: TagMultiSelectProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const listId = useId();
  const statusId = useId();

  const {
    input,
    setInput,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    options,
    filteredList,
    ref,
    inputRef,
    addTag,
    removeTag,
    handleKey,
    isLoading,
  } = useTagMultiSelect({
    value,
    onChange,
    allowCreate,
    options: externalOptions,
    maxTags,
    maxTagLength,
    tagPattern,
    onError,
  });

  return (
    <div ref={ref} className={`relative w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium mb-1">
          {label}
        </label>
      )}

      <div id={statusId} role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {`${value.length} tag${value.length !== 1 ? 's' : ''} selected`}
      </div>
      <div
        className="min-h-[42px] w-full flex flex-wrap items-center gap-2 px-3 py-2 bg-primary-bg border border-border rounded-lg cursor-text transition-colors hover:border-accent focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        aria-haspopup="listbox"
      >
        {value.map((tag) => (
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
                removeTag(tag);
              }}
              className="bg-transparent border-none text-accent cursor-pointer text-base leading-none transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 rounded"
            >
              ×
            </button>
          </div>
        ))}

        <div className="relative flex-1">
          <input
            id={inputId}
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setOpen(true);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKey}
            placeholder={placeholder}
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            role="combobox"
            aria-activedescendant={
              open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
            }
            aria-describedby={statusId}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            disabled={disabled}
            className="w-full min-w-[120px] bg-transparent border-none outline-none text-sm text-primary-text placeholder:text-secondary-text focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
          />
          {isLoading && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <svg
                className="animate-spin h-4 w-4 text-accent"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {open && (filteredList.length > 0 || (allowCreate && input.trim() !== '')) && (
        <div
          role="listbox"
          id={listId}
          className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-primary-bg border border-border rounded-lg shadow-lg z-10"
        >
          {filteredList.map((s, idx) => (
            <div
              key={s}
              id={`${listId}-option-${idx}`}
              role="option"
              aria-selected={activeIndex === idx}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseDown={(e) => {
                e.preventDefault(); /* prevent blur before click */
              }}
              onClick={() => addTag(s)}
              className={`px-3 py-2 text-sm text-primary-text cursor-pointer transition-colors ${
                activeIndex === idx ? 'bg-accent/10 text-accent' : 'hover:bg-secondary-bg'
              }`}
            >
              {s}
            </div>
          ))}
          {allowCreate &&
            input.trim() !== '' &&
            !options.map((o) => o.toLowerCase()).includes(input.trim().toLowerCase()) && (
              <div
                role="option"
                aria-selected={activeIndex === filteredList.length}
                onMouseEnter={() => setActiveIndex(filteredList.length)}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => addTag(input.trim())}
                className="px-3 py-2 text-sm text-accent font-medium cursor-pointer border-t border-border bg-accent/5 hover:bg-accent/10 transition-colors"
              >
                {`Create "${input.trim()}"`}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
