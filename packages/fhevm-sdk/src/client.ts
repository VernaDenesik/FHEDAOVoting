/**
 * FHEVM Client - Main client class for FHEVM operations
 */

import { initFhevm } from './init';
import { encryptInput } from './encrypt';
import { userDecrypt, publicDecrypt } from './decrypt';
import { generateEIP712Signature } from './eip712';
import type { FhevmConfig, FhevmInstance, EncryptedInput, DecryptionResult } from './types';

/**
 * Main FHEVM Client class
 *
 * Provides a simple, wagmi-like interface for FHEVM operations
 */
export class FhevmClient {
  private instance: FhevmInstance | null = null;
  private config: FhevmConfig;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  /**
   * Initialize the FHEVM client
   */
  async init(): Promise<void> {
    this.instance = await initFhevm(this.config);
  }

  /**
   * Get the FHEVM instance
   */
  getInstance(): FhevmInstance {
    if (!this.instance) {
      throw new Error('FHEVM client not initialized. Call init() first.');
    }
    return this.instance;
  }

  /**
   * Encrypt input for a contract call
   *
   * @example
   * ```typescript
   * const encrypted = await client.encrypt({
   *   contractAddress: '0x...',
   *   callerAddress: '0x...',
   *   value: { amount: 100, isActive: true }
   * });
   * ```
   */
  async encrypt(params: {
    contractAddress: string;
    callerAddress: string;
    value: any;
  }): Promise<EncryptedInput> {
    return encryptInput(this.getInstance(), params);
  }

  /**
   * Decrypt data using user's private key (EIP-712 signature required)
   *
   * @example
   * ```typescript
   * const decrypted = await client.userDecrypt({
   *   handle: 123n,
   *   contractAddress: '0x...',
   *   userAddress: '0x...'
   * });
   * ```
   */
  async userDecrypt(params: {
    handle: bigint;
    contractAddress: string;
    userAddress: string;
  }): Promise<DecryptionResult> {
    if (!this.config.signer) {
      throw new Error('Signer required for user decryption');
    }

    const signature = await generateEIP712Signature(
      this.config.signer,
      params.contractAddress,
      params.userAddress,
      Number(this.config.chainId || 31337)
    );

    return userDecrypt(this.getInstance(), {
      ...params,
      signature,
    });
  }

  /**
   * Public decryption (no signature required)
   */
  async publicDecrypt(params: {
    handle: bigint;
    contractAddress: string;
  }): Promise<DecryptionResult> {
    return publicDecrypt(this.getInstance(), params);
  }

  /**
   * Get public key for a contract
   */
  async getPublicKey(contractAddress: string): Promise<string> {
    return this.getInstance().getPublicKey(contractAddress);
  }
}
