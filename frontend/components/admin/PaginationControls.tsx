interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export default function PaginationControls({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-between mt-6 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
      <div className="text-sm text-[var(--text-primary)]">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          aria-label="Go to previous page"
        >
          ← Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--card-bg)] hover:bg-[var(--secondary-bg)] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          aria-label="Go to next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
