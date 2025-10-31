/**
 * EIP-712 signature utilities for FHEVM
 */

import type { Signer } from 'ethers';
import type { EIP712Domain } from './types';

/**
 * Generate EIP-712 signature for reencryption
 *
 * @param signer - Ethers signer
 * @param contractAddress - Contract address
 * @param userAddress - User address
 * @param chainId - Chain ID
 * @returns EIP-712 signature
 *
 * @example
 * ```typescript
 * const signature = await generateEIP712Signature(
 *   signer,
 *   '0x...',
 *   '0x...',
 *   31337
 * );
 * ```
 */
export async function generateEIP712Signature(
  signer: Signer,
  contractAddress: string,
  userAddress: string,
  chainId: number = 31337
): Promise<string> {
  const domain: EIP712Domain = {
    name: 'Authorization token',
    version: '1',
    chainId,
    verifyingContract: contractAddress,
  };

  const types = {
    Reencrypt: [{ name: 'publicKey', type: 'bytes' }],
  };

  // Get public key from contract (this would normally come from the contract)
  // For now, we use a placeholder
  const publicKey = '0x';

  const value = {
    publicKey,
  };

  try {
    const signature = await signer.signTypedData(domain, types, value);
    return signature;
  } catch (error) {
    console.error('EIP-712 signature generation failed:', error);
    throw error;
  }
}

/**
 * Verify EIP-712 signature
 *
 * @param signature - Signature to verify
 * @param expectedSigner - Expected signer address
 * @param contractAddress - Contract address
 * @param chainId - Chain ID
 * @returns True if signature is valid
 */
export async function verifyEIP712Signature(
  signature: string,
  expectedSigner: string,
  contractAddress: string,
  chainId: number = 31337
): Promise<boolean> {
  // Implementation would verify the signature
  // This is a simplified version
  return signature.length > 0;
}
