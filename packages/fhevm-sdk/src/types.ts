/**
 * Type definitions for FHEVM SDK
 */

import type { Provider, Signer } from 'ethers';

/**
 * FHEVM Configuration
 */
export interface FhevmConfig {
  provider: Provider;
  signer?: Signer;
  contractAddress: string;
  chainId?: number;
  publicKey?: string;
}

/**
 * Encrypted input structure
 */
export interface EncryptedInput {
  handles: Uint8Array[];
  inputProof: string;
}

/**
 * Encryption parameters
 */
export interface EncryptionParams {
  contractAddress: string;
  callerAddress: string;
  value?: any;
}

/**
 * Decryption result
 */
export interface DecryptionResult {
  value: bigint | boolean | number;
  success: boolean;
}

/**
 * EIP-712 Domain
 */
export interface EIP712Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

/**
 * Reencryption request
 */
export interface ReencryptRequest {
  handle: bigint;
  contractAddress: string;
  userAddress: string;
}

/**
 * FHEVM Instance type
 */
export interface FhevmInstance {
  createEncryptedInput(contractAddress: string, callerAddress: string): EncryptedInputBuilder;
  getPublicKey(contractAddress: string): Promise<string>;
  reencrypt(
    handle: bigint,
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddress: string,
    userAddress: string
  ): Promise<bigint>;
}

/**
 * Encrypted input builder
 */
export interface EncryptedInputBuilder {
  addBool(value: boolean): EncryptedInputBuilder;
  addUint8(value: number): EncryptedInputBuilder;
  addUint16(value: number): EncryptedInputBuilder;
  addUint32(value: number): EncryptedInputBuilder;
  addUint64(value: bigint): EncryptedInputBuilder;
  add64(value: bigint): EncryptedInputBuilder;
  encrypt(): EncryptedInput;
}
