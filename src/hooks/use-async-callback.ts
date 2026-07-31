import { useCallback, useRef, useState } from 'react';

import { getApiErrorMessage } from '@/utils/apiHandler';

type AsyncState<TResult> = {
  data: TResult | null;
  isLoading: boolean;
  error: string | null;
};

type UseAsyncCallbackResult<TArgs extends unknown[], TResult> = AsyncState<TResult> & {
  execute: (...args: TArgs) => Promise<TResult | undefined>;
  reset: () => void;
};

/**
 * Wraps an async function (typically an api/*.ts call) with loading/error/data
 * state. Only the response from the most recently invoked call is applied, so
 * a stale, slower request can't clobber a newer one's result.
 */
export function useAsyncCallback<TArgs extends unknown[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
): UseAsyncCallbackResult<TArgs, TResult> {
  const [state, setState] = useState<AsyncState<TResult>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const asyncFnRef = useRef(asyncFn);
  asyncFnRef.current = asyncFn;

  const requestId = useRef(0);

  const execute = useCallback(async (...args: TArgs) => {
    const currentRequestId = ++requestId.current;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await asyncFnRef.current(...args);
      if (currentRequestId === requestId.current) {
        setState({ data, isLoading: false, error: null });
      }
      return data;
    } catch (e) {
      if (currentRequestId === requestId.current) {
        setState((prev) => ({ ...prev, isLoading: false, error: getApiErrorMessage(e) }));
      }
      return undefined;
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
