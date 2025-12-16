/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useId, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTagMultiSelect } from '../hooks/useTagMultiSelect';
import { useFloating, offset, flip, size as floatingSize } from '@floating-ui/react';
import { TagMultiSelectContext } from './TagMultiSelect/context';
import { TagInput } from './TagMultiSelect/TagInput';
import { TagList } from './TagMultiSelect/TagList';
import { TagDropdown } from './TagMultiSelect/TagDropdown';

/**
 * TagMultiSelect
 *
 * Accessible, performant multi-select input with autocomplete and optional
 * tag creation. The component is intentionally presentational and receives
 * behavior from `useTagMultiSelect` which handles state, API fetching,
 * validation, and keyboard interactions.
 *
 * Props include optional validation limits (`maxTags`, `maxTagLength`),
 * a `tagPattern` RegExp, and an `onError` callback for reporting validation
 * or API errors. The component exposes standard ARIA attributes and
 * supports labels, live regions, and visible focus states.
 */

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
  children?: React.ReactNode;
};

function TagMultiSelect({
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
  children,
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
  const parentRef = useRef<HTMLDivElement | null>(null);
  const { refs: floatingRefs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    middleware: [offset(6), flip(), floatingSize({ padding: 8 })],
  });
  const VIRTUALIZE_THRESHOLD = 100;
  const virtualizer = useVirtualizer({
    count: filteredList.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });
  const providerValue = {
    // selected value (from props)
    value,
    input,
    setInput,
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    options,
    filteredList,
    isLoading,
    rootRef: ref,
    inputRef,
    parentRef,
    floatingRefs,
    floatingStyles,
    virtualizer,
    virtualizeThreshold: VIRTUALIZE_THRESHOLD,
    listId,
    inputId,
    allowCreate,
    addTag,
    removeTag,
    handleKey,
  } as any;

  return (
    <TagMultiSelectContext.Provider value={providerValue}>
      <div ref={ref} className={`relative w-full ${className}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium mb-1">
            {label}
          </label>
        )}

        <div id={statusId} role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {`${value.length} tag${value.length !== 1 ? 's' : ''} selected`}
        </div>

        {/* If consumer provided children, render them; otherwise render default composition */}
        {React.Children.count(children) > 0 ? (
          children
        ) : (
          <>
            <TagInput />
            <TagDropdown />
          </>
        )}
      </div>
    </TagMultiSelectContext.Provider>
  );
}

// Attach static subcomponents for compound API with proper typing
type CompoundTagMultiSelect = React.FC<TagMultiSelectProps> & {
  Input: typeof TagInput;
  List: typeof TagList;
  Dropdown: typeof TagDropdown;
};

(TagMultiSelect as any).Input = TagInput;
(TagMultiSelect as any).List = TagList;
(TagMultiSelect as any).Dropdown = TagDropdown;

export default TagMultiSelect as unknown as CompoundTagMultiSelect;
