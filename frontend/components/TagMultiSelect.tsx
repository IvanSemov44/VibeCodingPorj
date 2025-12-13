import React, { useEffect, useRef, useState } from 'react';
import { getTags } from '../lib/api';

type ExternalOption = string | { name?: string };

type TagMultiSelectProps = {
  value?: string[];
  onChange: (v: string[]) => void;
  allowCreate?: boolean;
  placeholder?: string;
  options?: ExternalOption[] | null;
};

export default function TagMultiSelect({
  value = [],
  onChange,
  allowCreate = true,
  placeholder = 'Add tags...',
  options: externalOptions = null,
}: TagMultiSelectProps) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listId = 'tag-suggestions';

  useEffect(() => {
    if (externalOptions && Array.isArray(externalOptions)) {
      const names = externalOptions
        .map((o) => (typeof o === 'string' ? o : o.name || ''))
        .filter(Boolean) as string[];
      setOptions(names);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const list = await getTags();
        if (!mounted) return;
        setOptions(list.map((t) => t.name));
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [externalOptions]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = (): string[] => {
    const q = input.trim().toLowerCase();
    if (q === '') return options.filter((o) => !value.includes(o)).slice(0, 10);
    return options.filter((o) => o.toLowerCase().includes(q) && !value.includes(o)).slice(0, 10);
  };

  const addTag = (tag: string) => {
    const t = tag.trim();
    if (!t) return;
    if (value.includes(t)) {
      setInput('');
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    onChange([...value, t]);
    setInput('');
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const list = filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((prev) => Math.min(prev + 1, list.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (open && activeIndex >= 0 && activeIndex < list.length) {
        addTag(list[activeIndex]);
      } else {
        const tok = input.replace(/,$/, '');
        if (tok) addTag(tok);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === ',') {
      e.preventDefault();
      const tok = input.replace(/,$/, '');
      if (tok) addTag(tok);
    } else if (e.key === 'Backspace' && input === '') {
      if (value.length > 0) removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const list = filtered();
    if (list.length === 0) setActiveIndex(-1);
    else if (activeIndex >= list.length) setActiveIndex(list.length - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, options, value]);

  return (
    <div ref={ref} className="relative w-full">
      <div
        className="min-h-[42px] w-full flex flex-wrap items-center gap-2 px-3 py-2 bg-primary-bg border border-border rounded-lg cursor-text transition-colors hover:border-accent focus-within:border-accent"
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
        aria-haspopup="listbox"
      >
        {value.map((tag) => (
          <div
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent/10 text-accent rounded-md text-sm font-medium"
          >
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="bg-transparent border-none text-accent cursor-pointer text-base leading-none transition-opacity hover:opacity-70"
            >
              ×
            </button>
          </div>
        ))}

        <input
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
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-primary-text placeholder:text-secondary-text"
        />
      </div>

      {open && (filtered().length > 0 || (allowCreate && input.trim() !== '')) && (
        <div
          role="listbox"
          id={listId}
          className="absolute top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-primary-bg border border-border rounded-lg shadow-lg z-10"
        >
          {filtered().map((s, idx) => (
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
                aria-selected={activeIndex === filtered().length}
                onMouseEnter={() => setActiveIndex(filtered().length)}
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
