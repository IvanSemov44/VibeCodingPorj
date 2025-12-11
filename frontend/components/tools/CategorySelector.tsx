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
  onToggle
}: CategorySelectorProps): React.ReactElement {
  const toggleCategory = (categoryId: number) => {
    onToggle(categoryId);
  };

  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>Categories *</label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        {categories.map(c => {
          const isSelected = selectedCategories.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleCategory(c.id)}
              style={{
                padding: '6px 10px',
                background: isSelected ? '#059669' : '#f3f4f6',
                color: isSelected ? 'white' : 'inherit',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer'
              }}
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
