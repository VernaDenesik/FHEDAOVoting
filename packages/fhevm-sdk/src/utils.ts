/**
 * Utility functions for FHEVM SDK
 */

/**
 * Convert handle to hex string
 */
export function handleToHex(handle: bigint): string {
  return '0x' + handle.toString(16);
}

/**
 * Convert hex string to handle
 */
export function hexToHandle(hex: string): bigint {
  return BigInt(hex);
}

/**
 * Check if value is encrypted
 */
export function isEncrypted(value: any): boolean {
  return value && typeof value === 'object' && 'handles' in value && 'inputProof' in value;
}

/**
 * Format decrypted value based on type
 */
export function formatDecryptedValue(value: bigint, type: 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64'): any {
  switch (type) {
    case 'bool':
      return value !== 0n;
    case 'uint8':
    case 'uint16':
    case 'uint32':
      return Number(value);
    case 'uint64':
      return value;
    default:
      return value;
  }
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate chain ID
 */
export function isValidChainId(chainId: number): boolean {
  return Number.isInteger(chainId) && chainId > 0;
}

/**
 * Create error with context
 */
export class FhevmError extends Error {
  constructor(message: string, public context?: any) {
    super(message);
    this.name = 'FhevmError';
  }
}
