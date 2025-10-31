/**
 * FHEVM SDK - Universal SDK for Fully Homomorphic Encryption on EVM
 *
 * Framework-agnostic encryption and decryption utilities for building
 * confidential dApps with FHEVM technology.
 */

export { FhevmClient } from './client';
export { initFhevm, createFhevmInstance } from './init';
export { encryptInput, encryptBool, encryptUint8, encryptUint16, encryptUint32, encryptUint64 } from './encrypt';
export { userDecrypt, publicDecrypt } from './decrypt';
export { generateEIP712Signature } from './eip712';
export * from './types';
export * from './utils';

// React hooks (requires React to be installed)
export { useFhevm } from './hooks/useFhevm';
