import { ACTION_OPTIONS, SUBJECT_TYPE_OPTIONS } from '../../lib/activityConstants';

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
    <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 mb-6 border border-[var(--border-color)]">
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
            className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
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
            className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            aria-label="Filter by action"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
            className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            aria-label="Filter by subject type"
          >
            {SUBJECT_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
            className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
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
            className="w-full px-3 py-2 border border-[var(--border-color)] bg-[var(--primary-bg)] text-[var(--text-primary)] rounded-md focus:ring-[var(--accent)] focus:border-[var(--accent)]"
            aria-label="Filter to date"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={onClearFilters}
            className="flex-1 px-4 py-2 bg-[var(--secondary-bg)] text-[var(--text-primary)] rounded-md hover:bg-[var(--tertiary-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--border-color)] transition-colors"
            aria-label="Clear all filters"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
