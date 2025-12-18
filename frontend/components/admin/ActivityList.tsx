interface ActivityListProps {
  isLoading: boolean;
  error: any;
  activities: any[];
  children: React.ReactNode;
}

export default function ActivityList({
  isLoading,
  error,
  activities,
  children,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[var(--border-color)] border-t-[var(--accent)]"></div>
        <p className="mt-2 text-[var(--text-secondary)]">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">{error.message}</div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-secondary)] bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
        No activities found
      </div>
    );
  }

  return <div className="space-y-3">{children}</div>;
}
