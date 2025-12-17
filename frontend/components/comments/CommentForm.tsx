import React, { useState } from 'react';
import { usePostCommentMutation } from '../../store/domains';
import { useToast } from '../Toast';

interface CommentFormProps {
  toolId: number;
  parentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

export default function CommentForm({
  toolId,
  parentId,
  onSuccess,
  onCancel,
  placeholder = 'Write a comment...'
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [postComment, { isPending }] = usePostCommentMutation();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (content.trim().length < 3) {
      addToast('Comment must be at least 3 characters', 'error');
      return;
    }

    try {
      await postComment({ toolId, content, parent_id: parentId }).unwrap();
      addToast(parentId ? 'Reply posted!' : 'Comment posted!', 'success');
      setContent('');
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      addToast(err?.data?.message || 'Failed to post comment', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--input-bg)] text-[var(--text-primary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
        disabled={isPending}
      />

      <div className="flex justify-between items-center">
        <span className="text-xs text-[var(--text-secondary)]">
          {content.length}/2000
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              disabled={isPending}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || content.trim().length < 3}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isPending ? 'Posting...' : parentId ? 'Reply' : 'Post Comment'}
          </button>
        </div>
      </div>
    </form>
  );
}
