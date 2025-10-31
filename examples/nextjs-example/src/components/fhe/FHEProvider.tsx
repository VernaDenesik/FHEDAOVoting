'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider, Signer } from 'ethers';

interface FHEContextType {
  client: FhevmClient | null;
  isInitialized: boolean;
  error: string | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  contractAddress: string;
  init: () => Promise<void>;
  encrypt: (value: any) => Promise<any>;
  userDecrypt: (handle: bigint) => Promise<any>;
  publicDecrypt: (handle: bigint) => Promise<any>;
}

const FHEContext = createContext<FHEContextType | undefined>(undefined);

export function FHEProvider({
  children,
  contractAddress
}: {
  children: ReactNode;
  contractAddress: string;
}) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  const init = async () => {
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
      const message = err instanceof Error ? err.message : 'Failed to initialize FHE';
      setError(message);
      console.error('FHE initialization error:', err);
    }
  };

  const encrypt = async (value: any) => {
    if (!client || !signer) {
      throw new Error('FHE not initialized');
    }

    const callerAddress = await signer.getAddress();
    return client.encrypt({
      contractAddress,
      callerAddress,
      value,
    });
  };

  const userDecrypt = async (handle: bigint) => {
    if (!client || !signer) {
      throw new Error('FHE not initialized');
    }

    const userAddress = await signer.getAddress();
    return client.userDecrypt({
      handle,
      contractAddress,
      userAddress,
    });
  };

  const publicDecrypt = async (handle: bigint) => {
    if (!client) {
      throw new Error('FHE not initialized');
    }

    return client.publicDecrypt({
      handle,
      contractAddress,
    });
  };

  const value: FHEContextType = {
    client,
    isInitialized,
    error,
    provider,
    signer,
    contractAddress,
    init,
    encrypt,
    userDecrypt,
    publicDecrypt,
  };

  return <FHEContext.Provider value={value}>{children}</FHEContext.Provider>;
}

export function useFHEContext() {
  const context = useContext(FHEContext);
  if (context === undefined) {
    throw new Error('useFHEContext must be used within FHEProvider');
  }
  return context;
}
