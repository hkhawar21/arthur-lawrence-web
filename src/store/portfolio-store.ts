import { create } from 'zustand';

import {
  createPortfolioItem,
  deletePortfolioItem,
  getPortfolioItems,
  updatePortfolioItem,
} from '@/api/portfolio';
import { useAuthStore } from '@/store/auth-store';
import type { CreatePortfolioItemInput, PortfolioItem, UpdatePortfolioItemInput } from '@/types/portfolio';
import { getApiErrorMessage } from '@/utils/apiHandler';

type PortfolioState = {
  itemsById: Record<number, PortfolioItem>;
  ids: number[];
  page: number;
  totalPages: number | null;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;

  isCreating: boolean;
  createError: string | null;

  isUpdating: boolean;
  updateError: string | null;

  deletingIds: number[];
  deleteError: string | null;

  fetchFirstPage: (limit: number) => Promise<void>;
  fetchNextPage: (limit: number) => Promise<void>;
  createItem: (input: CreatePortfolioItemInput) => Promise<PortfolioItem | undefined>;
  updateItem: (id: number, input: UpdatePortfolioItemInput) => Promise<PortfolioItem | undefined>;
  deleteItem: (id: number) => Promise<boolean>;
};

const initialState = {
  itemsById: {},
  ids: [],
  page: 0,
  totalPages: null,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  isCreating: false,
  createError: null,

  isUpdating: false,
  updateError: null,

  deletingIds: [],
  deleteError: null,
} satisfies Partial<PortfolioState>;

/**
 * Single source of truth for portfolio item data. Items are normalized by id
 * so any consumer (e.g. a FlatList row) can subscribe to just its own item
 * instead of the whole list, which would re-render on every page change.
 *
 * `ids` accumulates across pages for infinite scroll. `page`/`totalPages`
 * gate `fetchNextPage` so scrolling past the last page, or firing
 * `onEndReached` again before the in-flight request resolves, doesn't issue
 * another API call.
 *
 * create/update/delete call the API directly from here and write the
 * response straight into `itemsById`/`ids`, so every screen reading from
 * this store (list, edit prefill, ...) reflects the mutation immediately
 * without a manual refetch.
 *
 * `deletingIds` tracks in-flight deletes per item id (not a single global
 * flag) so a row's own loading/disabled state doesn't affect other rows.
 */
export const usePortfolioStore = create<PortfolioState>((set, get) => ({
  ...initialState,

  fetchFirstPage: async (limit) => {
    if (get().isLoading) return;
    set({ isLoading: true, error: null });

    try {
      const { items, pagination } = await getPortfolioItems({ page: 1, limit }, useAuthStore.getState().token);

      set((state) => ({
        itemsById: { ...state.itemsById, ...Object.fromEntries(items.map((item) => [item.id, item])) },
        ids: items.map((item) => item.id),
        page: 1,
        totalPages: pagination.totalPages,
        isLoading: false,
      }));
    } catch (e) {
      set({ isLoading: false, error: getApiErrorMessage(e) });
    }
  },

  fetchNextPage: async (limit) => {
    const { isLoading, isLoadingMore, page, totalPages } = get();
    if (isLoading || isLoadingMore) return;
    if (totalPages !== null && page >= totalPages) return;

    const nextPage = page + 1;
    set({ isLoadingMore: true, error: null });

    try {
      const { items, pagination } = await getPortfolioItems(
        { page: nextPage, limit },
        useAuthStore.getState().token,
      );

      set((state) => ({
        itemsById: { ...state.itemsById, ...Object.fromEntries(items.map((item) => [item.id, item])) },
        ids: [...state.ids, ...items.map((item) => item.id)],
        page: nextPage,
        totalPages: pagination.totalPages,
        isLoadingMore: false,
      }));
    } catch (e) {
      set({ isLoadingMore: false, error: getApiErrorMessage(e) });
    }
  },

  createItem: async (input) => {
    set({ isCreating: true, createError: null });

    try {
      const item = await createPortfolioItem(input, useAuthStore.getState().token);

      set((state) => ({
        itemsById: { ...state.itemsById, [item.id]: item },
        ids: [item.id, ...state.ids],
        isCreating: false,
      }));

      return item;
    } catch (e) {
      set({ isCreating: false, createError: getApiErrorMessage(e) });
      return undefined;
    }
  },

  updateItem: async (id, input) => {
    set({ isUpdating: true, updateError: null });

    try {
      const item = await updatePortfolioItem(id, input, useAuthStore.getState().token);

      set((state) => ({
        itemsById: { ...state.itemsById, [item.id]: item },
        isUpdating: false,
      }));

      return item;
    } catch (e) {
      set({ isUpdating: false, updateError: getApiErrorMessage(e) });
      return undefined;
    }
  },

  deleteItem: async (id) => {
    set((state) => ({ deletingIds: [...state.deletingIds, id], deleteError: null }));

    try {
      await deletePortfolioItem(id, useAuthStore.getState().token);

      set((state) => {
        const { [id]: _removed, ...itemsById } = state.itemsById;
        return {
          itemsById,
          ids: state.ids.filter((itemId) => itemId !== id),
          deletingIds: state.deletingIds.filter((itemId) => itemId !== id),
        };
      });

      return true;
    } catch (e) {
      set((state) => ({
        deletingIds: state.deletingIds.filter((itemId) => itemId !== id),
        deleteError: getApiErrorMessage(e),
      }));
      return false;
    }
  },
}));

export function usePortfolioItem(id: number): PortfolioItem | undefined {
  return usePortfolioStore((state) => state.itemsById[id]);
}

export function useIsDeletingPortfolioItem(id: number): boolean {
  return usePortfolioStore((state) => state.deletingIds.includes(id));
}

// Portfolio data is per-user; drop it the moment a session ends so a
// different user signing in on the same tab doesn't briefly see stale data.
useAuthStore.subscribe((state, prevState) => {
  if (state.status === 'signedOut' && prevState.status !== 'signedOut') {
    usePortfolioStore.setState(initialState);
  }
});
