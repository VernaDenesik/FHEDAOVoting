'use client';

import { useState, useEffect } from 'react';
import { useFhevm } from '@/hooks/useFhevm';
import ConnectWallet from '@/components/ConnectWallet';
import styles from './page.module.css';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x';

export default function Home() {
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const { client, isInitialized, error, init, encrypt, userDecrypt } = useFhevm(CONTRACT_ADDRESS);

  const [encryptValue, setEncryptValue] = useState('');
  const [encryptedResult, setEncryptedResult] = useState('');
  const [decryptHandle, setDecryptHandle] = useState('');
  const [decryptedResult, setDecryptedResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (connectedAddress && !isInitialized && !error) {
      init();
    }
  }, [connectedAddress, isInitialized, error, init]);

  const handleEncrypt = async () => {
    if (!client) return;

    setLoading(true);
    try {
      const value = parseInt(encryptValue);
      const encrypted = await encrypt({ amount: value });
      setEncryptedResult(JSON.stringify({
        handles: Array.from(encrypted.handles[0] || []),
        proof: encrypted.inputProof.slice(0, 20) + '...'
      }, null, 2));
    } catch (err) {
      console.error('Encryption failed:', err);
      alert('Encryption failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDecrypt = async () => {
    if (!client) return;

    setLoading(true);
    try {
      const handle = BigInt(decryptHandle);
      const result = await userDecrypt(handle);
      setDecryptedResult(result.success ? result.value.toString() : 'Decryption failed');
    } catch (err) {
      console.error('Decryption failed:', err);
      alert('Decryption failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>FHEVM SDK Demo</h1>
        <p>Next.js Example with FHEVM SDK Integration</p>
        <ConnectWallet onConnect={setConnectedAddress} />
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            Error: {error}
          </div>
        )}

        {isInitialized ? (
          <div className={styles.content}>
            <div className={styles.card}>
              <h2>Encrypt Data</h2>
              <div className={styles.form}>
                <input
                  type="number"
                  placeholder="Enter a number to encrypt"
                  value={encryptValue}
                  onChange={(e) => setEncryptValue(e.target.value)}
                  className={styles.input}
                />
                <button
                  onClick={handleEncrypt}
                  disabled={loading || !encryptValue}
                  className={styles.button}
                >
                  {loading ? 'Encrypting...' : 'Encrypt'}
                </button>
              </div>
              {encryptedResult && (
                <pre className={styles.result}>{encryptedResult}</pre>
              )}
            </div>

            <div className={styles.card}>
              <h2>Decrypt Data</h2>
              <div className={styles.form}>
                <input
                  type="text"
                  placeholder="Enter handle to decrypt"
                  value={decryptHandle}
                  onChange={(e) => setDecryptHandle(e.target.value)}
                  className={styles.input}
                />
                <button
                  onClick={handleDecrypt}
                  disabled={loading || !decryptHandle}
                  className={styles.button}
                >
                  {loading ? 'Decrypting...' : 'Decrypt'}
                </button>
              </div>
              {decryptedResult && (
                <div className={styles.result}>
                  <strong>Decrypted Value:</strong> {decryptedResult}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.info}>
            {connectedAddress ? 'Initializing FHEVM...' : 'Please connect your wallet to continue'}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>Powered by FHEVM SDK</p>
      </footer>
    </div>
  );
}
