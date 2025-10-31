'use client';

import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

export default function ConnectWallet({ onConnect }: { onConnect: (address: string) => void }) {
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const provider = new BrowserProvider((window as any).ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const addr = accounts[0].address;
          setAddress(addr);
          onConnect(addr);
        }
      } catch (err) {
        console.error('Failed to check connection:', err);
      }
    }
  };

  const connect = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert('Please install MetaMask');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setAddress(addr);
      onConnect(addr);
    } catch (err) {
      console.error('Failed to connect:', err);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (address) {
    return (
      <div className="wallet-connected">
        <span>Connected: {address.slice(0, 6)}...{address.slice(-4)}</span>
      </div>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting} className="connect-button">
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
