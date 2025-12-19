import { UseMutationOptions, useQueryClient } from '@tanstack/react-query';

/**
 * Hook helper to create optimistic update options for mutations
 * Handles cancel, optimistic set, error rollback
 */
export interface OptimisticUpdateOptions<TData, TVars> {
  queryKey: unknown[];
  updateFn: (previous: TData, variables: TVars) => TData;
}

export function useOptimisticUpdate<TData, TVars>({
  queryKey,
  updateFn,
}: OptimisticUpdateOptions<TData, TVars>) {
  const qc = useQueryClient();

  return {
    onMutate: async (variables: TVars) => {
      // Cancel previous queries
      await qc.cancelQueries({ queryKey });

      // Get previous data
      const previous = qc.getQueryData<TData>(queryKey);

      // Optimistic update
      if (previous) {
        const optimistic = updateFn(previous, variables);
        qc.setQueryData(queryKey, optimistic);
      }

      return { previous };
    },

    onError: (err: Error, variables: TVars, context: { previous?: TData } | undefined) => {
      // Rollback on error
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },
  } as Partial<UseMutationOptions<unknown, Error, TVars>>;
}

/**
 * Helper to create optimistic update for list + detail invalidation
 * Common pattern: update detail, invalidate list
 */
export function useOptimisticUpdateWithInvalidation<TData, TVars>({
  queryKey,
  updateFn,
  invalidateKeys = [],
}: OptimisticUpdateOptions<TData, TVars> & {
  invalidateKeys?: unknown[][];
}) {
  const qc = useQueryClient();
  const optimistic = useOptimisticUpdate({ queryKey, updateFn });

  return {
    ...optimistic,

    onSuccess: () => {
      // Invalidate related queries
      invalidateKeys.forEach((key) => {
        qc.invalidateQueries({ queryKey: key });
      });
    },
  };
}
