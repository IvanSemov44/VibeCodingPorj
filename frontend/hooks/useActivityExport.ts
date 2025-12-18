import { useState, useCallback } from 'react';
import { fetchWithAuth } from '../lib/api';
import { useToast } from '../components/Toast';
import { CSV_HEADERS } from '../lib/activityConstants';

interface Activity {
  id: number;
  subject_type: string;
  subject_id: number;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  meta: Record<string, any> | null;
  created_at: string;
  created_at_human: string;
}

export const useActivityExport = () => {
  const { addToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportToServer = useCallback(
    async (filters: Record<string, string>) => {
      try {
        setIsExporting(true);

        const response = await fetchWithAuth('/api/admin/activities/export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(filters),
        });

        if (response.status === 202) {
          addToast('✅ Export started! Check your email for the download link.', 'success');
        } else if (response.status === 401) {
          addToast('Unauthorized. Please login again.', 'error');
        } else if (response.status === 403) {
          addToast('You do not have permission to export data.', 'error');
        } else {
          const error = await response.json();
          addToast(error.message || 'Export failed', 'error');
        }
      } catch (err) {
        addToast('Export error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
      } finally {
        setIsExporting(false);
      }
    },
    [addToast]
  );

  const exportToCSV = useCallback(
    (activities: Activity[]) => {
      try {
        const rows = activities.map((activity) => [
          activity.id,
          activity.created_at,
          activity.user?.name || 'System',
          activity.action,
          activity.subject_type,
          activity.subject_id,
          JSON.stringify(activity.meta || {}),
        ]);

        const csvContent = [
          CSV_HEADERS.join(','),
          ...rows.map((row) =>
            row
              .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
              .join(',')
          ),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 100);
      } catch (err) {
        addToast('CSV export error: ' + (err instanceof Error ? err.message : 'Unknown error'), 'error');
      }
    },
    [addToast]
  );

  return {
    isExporting,
    handleExportToServer,
    exportToCSV,
  };
};
