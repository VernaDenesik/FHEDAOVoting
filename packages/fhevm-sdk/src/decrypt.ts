/**
 * Decryption utilities for FHEVM
 */

import type { FhevmInstance, DecryptionResult } from './types';

/**
 * Decrypt data using user's signature (EIP-712)
 *
 * @param instance - FHEVM instance
 * @param params - Decryption parameters
 * @returns Decrypted value
 *
 * @example
 * ```typescript
 * const result = await userDecrypt(instance, {
 *   handle: 123n,
 *   contractAddress: '0x...',
 *   userAddress: '0x...',
 *   signature: '0x...'
 * });
 * ```
 */
export async function userDecrypt(
  instance: FhevmInstance,
  params: {
    handle: bigint;
    contractAddress: string;
    userAddress: string;
    signature: string;
  }
): Promise<DecryptionResult> {
  try {
    const publicKey = await instance.getPublicKey(params.contractAddress);

    const decryptedValue = await instance.reencrypt(
      params.handle,
      '', // Private key not needed for user decryption
      publicKey,
      params.signature,
      params.contractAddress,
      params.userAddress
    );

    return {
      value: decryptedValue,
      success: true,
    };
  } catch (error) {
    console.error('User decryption failed:', error);
    return {
      value: 0n,
      success: false,
    };
  }
}

/**
 * Public decryption (no signature required)
 *
 * @param instance - FHEVM instance
 * @param params - Decryption parameters
 * @returns Decrypted value
 *
 * @example
 * ```typescript
 * const result = await publicDecrypt(instance, {
 *   handle: 123n,
 *   contractAddress: '0x...'
 * });
 * ```
 */
export async function publicDecrypt(
  instance: FhevmInstance,
  params: {
    handle: bigint;
    contractAddress: string;
  }
): Promise<DecryptionResult> {
  try {
    const publicKey = await instance.getPublicKey(params.contractAddress);

    const decryptedValue = await instance.reencrypt(
      params.handle,
      '',
      publicKey,
      '',
      params.contractAddress,
      ''
    );

    return {
      value: decryptedValue,
      success: true,
    };
  } catch (error) {
    console.error('Public decryption failed:', error);
    return {
      value: 0n,
      success: false,
    };
  }
}
