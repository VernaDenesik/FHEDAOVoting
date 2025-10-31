/**
 * Type definitions for FHE operations
 */

export interface EncryptedData {
  handles: Uint8Array[];
  inputProof: string;
}

export interface DecryptionResult {
  success: boolean;
  value?: any;
  error?: string;
}

export interface FHEOperation {
  type: 'encrypt' | 'decrypt' | 'compute';
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export type EncryptionType = 'bool' | 'uint8' | 'uint16' | 'uint32' | 'uint64' | 'uint128' | 'uint256';

export interface EncryptOptions {
  contractAddress: string;
  callerAddress: string;
  value: any;
  type?: EncryptionType;
}

export interface DecryptOptions {
  handle: bigint;
  contractAddress: string;
  userAddress: string;
}
