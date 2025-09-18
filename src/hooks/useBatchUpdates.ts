import { useCallback, useRef, useEffect } from 'react';

export interface BatchUpdate<T> {
  id: string;
  data: T;
  timestamp: number;
}

export function useBatchUpdates<T>(
  batchSize: number = 5,
  batchDelay: number = 1000
) {
  const batchRef = useRef<BatchUpdate<T>[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onBatchProcess = useRef<((updates: BatchUpdate<T>[]) => Promise<void>) | null>(null);

  const addToBatch = useCallback((id: string, data: T) => {
    // Remove existing update with same id
    batchRef.current = batchRef.current.filter(update => update.id !== id);
    
    // Add new update
    batchRef.current.push({
      id,
      data,
      timestamp: Date.now(),
    });

    // Process batch if it's full
    if (batchRef.current.length >= batchSize) {
      processBatch();
    } else {
      // Set timeout to process batch after delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        processBatch();
      }, batchDelay);
    }
  }, [batchSize, batchDelay]);

  const processBatch = useCallback(async () => {
    if (batchRef.current.length === 0 || !onBatchProcess.current) {
      return;
    }

    const updates = [...batchRef.current];
    batchRef.current = [];
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      await onBatchProcess.current(updates);
    } catch (error) {
      console.error('Batch processing failed:', error);
      // Re-add failed updates to batch
      batchRef.current.unshift(...updates);
    }
  }, []);

  const setBatchProcessor = useCallback((processor: (updates: BatchUpdate<T>[]) => Promise<void>) => {
    onBatchProcess.current = processor;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    addToBatch,
    setBatchProcessor,
    processBatch,
    pendingUpdates: batchRef.current.length,
  };
}
