/**
 * Custom hook for encryption operations
 */

import { useState, useCallback } from 'react';
import { useFHEContext } from '@/components/fhe/FHEProvider';

export function useEncryption() {
  const { encrypt, isInitialized } = useFHEContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const encryptValue = useCallback(
    async (value: any) => {
      if (!isInitialized) {
        setError('FHE not initialized');
        return null;
      }

      setLoading(true);
      setError(null);
      setResult(null);

      try {
        const encrypted = await encrypt(value);
        setResult(encrypted);
        return encrypted;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Encryption failed';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [encrypt, isInitialized]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setResult(null);
  }, []);

  return {
    encryptValue,
    loading,
    error,
    result,
    reset,
    isReady: isInitialized,
  };
}
