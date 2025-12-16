/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';

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
  rootRef: React.RefObject<HTMLDivElement> | null;
  inputRef: React.RefObject<HTMLInputElement> | null;
  parentRef: React.RefObject<HTMLDivElement> | null;
  // Floating UI / virtualizer
  floatingRefs?: any;
  floatingStyles?: React.CSSProperties | undefined;
  virtualizer?: any;
  virtualizeThreshold?: number;
  listId?: string;
  inputId?: string;
  allowCreate?: boolean;

  // Handlers
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  handleKey: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

const throwErr = () => {
  throw new Error('useTagMultiSelectContext must be used within TagMultiSelect provider');
};

export const TagMultiSelectContext = React.createContext<TagMultiSelectContextValue>({
  value: [],
  input: '',
  setInput: throwErr as unknown as (v: string) => void,
  open: false,
  setOpen: throwErr as unknown as (v: boolean) => void,
  activeIndex: -1,
  setActiveIndex: throwErr as unknown as (i: number) => void,
  options: [],
  filteredList: [],
  isLoading: false,
  rootRef: null,
  inputRef: null,
  parentRef: null,
  floatingRefs: undefined,
  floatingStyles: undefined,
  virtualizer: undefined,
  virtualizeThreshold: undefined,
  listId: undefined,
  inputId: undefined,
  allowCreate: undefined,
  addTag: throwErr as unknown as (tag: string) => void,
  removeTag: throwErr as unknown as (tag: string) => void,
  handleKey: throwErr as unknown as (e: React.KeyboardEvent<HTMLInputElement>) => void,
});

export const useTagMultiSelectContext = () => React.useContext(TagMultiSelectContext);
