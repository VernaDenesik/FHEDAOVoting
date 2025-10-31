'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { useFHEContext } from './FHEProvider';

export function KeyManager() {
  const { isInitialized, signer } = useFHEContext();
  const [userAddress, setUserAddress] = React.useState<string>('');

  React.useEffect(() => {
    if (signer) {
      signer.getAddress().then(setUserAddress);
    }
  }, [signer]);

  return (
    <Card title="Key Management">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-4">
            FHE keys are managed automatically by the SDK. The system uses:
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Network Public Key
            </h4>
            <p className="text-xs text-gray-600">
              Retrieved automatically from the FHEVM network for encryption operations
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              User Reencryption Keys
            </h4>
            <p className="text-xs text-gray-600">
              Generated using EIP-712 signatures when you initialize the client
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <h4 className="text-sm font-semibold text-gray-700 mb-1">
              Status
            </h4>
            <p className="text-xs text-gray-600">
              {isInitialized ? (
                <span className="text-green-600 font-semibold">
                  ✓ Keys initialized and ready
                </span>
              ) : (
                <span className="text-orange-600 font-semibold">
                  ⚠ Not initialized
                </span>
              )}
            </p>
          </div>

          {userAddress && (
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Connected Address
              </h4>
              <p className="text-xs text-blue-700 font-mono break-all">
                {userAddress}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
