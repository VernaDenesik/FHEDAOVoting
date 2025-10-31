/**
 * React hook for FHEVM SDK
 */

import { useState, useEffect, useCallback } from 'react';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider, Signer } from 'ethers';

export function useFhevm(contractAddress: string) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const init = useCallback(async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        throw new Error('Please install MetaMask');
      }

      const ethProvider = new BrowserProvider((window as any).ethereum);
      const ethSigner = await ethProvider.getSigner();

      setProvider(ethProvider);
      setSigner(ethSigner);

      const fhevmClient = new FhevmClient({
        provider: ethProvider,
        signer: ethSigner,
        contractAddress,
      });

      await fhevmClient.init();

      setClient(fhevmClient);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to initialize FHEVM';
      setError(message);
      console.error('FHEVM initialization error:', err);
    }
  }, [contractAddress]);

  const encrypt = useCallback(
    async (value: any) => {
      if (!client || !signer) {
        throw new Error('FHEVM not initialized');
      }

      const callerAddress = await signer.getAddress();
      return client.encrypt({
        contractAddress,
        callerAddress,
        value,
      });
    },
    [client, signer, contractAddress]
  );

  const userDecrypt = useCallback(
    async (handle: bigint) => {
      if (!client || !signer) {
        throw new Error('FHEVM not initialized');
      }

      const userAddress = await signer.getAddress();
      return client.userDecrypt({
        handle,
        contractAddress,
        userAddress,
      });
    },
    [client, signer, contractAddress]
  );

  const publicDecrypt = useCallback(
    async (handle: bigint) => {
      if (!client) {
        throw new Error('FHEVM not initialized');
      }

      return client.publicDecrypt({
        handle,
        contractAddress,
      });
    },
    [client, contractAddress]
  );

  return {
    client,
    provider,
    signer,
    isInitialized,
    error,
    init,
    encrypt,
    userDecrypt,
    publicDecrypt,
  };
}
