import { useState, useCallback } from 'react';

export interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error, originalData: T) => void;
  rollbackOnError?: boolean;
}

export function useOptimisticUpdate<T>(
  initialData: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateOptimistically = useCallback(
    async (
      optimisticUpdate: (currentData: T) => T,
      asyncOperation: () => Promise<T>
    ) => {
      const originalData = data;
      
      // Apply optimistic update immediately
      const optimisticData = optimisticUpdate(data);
      setData(optimisticData);
      setIsUpdating(true);
      setError(null);

      try {
        // Perform async operation
        const result = await asyncOperation();
        
        // Update with real data
        setData(result);
        options.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        // Rollback on error if enabled
        if (options.rollbackOnError !== false) {
          setData(originalData);
        }
        
        options.onError?.(error, originalData);
      } finally {
        setIsUpdating(false);
      }
    },
    [data, options]
  );

  return {
    data,
    isUpdating,
    error,
    updateOptimistically,
    setData,
  };
}
