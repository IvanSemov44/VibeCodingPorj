interface ActivityStatsProps {
  total: number;
  today: number;
  thisWeek: number;
  topAction?: {
    action: string;
    count: number;
  };
}

export default function ActivityStats({
  total,
  today,
  thisWeek,
  topAction,
}: ActivityStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Total Activities</div>
        <div className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
          {total.toLocaleString()}
        </div>
      </div>
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Today</div>
        <div className="mt-2 text-3xl font-bold text-[var(--accent)]">{today}</div>
      </div>
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">This Week</div>
        <div className="mt-2 text-3xl font-bold text-[var(--success)]">{thisWeek}</div>
      </div>
      <div className="bg-[var(--card-bg)] rounded-lg shadow p-6 border border-[var(--border-color)]">
        <div className="text-sm font-medium text-[var(--text-secondary)]">Top Action</div>
        <div className="mt-2 text-lg font-bold text-[var(--accent)]">
          {topAction?.action || 'N/A'}
        </div>
        <div className="text-sm text-[var(--text-secondary)]">{topAction?.count || 0} times</div>
      </div>
    </div>
  );
}
