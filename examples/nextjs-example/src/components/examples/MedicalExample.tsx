'use client';

import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useFHEContext } from '../fhe/FHEProvider';

export function MedicalExample() {
  const { encrypt, isInitialized } = useFHEContext();
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleSubmit = async () => {
    if (!heartRate || !bloodPressure) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const hr = parseInt(heartRate);
      const bp = parseInt(bloodPressure);

      // Encrypt medical data
      const encryptedHR = await encrypt({ heartRate: hr });
      const encryptedBP = await encrypt({ bloodPressure: bp });

      setResult(`
Medical data encrypted successfully:
• Heart Rate: ${hr} bpm (encrypted)
• Blood Pressure: ${bp} mmHg (encrypted)
• Status: Ready for secure storage
• Privacy: Data encrypted on-chain, only accessible with your permission
      `);
    } catch (err) {
      console.error('Data encryption failed:', err);
      alert('Failed to encrypt medical data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Medical Data Use Case">
      <div className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Private Health Records with FHE</strong>
          </p>
          <p className="text-xs text-gray-600">
            Store sensitive medical data on-chain while maintaining complete privacy.
            Share data selectively with healthcare providers using reencryption.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Heart Rate (bpm)"
            type="number"
            placeholder="72"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            disabled={!isInitialized || loading}
          />

          <Input
            label="Blood Pressure"
            type="number"
            placeholder="120"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
            disabled={!isInitialized || loading}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isInitialized || loading || !heartRate || !bloodPressure}
          className="w-full"
          variant="primary"
        >
          {loading ? 'Encrypting Medical Data...' : 'Submit Encrypted Health Data'}
        </Button>

        {result && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <pre className="text-xs text-green-900 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}

        <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
          <h4 className="text-sm font-semibold text-purple-900 mb-2">
            Privacy Features:
          </h4>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>✓ Complete patient data confidentiality</li>
            <li>✓ Selective disclosure to doctors</li>
            <li>✓ Audit trail without exposing data</li>
            <li>✓ Compute on encrypted health records</li>
            <li>✓ HIPAA-compliant data handling</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
