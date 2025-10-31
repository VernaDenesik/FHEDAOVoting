/**
 * Client-side FHE operations
 * Handles encryption and decryption on the client
 */

import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider, Signer } from 'ethers';

export interface FHEClientConfig {
  provider: BrowserProvider;
  signer: Signer;
  contractAddress: string;
}

export async function createFHEClient(config: FHEClientConfig): Promise<FhevmClient> {
  const client = new FhevmClient(config);
  await client.init();
  return client;
}

export async function encryptData(
  client: FhevmClient,
  contractAddress: string,
  callerAddress: string,
  value: any
) {
  return client.encrypt({
    contractAddress,
    callerAddress,
    value,
  });
}

export async function decryptData(
  client: FhevmClient,
  handle: bigint,
  contractAddress: string,
  userAddress: string
) {
  return client.userDecrypt({
    handle,
    contractAddress,
    userAddress,
  });
}
