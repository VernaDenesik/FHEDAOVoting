/**
 * FHEVM initialization utilities
 */

import { createInstance } from 'fhevmjs';
import type { FhevmConfig, FhevmInstance } from './types';

let fhevmInstance: FhevmInstance | null = null;

/**
 * Initialize FHEVM instance
 *
 * @param config - FHEVM configuration
 * @returns Initialized FHEVM instance
 *
 * @example
 * ```typescript
 * const instance = await initFhevm({
 *   provider: ethersProvider,
 *   signer: ethersSigner,
 *   contractAddress: '0x...'
 * });
 * ```
 */
export async function initFhevm(config: FhevmConfig): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  const { chainId } = await config.provider.getNetwork();

  const instance = await createInstance({
    chainId: Number(chainId),
    networkUrl: typeof config.provider === 'string' ? config.provider : undefined,
    gatewayUrl: process.env.GATEWAY_URL || 'https://gateway.zama.ai',
  });

  fhevmInstance = instance as FhevmInstance;
  return fhevmInstance;
}

/**
 * Create a new FHEVM instance (useful for testing or multiple instances)
 *
 * @param config - FHEVM configuration
 * @returns New FHEVM instance
 */
export async function createFhevmInstance(config: FhevmConfig): Promise<FhevmInstance> {
  const { chainId } = await config.provider.getNetwork();

  const instance = await createInstance({
    chainId: Number(chainId),
    networkUrl: typeof config.provider === 'string' ? config.provider : undefined,
    gatewayUrl: process.env.GATEWAY_URL || 'https://gateway.zama.ai',
  });

  return instance as FhevmInstance;
}

/**
 * Get the current FHEVM instance
 *
 * @returns Current FHEVM instance or null if not initialized
 */
export function getFhevmInstance(): FhevmInstance | null {
  return fhevmInstance;
}
