interface ExportButtonsProps {
  isExporting: boolean;
  hasActivities: boolean;
  onExportToServer: () => void;
  onExportToCSV: () => void;
}

export default function ExportButtons({
  isExporting,
  hasActivities,
  onExportToServer,
  onExportToCSV,
}: ExportButtonsProps) {
  return (
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={onExportToServer}
        disabled={isExporting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        aria-label="Export activities and send via email"
      >
        {isExporting ? '⏳ Exporting...' : '📧 Export & Email (Large)'}
      </button>
      <button
        onClick={onExportToCSV}
        disabled={!hasActivities}
        className="px-4 py-2 bg-[var(--success)] text-white rounded-md hover:bg-[var(--success-hover)] disabled:bg-[var(--secondary-bg)] disabled:text-[var(--text-secondary)] disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--success)] transition-colors"
        aria-label="Download current page as CSV"
      >
        📥 Download Now (Current Page)
      </button>
    </div>
  );
}
