import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type * as React from 'react';
import { useGetTagsQuery } from '../store/domains';

/**
 * useTagMultiSelect
 *
 * Hook that encapsulates the TagMultiSelect logic: managing input state,
 * fetching or receiving options, filtering, keyboard navigation, validation,
 * and add/remove handlers.
 *
 * The hook returns a small stable API intended for the presentational
 * `TagMultiSelect` component and is fully typed.
 *
 * @param props.value - selected tags
 * @param props.onChange - change callback
 * @param props.allowCreate - whether creating new tags is allowed
 * @param props.options - external options array (skips API when provided)
 * @param props.maxTags - maximum number of allowed tags
 * @param props.maxTagLength - maximum characters per tag
 * @param props.tagPattern - validation RegExp for new tags
 * @param props.onError - optional error callback for validation/API errors
 *
 * @returns An object with controlled state, refs and handlers used by the UI.
 */

type ExternalOption = string | { name: string };

type UseTagMultiSelectProps = {
  value?: string[];
  onChange: (v: string[]) => void;
  allowCreate?: boolean;
  options?: ExternalOption[] | null;
  maxTags?: number;
  maxTagLength?: number;
  tagPattern?: RegExp;
  onError?: (message: string) => void;
};

export function useTagMultiSelect({
  value = [],
  onChange,
  allowCreate = true,
  options: externalOptions = null,
  maxTags = 10,
  maxTagLength = 50,
  tagPattern = /^[a-zA-Z0-9\s\-_]+$/,
  onError,
}: UseTagMultiSelectProps) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const shouldFetch = externalOptions === null;
  const q = useGetTagsQuery({ enabled: shouldFetch });

  useEffect(() => {
    if (externalOptions && Array.isArray(externalOptions)) {
      const names = externalOptions
        .map((o) => (typeof o === 'string' ? o : o.name))
        .filter(Boolean) as string[];
      setOptions(names);
      return;
    }
    if (q?.data && Array.isArray(q.data)) {
      setOptions(q.data.map((t: { name: string }) => t.name));
    }
  }, [externalOptions, q?.data]);

  useEffect(() => {
    if (q?.isError) {
      const msg = 'Failed to load tag suggestions';
      if (onError) onError(msg);
      else console.error('useTagMultiSelect: failed to load tags', q?.error || 'unknown');
    }
  }, [q?.isError, q?.error, onError]);

  const filteredList = useMemo((): string[] => {
    const q = input.trim().toLowerCase();
    if (q === '') return options.filter((o) => !value.includes(o)).slice(0, 10);
    return options.filter((o) => o.toLowerCase().includes(q) && !value.includes(o)).slice(0, 10);
  }, [input, options, value]);

  const addTag = useCallback(
    (tag: string): void => {
      const t = tag.trim();
      if (!t) return;

      if (t.length > maxTagLength) {
        onError?.(`Tag exceeds maximum length of ${maxTagLength} characters`);
        return;
      }

      if (value.length >= maxTags) {
        onError?.(`Maximum of ${maxTags} tags allowed`);
        return;
      }

      if (!tagPattern.test(t)) {
        onError?.('Tag contains invalid characters');
        return;
      }

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
    },
    [value, onChange, maxTags, maxTagLength, tagPattern, onError],
  );

  const removeTag = useCallback(
    (tag: string): void => {
      onChange(value.filter((v) => v !== tag));
    },
    [value, onChange],
  );

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const list = filteredList;
      const canCreate =
        allowCreate &&
        input.trim() !== '' &&
        !options.map((o) => o.toLowerCase()).includes(input.trim().toLowerCase());
      const totalOptions = list.length + (canCreate ? 1 : 0);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex((prev) => Math.min(prev + 1, totalOptions - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (open && activeIndex >= 0) {
          if (activeIndex < list.length) {
            addTag(list[activeIndex]);
          } else if (canCreate && activeIndex === list.length) {
            addTag(input.trim());
          }
        } else if (input.trim()) {
          addTag(input.trim());
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
    },
    [filteredList, allowCreate, input, options, open, activeIndex, addTag, removeTag, value],
  );

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

  useEffect(() => {
    const list = filteredList;
    if (list.length === 0) setActiveIndex(-1);
    else if (activeIndex >= list.length) setActiveIndex(list.length - 1);
  }, [filteredList, activeIndex]);

  return {
    // state
    input,
    setInput,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    options,
    filteredList,

    // refs
    ref,
    inputRef,

    // handlers
    addTag,
    removeTag,
    handleKey,

    // status
    isLoading: q?.isLoading,
    isError: q?.isError,
  } as const;
}
