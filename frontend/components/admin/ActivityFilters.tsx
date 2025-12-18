type SelectOption = {
  value: string;
  label: string;
};

const ACTION_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
];

const SUBJECT_TYPE_OPTIONS: SelectOption[] = [
  { value: '', label: 'All' },
  { value: 'post', label: 'Post' },
  { value: 'comment', label: 'Comment' },
  { value: 'user', label: 'User' },
];

interface ActivityFiltersProps {
  filters: {
    action: string;
    subject_type: string;
    user_id: string;
    date_from: string;
    date_to: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
}

export default function ActivityFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: ActivityFiltersProps) {
  return (
    <div className="card-base p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Filters</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            htmlFor="search-input"
          >
            Search
          </label>
          <input
            id="search-input"
            type="text"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            placeholder="Search actions, types..."
            className="input-base"
            aria-label="Search activities"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            htmlFor="action-select"
          >
            Action
          </label>
          <select
            id="action-select"
            value={filters.action}
            onChange={(e) => onFilterChange('action', e.target.value)}
            className="input-base"
            aria-label="Filter by action"
          >
            {ACTION_OPTIONS.map(({ value, label }: SelectOption) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            htmlFor="subject-select"
          >
            Subject Type
          </label>
          <select
            id="subject-select"
            value={filters.subject_type}
            onChange={(e) => onFilterChange('subject_type', e.target.value)}
            className="input-base"
            aria-label="Filter by subject type"
          >
            {SUBJECT_TYPE_OPTIONS.map(({ value, label }: SelectOption) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            htmlFor="date-from-input"
          >
            Date From
          </label>
          <input
            id="date-from-input"
            type="date"
            value={filters.date_from}
            onChange={(e) => onFilterChange('date_from', e.target.value)}
            className="input-base"
            aria-label="Filter from date"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            htmlFor="date-to-input"
          >
            Date To
          </label>
          <input
            id="date-to-input"
            type="date"
            value={filters.date_to}
            onChange={(e) => onFilterChange('date_to', e.target.value)}
            className="input-base"
            aria-label="Filter to date"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={onClearFilters}
            className="btn-secondary flex-1"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
