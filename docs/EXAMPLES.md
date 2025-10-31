# Examples Guide

This document provides detailed examples of using FHEVM SDK in different scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [React Integration](#react-integration)
- [Next.js Integration](#nextjs-integration)
- [Vue Integration](#vue-integration)
- [Node.js Integration](#nodejs-integration)
- [Smart Contract Integration](#smart-contract-integration)

## Basic Usage

### Simple Encryption/Decryption

```typescript
import { FhevmClient } from 'fhevm-sdk';
import { ethers } from 'ethers';

async function example() {
  // Setup
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Initialize client
  const client = new FhevmClient({
    provider,
    signer,
    contractAddress: '0x...'
  });

  await client.init();

  // Encrypt a number
  const encrypted = await client.encrypt({
    contractAddress: '0x...',
    callerAddress: address,
    value: 42
  });

  console.log('Encrypted:', encrypted);

  // Decrypt (assuming you have a handle)
  const result = await client.userDecrypt({
    handle: 123n,
    contractAddress: '0x...',
    userAddress: address
  });

  console.log('Decrypted:', result.value);
}
```

### Encrypting Different Types

```typescript
// Boolean
const boolEncrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: address,
  value: true
});

// Small number (uint8)
const smallNumber = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: address,
  value: 255
});

// Large number (uint64)
const largeNumber = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: address,
  value: 1000000n
});

// Multiple values
const multiple = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: address,
  value: {
    amount: 100,
    isActive: true,
    count: 50n
  }
});
```

## React Integration

### Custom Hook

```typescript
// hooks/useFhevm.ts
import { useState, useEffect, useCallback } from 'react';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider, Signer } from 'ethers';

export function useFhevm(contractAddress: string) {
  const [client, setClient] = useState<FhevmClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const init = useCallback(async () => {
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress,
      });

      await fhevmClient.init();
      setClient(fhevmClient);
      setIsInitialized(true);
    } catch (err) {
      setError(err.message);
    }
  }, [contractAddress]);

  useEffect(() => {
    init();
  }, [init]);

  return { client, isInitialized, error };
}
```

### Component Usage

```typescript
import { useFhevm } from './hooks/useFhevm';
import { useState } from 'react';

function MyComponent() {
  const { client, isInitialized, error } = useFhevm('0x...');
  const [value, setValue] = useState('');
  const [encrypted, setEncrypted] = useState('');

  const handleEncrypt = async () => {
    if (!client) return;

    const signer = client.getSigner();
    const address = await signer.getAddress();

    const result = await client.encrypt({
      contractAddress: '0x...',
      callerAddress: address,
      value: parseInt(value)
    });

    setEncrypted(JSON.stringify(result));
  };

  if (error) return <div>Error: {error}</div>;
  if (!isInitialized) return <div>Loading...</div>;

  return (
    <div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={handleEncrypt}>Encrypt</button>
      {encrypted && <pre>{encrypted}</pre>}
    </div>
  );
}
```

## Next.js Integration

### App Router (app/)

```typescript
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider } from 'ethers';

export default function Home() {
  const [client, setClient] = useState<FhevmClient>();

  useEffect(() => {
    async function init() {
      if (typeof window === 'undefined') return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
      });

      await fhevmClient.init();
      setClient(fhevmClient);
    }

    init();
  }, []);

  return <div>FHEVM App</div>;
}
```

### Pages Router (pages/)

```typescript
// pages/index.tsx
import { useState, useEffect } from 'react';
import { FhevmClient } from 'fhevm-sdk';

export default function Home() {
  const [client, setClient] = useState<FhevmClient>();

  useEffect(() => {
    // Same as app router
  }, []);

  return <div>FHEVM App</div>;
}
```

## Vue Integration

### Composition API

```vue
<script setup>
import { ref, onMounted, computed } from 'vue';
import { FhevmClient } from 'fhevm-sdk';
import { BrowserProvider } from 'ethers';

const client = ref(null);
const isInitialized = ref(false);
const error = ref(null);

onMounted(async () => {
  try {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const fhevmClient = new FhevmClient({
      provider,
      signer,
      contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS
    });

    await fhevmClient.init();
    client.value = fhevmClient;
    isInitialized.value = true;
  } catch (err) {
    error.value = err.message;
  }
});

const encrypt = async (value) => {
  if (!client.value) return;

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return client.value.encrypt({
    contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS,
    callerAddress: address,
    value
  });
};
</script>

<template>
  <div v-if="isInitialized">
    <!-- Your UI -->
  </div>
</template>
```

### Options API

```vue
<script>
import { FhevmClient } from 'fhevm-sdk';

export default {
  data() {
    return {
      client: null,
      isInitialized: false
    };
  },
  async mounted() {
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    this.client = new FhevmClient({
      provider,
      signer,
      contractAddress: process.env.VUE_APP_CONTRACT_ADDRESS
    });

    await this.client.init();
    this.isInitialized = true;
  }
};
</script>
```

## Node.js Integration

### Basic Script

```javascript
import { FhevmClient } from 'fhevm-sdk';
import { JsonRpcProvider, Wallet } from 'ethers';

async function main() {
  const provider = new JsonRpcProvider('http://localhost:8545');
  const signer = new Wallet('0x...', provider);

  const client = new FhevmClient({
    provider,
    signer,
    contractAddress: '0x...'
  });

  await client.init();

  // Use client
  const encrypted = await client.encrypt({
    contractAddress: '0x...',
    callerAddress: await signer.getAddress(),
    value: 42
  });

  console.log('Encrypted:', encrypted);
}

main();
```

### With Environment Variables

```javascript
import { FhevmClient } from 'fhevm-sdk';
import { JsonRpcProvider, Wallet } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const signer = new Wallet(process.env.PRIVATE_KEY, provider);

  const client = new FhevmClient({
    provider,
    signer,
    contractAddress: process.env.CONTRACT_ADDRESS
  });

  await client.init();
  // Use client...
}
```

## Smart Contract Integration

### Solidity Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract SecureStorage {
    mapping(address => euint32) private balances;

    function setBalance(bytes calldata encryptedBalance, bytes calldata proof) external {
        // Verify and store encrypted balance
        euint32 balance = TFHE.asEuint32(encryptedBalance, proof);
        balances[msg.sender] = balance;
    }

    function getBalance() external view returns (euint32) {
        return balances[msg.sender];
    }
}
```

### Frontend Integration

```typescript
import { FhevmClient } from 'fhevm-sdk';
import { Contract, BrowserProvider } from 'ethers';

async function setBalance(amount: number) {
  // Setup
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  // Initialize FHEVM
  const client = new FhevmClient({
    provider,
    signer,
    contractAddress: '0x...'
  });

  await client.init();

  // Encrypt the amount
  const encrypted = await client.encrypt({
    contractAddress: '0x...',
    callerAddress: address,
    value: amount
  });

  // Call contract
  const contract = new Contract('0x...', ABI, signer);
  const tx = await contract.setBalance(
    encrypted.handles[0],
    encrypted.inputProof
  );

  await tx.wait();
}

async function getBalance() {
  // Get encrypted handle from contract
  const contract = new Contract('0x...', ABI, signer);
  const handle = await contract.getBalance();

  // Decrypt
  const client = new FhevmClient({...});
  await client.init();

  const result = await client.userDecrypt({
    handle,
    contractAddress: '0x...',
    userAddress: address
  });

  return result.value;
}
```

## Advanced Examples

See the [examples](../examples/) directory for complete applications:

- [Next.js Example](../examples/nextjs-example/) - Full Next.js app
- [Vue Example](../examples/vue-example/) - Vue 3 application
- [Node.js Example](../examples/node-example/) - CLI application
- [DAO Voting Example](../examples/dao-voting-example/) - Complete dApp
