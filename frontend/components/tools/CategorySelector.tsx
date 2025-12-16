/**
 * CategorySelector Component
 * Multi-select buttons for category selection
 */

import React from 'react';
import { ErrorMessage } from 'formik';

type Category = { id: number; name: string };

interface CategorySelectorProps {
  categories: Category[];
  selectedCategories: number[];
  onToggle: (categoryId: number) => void;
}

export default function CategorySelector({
  categories,
  selectedCategories,
  onToggle,
}: CategorySelectorProps): React.ReactElement {
  const toggleCategory = (categoryId: number) => {
    onToggle(categoryId);
  };

  return (
    <div className="mt-3">
      <label className="block font-semibold mb-1 text-sm text-primary-text">Categories *</label>
      <div className="flex gap-2 flex-wrap mt-2">
        {categories.map((c) => {
          const isSelected = selectedCategories.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              className={`px-2.5 py-1.5 rounded-md border-none cursor-pointer text-[13px] font-medium transition-all ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-[var(--bg-secondary)] text-inherit hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
      <ErrorMessage name="categories" component="div" className="error" />
    </div>
  );
}
