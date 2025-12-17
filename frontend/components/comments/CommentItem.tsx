import React, { useState } from 'react';
import { useDeleteCommentMutation } from '../../store/domains';
import CommentForm from './CommentForm';
import { useToast } from '../Toast';

interface Comment {
  id: number;
  content: string;
  user: { id: number; name: string };
  created_at: string;
  upvotes: number;
  downvotes: number;
  replies?: Comment[];
}

interface CommentItemProps {
  comment: Comment;
  toolId: number;
  currentUserId?: number;
  depth?: number;
}

export default function CommentItem({ comment, toolId, currentUserId, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [deleteComment, { isPending: isDeleting }] = useDeleteCommentMutation();
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment({ commentId: comment.id, toolId }).unwrap();
      addToast('Comment deleted', 'success');
    } catch (error) {
      addToast('Failed to delete comment', 'error');
    }
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? 'ml-8 pl-4 border-l-2 border-[var(--border-color)]' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center text-sm font-medium">
          {comment.user.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[var(--text-primary)]">{comment.user.name}</span>
            <span className="text-xs text-[var(--text-secondary)]">{timeAgo(comment.created_at)}</span>
          </div>

          {/* Content */}
          <p className="mt-1 text-[var(--text-primary)] whitespace-pre-wrap">{comment.content}</p>

          {/* Actions */}
          <div className="mt-2 flex items-center gap-4 text-sm">
            {depth < 2 && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
              >
                Reply
              </button>
            )}

            {currentUserId === comment.user.id && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3">
              <CommentForm
                toolId={toolId}
                parentId={comment.id}
                placeholder={`Reply to ${comment.user.name}...`}
                onSuccess={() => setIsReplying(false)}
                onCancel={() => setIsReplying(false)}
              />
            </div>
          )}

          {/* Nested Replies */}
          {showReplies && comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  toolId={toolId}
                  currentUserId={currentUserId}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
