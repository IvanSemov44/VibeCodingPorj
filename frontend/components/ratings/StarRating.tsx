import React, { useState, useRef, useEffect } from 'react';
import { useRateToolMutation } from '../../store/domains';
import { useToast } from '../Toast';

interface StarRatingProps {
  toolId: number;
  currentRating?: number;
  averageRating: number;
  ratingCount: number;
  editable?: boolean;
}

export default function StarRating({
  toolId,
  currentRating,
  averageRating,
  ratingCount,
  editable = true,
}: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [rateTool, { isPending }] = useRateToolMutation();
  const { addToast } = useToast();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleRate = async (score: number) => {
    if (!editable || isPending) return;

    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the rating submission to prevent rate limiting
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await rateTool({ toolId, score }).unwrap();
        addToast(`Rated ${score} stars!`, 'success');
      } catch (error: unknown) {
        // Handle rate limiting
        const apiError = error as Record<string, unknown>;
        if (apiError?.status === 429) {
          addToast('Too many rating attempts. Please try again later.', 'warning');
        } else {
          addToast('Failed to submit rating', 'error');
        }
      }
    }, 500); // Wait 500ms before submitting
  };

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const displayRating = hoveredStar || currentRating || averageRating;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => editable && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            disabled={!editable || isPending}
            className="text-2xl transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
            title={`Rate ${star} stars`}
          >
            <span className={star <= displayRating ? 'text-yellow-500' : 'text-gray-400'}>
              {star <= displayRating ? '⭐' : '☆'}
            </span>
          </button>
        ))}
      </div>

      <span className="text-sm text-[var(--text-secondary)]">
        {averageRating > 0 ? (
          <>
            {averageRating.toFixed(1)} ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
          </>
        ) : (
          'No ratings yet'
        )}
      </span>
    </div>
  );
}
