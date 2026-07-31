import { useEffect } from 'react';

import { getPortfolioItem } from '@/api/portfolio';
import { useAuthStore } from '@/store/auth-store';

import { useAsyncCallback } from './use-async-callback';

/**
 * Fetches a single portfolio item; pass `id` as `null` to skip fetching.
 *
 * Used to prefill the edit form on a direct/deep-linked visit, when the item
 * isn't in `usePortfolioStore` yet. Create/update/delete live on the store
 * itself (see `store/portfolio-store.ts`) since their result needs to update
 * shared list state, not just one screen's local state.
 */
export function useGetPortfolioItem(id: number | null) {
  const { execute, ...state } = useAsyncCallback((itemId: number) =>
    getPortfolioItem(itemId, useAuthStore.getState().token),
  );

  useEffect(() => {
    if (id === null) return;
    execute(id);
  }, [execute, id]);

  return {
    ...state,
    refetch: () => (id === null ? Promise.resolve(undefined) : execute(id)),
  };
}
