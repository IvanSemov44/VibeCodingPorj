import React from 'react';
import { useGetCommentsQuery } from '../../store/domains';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { SkeletonCard } from '../Loading/SkeletonCard';

interface CommentListProps {
  toolId: number;
  currentUserId?: number;
}

export default function CommentList({ toolId, currentUserId }: CommentListProps) {
  const { data, isLoading, error } = useGetCommentsQuery(toolId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Failed to load comments. Please try again later.
      </div>
    );
  }

  // Handle paginated response structure: { data: [...] }
  const comments = Array.isArray((data as any)?.data) ? (data as any).data : [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
          Comments ({comments.length})
        </h3>
        <CommentForm toolId={toolId} />
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-secondary)]">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              toolId={toolId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
