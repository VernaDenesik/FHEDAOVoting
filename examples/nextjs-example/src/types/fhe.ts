/**
 * FHE-related TypeScript types
 */

export interface FHEConfig {
  contractAddress: string;
  networkUrl?: string;
  chainId?: number;
}

export interface EncryptedValue {
  data: Uint8Array;
  proof: string;
  type: string;
}

export interface UserKeys {
  publicKey: string;
  privateKey?: string;
  reencryptionKey: string;
}
