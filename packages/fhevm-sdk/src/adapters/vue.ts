/**
 * Vue adapter for FHEVM SDK
 * Provides Vue-specific composables and utilities
 */

import { ref, onMounted, Ref } from 'vue';
import { FhevmClient } from '../client';
import type { FhevmInstance, EncryptedInput } from '../types';

interface UseFhevmOptions {
  provider: any;
  signer: any;
  contractAddress: string;
  autoInit?: boolean;
}

interface UseFhevmReturn {
  client: Ref<FhevmClient | null>;
  instance: Ref<FhevmInstance | null>;
  isInitialized: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  init: () => Promise<void>;
  encrypt: (params: { contractAddress: string; callerAddress: string; value: any }) => Promise<EncryptedInput>;
  userDecrypt: (params: { handle: bigint; contractAddress: string; userAddress: string }) => Promise<any>;
}

/**
 * Vue composable for FHEVM operations
 *
 * @example
 * ```typescript
 * <script setup>
 * import { useFhevm } from 'fhevm-sdk/adapters/vue';
 *
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
 * </script>
 * ```
 */
export function useFhevm(options: UseFhevmOptions): UseFhevmReturn {
  const { provider, signer, contractAddress, autoInit = true } = options;

  const client = ref<FhevmClient | null>(null);
  const instance = ref<FhevmInstance | null>(null);
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const error = ref<Error | null>(null);

  const init = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress
      });

      await fhevmClient.init();

      client.value = fhevmClient;
      instance.value = fhevmClient.getInstance();
      isInitialized.value = true;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to initialize FHEVM');
      error.value = errorObj;
      console.error('FHEVM initialization error:', errorObj);
    } finally {
      isLoading.value = false;
    }
  };

  if (autoInit) {
    onMounted(() => {
      if (provider && signer && contractAddress) {
        init();
      }
    });
  }

  const encrypt = async (params: { contractAddress: string; callerAddress: string; value: any }) => {
    if (!client.value) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return client.value.encrypt(params);
  };

  const userDecrypt = async (params: { handle: bigint; contractAddress: string; userAddress: string }) => {
    if (!client.value) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return client.value.userDecrypt(params);
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

// Re-export core functionality
export { FhevmClient } from '../client';
export { initFhevm, createFhevmInstance } from '../init';
export type * from '../types';
