/**
 * React hook for FHEVM integration
 * Provides easy access to FHEVM functionality in React components
 */

import { useState, useEffect } from 'react';
import { FhevmClient } from '../client';
import type { FhevmInstance, EncryptedInput } from '../types';

interface UseFhevmOptions {
  provider: any;
  signer: any;
  contractAddress: string;
  autoInit?: boolean;
}

interface UseFhevmReturn {
  client: FhevmClient | null;
  instance: FhevmInstance | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  init: () => Promise<void>;
  encrypt: (params: { contractAddress: string; callerAddress: string; value: any }) => Promise<EncryptedInput>;
  userDecrypt: (params: { handle: bigint; contractAddress: string; userAddress: string }) => Promise<any>;
}

/**
 * Custom React hook for FHEVM operations
 *
 * @example
 * ```typescript
 * const { client, isInitialized, encrypt, userDecrypt } = useFhevm({
 *   provider,
 *   signer,
 *   contractAddress: '0x...',
 *   autoInit: true
 * });
 *
 * // Encrypt data
 * const encrypted = await encrypt({
 *   contractAddress: '0x...',
 *   callerAddress: userAddress,
 *   value: { amount: 100 }
 * });
 *
 * // Decrypt data
 * const result = await userDecrypt({
 *   handle: 123n,
 *   contractAddress: '0x...',
 *   userAddress
 * });
 * ```
 */
export function useFhevm(options: UseFhevmOptions): UseFhevmReturn {
  const { provider, signer, contractAddress, autoInit = true } = options;

  const [client, setClient] = useState<FhevmClient | null>(null);
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const init = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress
      });

      await fhevmClient.init();

      setClient(fhevmClient);
      setInstance(fhevmClient.getInstance());
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      setError(error);
      console.error('FHEVM initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoInit && provider && signer && contractAddress) {
      init();
    }
  }, [provider, signer, contractAddress, autoInit]);

  const encrypt = async (params: { contractAddress: string; callerAddress: string; value: any }) => {
    if (!client) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return client.encrypt(params);
  };

  const userDecrypt = async (params: { handle: bigint; contractAddress: string; userAddress: string }) => {
    if (!client) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return client.userDecrypt(params);
  };

  return {
    client,
    instance,
    isInitialized,
    isLoading,
    error,
    init,
    encrypt,
    userDecrypt
  };
}
