'use client';

import { useState, useEffect } from 'react';
import { FHEProvider } from '@/components/fhe/FHEProvider';
import { EncryptionDemo } from '@/components/fhe/EncryptionDemo';
import { ComputationDemo } from '@/components/fhe/ComputationDemo';
import { KeyManager } from '@/components/fhe/KeyManager';
import { BankingExample } from '@/components/examples/BankingExample';
import { MedicalExample } from '@/components/examples/MedicalExample';
import ConnectWallet from '@/components/ConnectWallet';
import { Button } from '@/components/ui/Button';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

function HomeContent() {
  const [connectedAddress, setConnectedAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'demos' | 'examples'>('demos');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">FHEVM SDK</h1>
              <p className="text-blue-100">Next.js Integration Demo</p>
            </div>
            <ConnectWallet onConnect={setConnectedAddress} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {connectedAddress ? (
          <>
            {/* Info Banner */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Welcome to FHEVM SDK Demo
              </h2>
              <p className="text-gray-600 mb-4">
                This demo showcases the complete functionality of the FHEVM SDK for building
                confidential dApps with Fully Homomorphic Encryption on EVM chains.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-semibold">Connected:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}
                </code>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 flex gap-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('demos')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'demos'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Core Features
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'examples'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Use Case Examples
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'demos' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EncryptionDemo />
                <ComputationDemo />
                <KeyManager />
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">
                    SDK Features
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Framework-agnostic core - works with any JavaScript environment</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Simple API - under 10 lines to get started</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Full TypeScript support with comprehensive type definitions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Automatic key management with EIP-712 signatures</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Support for all FHE types: bool, uint8-256</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Built-in encryption and decryption utilities</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BankingExample />
                <MedicalExample />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                  Connect Your Wallet to Get Started
                </h2>
                <p className="text-gray-600 mb-8">
                  To use the FHEVM SDK features, please connect your MetaMask wallet.
                  This demo will showcase encryption, decryption, and confidential computations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-8 text-left">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  What you'll experience:
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 text-xl">🔐</span>
                    <div>
                      <strong>Data Encryption:</strong> Encrypt sensitive data client-side before sending to blockchain
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 text-xl">🔓</span>
                    <div>
                      <strong>Secure Decryption:</strong> Decrypt your data using EIP-712 signatures
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 text-xl">🔢</span>
                    <div>
                      <strong>Homomorphic Computation:</strong> Perform calculations on encrypted data
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-3 text-xl">💼</span>
                    <div>
                      <strong>Real-world Examples:</strong> Banking and medical use cases
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">Powered by FHEVM SDK</p>
          <p className="text-sm text-gray-400">
            Making confidential smart contracts accessible to all developers
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <FHEProvider contractAddress={CONTRACT_ADDRESS}>
      <HomeContent />
    </FHEProvider>
  );
}
