/**
 * Custom hook for FHE computation and decryption operations
 */

import { useState, useCallback } from 'react';
import { useFHEContext } from '@/components/fhe/FHEProvider';

export function useComputation() {
  const { userDecrypt, publicDecrypt, isInitialized } = useFHEContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const decrypt = useCallback(
    async (handle: bigint, isPublic: boolean = false) => {
      if (!isInitialized) {
        setError('FHE not initialized');
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const decrypted = isPublic
          ? await publicDecrypt(handle)
          : await userDecrypt(handle);

        setResult(decrypted);
        return decrypted;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Decryption failed';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userDecrypt, publicDecrypt, isInitialized]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    decrypt,
    loading,
    error,
    result,
    reset,
    isReady: isInitialized,
  };
}
