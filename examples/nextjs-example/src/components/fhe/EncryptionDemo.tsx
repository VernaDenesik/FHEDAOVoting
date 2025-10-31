'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFHEContext } from './FHEProvider';

export function EncryptionDemo() {
  const { encrypt, isInitialized } = useFHEContext();
  const [value, setValue] = useState('');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleEncrypt = async () => {
    if (!value) {
      setError('Please enter a value');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const numValue = parseInt(value);
      if (isNaN(numValue)) {
        throw new Error('Please enter a valid number');
      }

      const result = await encrypt({ amount: numValue });
      setEncryptedData(JSON.stringify({
        handles: result.handles,
        inputProof: result.inputProof.slice(0, 50) + '...'
      }, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed');
      console.error('Encryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Encryption Demo">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Encrypt a numeric value using FHE. The encrypted data can be used in
            confidential smart contract operations.
          </p>
        </div>

        <Input
          type="number"
          placeholder="Enter a number to encrypt"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!isInitialized || loading}
          error={error}
        />

        <Button
          onClick={handleEncrypt}
          disabled={!isInitialized || loading || !value}
          className="w-full"
        >
          {loading ? 'Encrypting...' : 'Encrypt Value'}
        </Button>

        {encryptedData && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Encrypted Data:
            </h4>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
              {encryptedData}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}
