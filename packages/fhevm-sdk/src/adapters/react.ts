/**
 * React adapter for FHEVM SDK
 * Provides React-specific utilities and components
 */

export { useFhevm } from '../hooks/useFhevm';

// Re-export core functionality
export { FhevmClient } from '../client';
export { initFhevm, createFhevmInstance } from '../init';
export type * from '../types';
