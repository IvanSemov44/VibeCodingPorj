import React from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea';
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

interface CreateEditModalProps<T extends Record<string, any>> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  formData: T;
  onFormChange: (data: T) => void;
  onSave: () => Promise<void>;
  fields: FieldConfig[];
  isLoading?: boolean;
  saveBtnText?: string;
}

export function CreateEditModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  formData,
  onFormChange,
  onSave,
  fields,
  isLoading = false,
  saveBtnText = 'Save',
}: CreateEditModalProps<T>) {
  if (!isOpen) return null;

  const handleInputChange = (fieldName: string, value: string) => {
    onFormChange({ ...formData, [fieldName]: value });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[var(--secondary-bg)] p-6 rounded-lg border border-[var(--border-color)] w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">{title}</h2>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-[var(--text-secondary)] mb-2">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] resize-none"
                  placeholder={field.placeholder || ''}
                  rows={field.rows || 3}
                />
              ) : (
                <input
                  type="text"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="w-full px-4 py-2 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)]"
                  placeholder={field.placeholder || ''}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isLoading ? 'Saving...' : saveBtnText}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--primary-bg)] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
