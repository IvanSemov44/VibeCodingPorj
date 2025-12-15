import { useMutation, useQueryClient } from '@tanstack/react-query';

type CreateMutationOptions<TVars, TData> = {
  fn: (vars: TVars) => Promise<TData>;
  invalidate?: Array<string | readonly unknown[]>;
};

export function useCreateMutation<TVars = unknown, TData = unknown>({
  fn,
  invalidate = [],
}: CreateMutationOptions<TVars, TData>) {
  const qc = useQueryClient();
  const m = useMutation<TData, unknown, TVars>({
    mutationFn: fn,
    onSuccess: () => {
      invalidate.forEach((k) => {
        qc.invalidateQueries({ queryKey: Array.isArray(k) ? k : [k] });
      });
    },
  });
  const trigger = (arg: TVars) => ({ unwrap: () => m.mutateAsync(arg) });
  return [trigger, m] as const;
}
