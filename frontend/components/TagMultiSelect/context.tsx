import React from 'react';
import type { Virtualizer } from '@tanstack/react-virtual';
import type { UseFloatingReturn } from '@floating-ui/react';

export type TagMultiSelectContextValue = {
  // Selected tags
  value: string[];
  // State
  input: string;
  setInput: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  options: string[];
  filteredList: string[];
  isLoading: boolean;

  // Refs
  rootRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  parentRef: React.RefObject<HTMLDivElement | null>;
  // Floating UI / virtualizer
  floatingRefs: UseFloatingReturn['refs'];
  floatingStyles: React.CSSProperties;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualizeThreshold: number;
  listId: string;
  inputId: string;
  allowCreate: boolean;

  // Handlers
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  handleKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const TagMultiSelectContext = React.createContext<TagMultiSelectContextValue | null>(null);

export const useTagMultiSelectContext = () => {
  const context = React.useContext(TagMultiSelectContext);
  if (!context) {
    throw new Error('useTagMultiSelectContext must be used within TagMultiSelect provider');
  }
  return context;
};
