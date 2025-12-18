interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function Pagination({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  loading = false,
}: PaginationProps) {
  if (lastPage <= 1) return null;

  const startItem = total && perPage ? (currentPage - 1) * perPage + 1 : null;
  const endItem = total && perPage ? Math.min(currentPage * perPage, total) : null;

  return (
    <div className="flex items-center justify-between mt-6 px-4">
      {/* Left side - showing items */}
      <div className="text-sm text-[var(--text-secondary)]">
        {total && startItem && endItem ? (
          <>
            Showing <span className="font-medium text-[var(--text-primary)]">{startItem}</span> to{' '}
            <span className="font-medium text-[var(--text-primary)]">{endItem}</span> of{' '}
            <span className="font-medium text-[var(--text-primary)]">{total}</span> results
          </>
        ) : (
          <>
            Page <span className="font-medium text-[var(--text-primary)]">{currentPage}</span> of{' '}
            <span className="font-medium text-[var(--text-primary)]">{lastPage}</span>
          </>
        )}
      </div>

      {/* Right side - pagination controls */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || loading}
          className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--primary-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="First page"
        >
          ««
        </button>

        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--primary-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          « Previous
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers(currentPage, lastPage).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-[var(--text-secondary)]">
                …
              </span>
            ) : (
              <button
                key={pageNum}
                onClick={() => onPageChange(Number(pageNum))}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-[var(--accent)] text-white'
                    : 'border border-[var(--border-color)] text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--primary-bg)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {pageNum}
              </button>
            ),
          )}
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage || loading}
          className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--primary-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next »
        </button>

        {/* Last page button */}
        <button
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage === lastPage || loading}
          className="px-3 py-2 border border-[var(--border-color)] rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--secondary-bg)] hover:bg-[var(--primary-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Last page"
        >
          »»
        </button>
      </div>
    </div>
  );
}

// Helper function to generate page numbers with ellipsis
function getPageNumbers(current: number, total: number): (number | string)[] {
  const delta = 2; // Number of pages to show on each side of current page
  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const rangeStart = Math.max(2, current - delta);
  const rangeEnd = Math.min(total - 1, current + delta);

  // Add ellipsis after first page if needed
  if (rangeStart > 2) {
    pages.push('...');
  }

  // Add pages in range
  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (rangeEnd < total - 1) {
    pages.push('...');
  }

  // Always show last page (if it exists and is different from first)
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
