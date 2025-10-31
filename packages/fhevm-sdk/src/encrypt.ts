/**
 * Encryption utilities for FHEVM
 */

import type { FhevmInstance, EncryptedInput, EncryptionParams } from './types';

/**
 * Encrypt input data for FHEVM contract calls
 *
 * @param instance - FHEVM instance
 * @param params - Encryption parameters
 * @returns Encrypted input
 *
 * @example
 * ```typescript
 * const encrypted = await encryptInput(instance, {
 *   contractAddress: '0x...',
 *   callerAddress: '0x...',
 *   value: { amount: 100 }
 * });
 * ```
 */
export async function encryptInput(
  instance: FhevmInstance,
  params: EncryptionParams
): Promise<EncryptedInput> {
  const { contractAddress, callerAddress, value } = params;

  const input = instance.createEncryptedInput(contractAddress, callerAddress);

  // Handle different value types
  if (typeof value === 'object' && value !== null) {
    for (const [key, val] of Object.entries(value)) {
      addValueToInput(input, val);
    }
  } else {
    addValueToInput(input, value);
  }

  return input.encrypt();
}

/**
 * Add a value to encrypted input based on its type
 */
function addValueToInput(input: any, value: any): void {
  if (typeof value === 'boolean') {
    input.addBool(value);
  } else if (typeof value === 'number') {
    if (value <= 255) {
      input.addUint8(value);
    } else if (value <= 65535) {
      input.addUint16(value);
    } else {
      input.addUint32(value);
    }
  } else if (typeof value === 'bigint') {
    input.add64(value);
  }
}

/**
 * Encrypt a boolean value
 */
export async function encryptBool(
  instance: FhevmInstance,
  contractAddress: string,
  callerAddress: string,
  value: boolean
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, callerAddress);
  input.addBool(value);
  return input.encrypt();
}

/**
 * Encrypt a uint8 value
 */
export async function encryptUint8(
  instance: FhevmInstance,
  contractAddress: string,
  callerAddress: string,
  value: number
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, callerAddress);
  input.addUint8(value);
  return input.encrypt();
}

/**
 * Encrypt a uint16 value
 */
export async function encryptUint16(
  instance: FhevmInstance,
  contractAddress: string,
  callerAddress: string,
  value: number
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, callerAddress);
  input.addUint16(value);
  return input.encrypt();
}

/**
 * Encrypt a uint32 value
 */
export async function encryptUint32(
  instance: FhevmInstance,
  contractAddress: string,
  callerAddress: string,
  value: number
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, callerAddress);
  input.addUint32(value);
  return input.encrypt();
}

/**
 * Encrypt a uint64 value
 */
export async function encryptUint64(
  instance: FhevmInstance,
  contractAddress: string,
  callerAddress: string,
  value: bigint
): Promise<EncryptedInput> {
  const input = instance.createEncryptedInput(contractAddress, callerAddress);
  input.add64(value);
  return input.encrypt();
}
