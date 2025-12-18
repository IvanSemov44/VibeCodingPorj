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
    <div className="pagination-container">
      <div className="text-sm text-[var(--text-primary)]">
        Page <span className="font-semibold">{currentPage}</span> of{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="btn-small"
          aria-label="Go to previous page"
        >
          ← Previous
        </button>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="btn-small"
          aria-label="Go to next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
