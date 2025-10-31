'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFHEContext } from '../fhe/FHEProvider';

export function BankingExample() {
  const { encrypt, isInitialized } = useFHEContext();
  const [balance, setBalance] = useState('1000');
  const [transferAmount, setTransferAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleTransfer = async () => {
    if (!transferAmount || !recipient) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const amount = parseInt(transferAmount);

      // Encrypt the transfer amount
      const encrypted = await encrypt({ amount });

      // In a real application, you would send this to a smart contract
      setResult(`
Transfer prepared:
• Recipient: ${recipient.slice(0, 6)}...${recipient.slice(-4)}
• Amount: ${amount} (encrypted)
• Ready to submit to smart contract
      `);
    } catch (err) {
      console.error('Transfer preparation failed:', err);
      alert('Failed to prepare transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Banking Use Case">
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Private Banking with FHE</strong>
          </p>
          <p className="text-xs text-gray-600">
            Keep account balances and transaction amounts confidential while
            still enabling on-chain verification and compliance.
          </p>
        </div>

        <div className="p-3 bg-gray-50 rounded">
          <label className="text-sm font-medium text-gray-700">
            Current Balance (Encrypted)
          </label>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {balance} tokens
          </p>
        </div>

        <Input
          label="Recipient Address"
          type="text"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          disabled={!isInitialized || loading}
        />

        <Input
          label="Transfer Amount"
          type="number"
          placeholder="Enter amount"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          disabled={!isInitialized || loading}
        />

        <Button
          onClick={handleTransfer}
          disabled={!isInitialized || loading || !transferAmount || !recipient}
          className="w-full"
          variant="primary"
        >
          {loading ? 'Preparing Transfer...' : 'Prepare Encrypted Transfer'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <pre className="text-xs text-blue-900 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>✓ Transaction amounts remain private</p>
          <p>✓ Balances are encrypted on-chain</p>
          <p>✓ Regulatory compliance possible with selective disclosure</p>
        </div>
      </div>
    </Card>
  );
}
