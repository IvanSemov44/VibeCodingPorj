const ACTION_COLORS: Record<string, string> = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-yellow-100 text-yellow-800',
  deleted: 'bg-red-100 text-red-800',
  restored: 'bg-blue-100 text-blue-800',
  // add other action keys as needed
};

interface Activity {
  id: number;
  subject_type: string;
  subject_id: number;
  action: string;
  user: {
    id: number;
    name: string;
    email: string;
    roles?: string[];
  } | null;
  meta: Record<string, any> | null;
  created_at: string;
  created_at_human: string;
}

interface ActivityCardProps {
  activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const subject = activity.subject_type.split('\\').pop();
  const actionColor = ACTION_COLORS[activity.action] || 'bg-gray-100 text-gray-800';

  return (
    <div
      className="card-base p-4 hover:shadow-md transition-shadow"
      role="article"
      aria-label={`Activity ${activity.id}: ${activity.action} on ${activity.subject_type}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-start">
        {/* ID */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">ID</p>
          <p className="text-lg font-mono font-bold text-[var(--accent)]">#{activity.id}</p>
        </div>

        {/* Date & Time */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">
            Date & Time
          </p>
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {new Date(activity.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">{activity.created_at_human}</p>
        </div>

        {/* User & Email */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">
            User
          </p>
          {activity.user ? (
            <>
              <p
                className="text-sm font-medium text-[var(--text-primary)] truncate"
                title={activity.user.name}
              >
                {activity.user.name}
              </p>
              <p
                className="text-xs text-[var(--text-secondary)] truncate"
                title={activity.user.email}
              >
                {activity.user.email}
              </p>
            </>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">System</p>
          )}
        </div>

        {/* Action */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">
            Action
          </p>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${actionColor}`}
          >
            {activity.action}
          </span>
        </div>

        {/* Subject */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">
            Subject
          </p>
          <p className="text-sm font-medium text-[var(--text-primary)]">{subject}</p>
          <p className="text-xs text-[var(--text-secondary)]">ID: {activity.subject_id}</p>
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="text-xs text-[var(--text-secondary)] uppercase font-semibold mb-1">
            Details
          </p>
          {activity.meta && Object.keys(activity.meta).length > 0 ? (
            <details className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm">
              <summary className="font-medium">View details</summary>
              <div className="mt-3 p-3 bg-[var(--primary-bg)] rounded border border-[var(--border-color)] overflow-auto max-h-48">
                <pre className="text-xs whitespace-pre-wrap break-words">
                  {JSON.stringify(activity.meta, null, 2)}
                </pre>
              </div>
            </details>
          ) : (
            <p className="text-sm text-[var(--text-secondary)]">-</p>
          )}
        </div>
      </div>
    </div>
  );
}
