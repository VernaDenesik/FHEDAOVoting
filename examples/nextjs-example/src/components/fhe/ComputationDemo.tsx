'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFHEContext } from './FHEProvider';

export function ComputationDemo() {
  const { userDecrypt, isInitialized } = useFHEContext();
  const [handle, setHandle] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDecrypt = async () => {
    if (!handle) {
      setError('Please enter a handle');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');

    try {
      const handleBigInt = BigInt(handle);
      const decrypted = await userDecrypt(handleBigInt);

      if (decrypted.success) {
        setResult(`Decrypted value: ${decrypted.value}`);
      } else {
        setError('Decryption failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed');
      console.error('Decryption error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Computation & Decryption Demo">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Decrypt a value from the blockchain using its handle. This requires
            your signature to prove ownership.
          </p>
        </div>

        <Input
          type="text"
          placeholder="Enter encrypted data handle"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          disabled={!isInitialized || loading}
          error={error}
        />

        <Button
          onClick={handleDecrypt}
          disabled={!isInitialized || loading || !handle}
          className="w-full"
          variant="secondary"
        >
          {loading ? 'Decrypting...' : 'Decrypt Value'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-green-800 font-semibold">{result}</p>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Supported Operations:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Addition, Subtraction, Multiplication, Division</li>
            <li>• Logical operations (AND, OR, XOR, NOT)</li>
            <li>• Comparison (eq, ne, gt, lt, gte, lte)</li>
            <li>• Min, Max, Negation, Bit shifts</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
