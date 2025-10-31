# Setup Guide

Complete setup guide for FHEVM Universal SDK.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 7.0.0
- MetaMask or compatible wallet (for browser examples)

## Installation

### Option 1: Use as monorepo

```bash
# Clone the repository
git clone <repository-url>
cd fhevm-react-template

# Install all dependencies
npm install

# Build the SDK
npm run build:sdk
```

### Option 2: Install SDK only

```bash
npm install fhevm-sdk fhevmjs ethers
```

## Quick Start

### 1. Install SDK

```bash
npm install fhevm-sdk fhevmjs ethers
```

### 2. Import and Initialize

```typescript
import { FhevmClient } from 'fhevm-sdk';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new FhevmClient({
  provider,
  signer,
  contractAddress: '0x...'
});

await client.init();
```

### 3. Use in Your App

```typescript
// Encrypt
const encrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: await signer.getAddress(),
  value: { amount: 100 }
});

// Decrypt
const result = await client.userDecrypt({
  handle: 123n,
  contractAddress: '0x...',
  userAddress: await signer.getAddress()
});
```

## Framework-Specific Setup

### React / Next.js

1. Install dependencies:
```bash
npm install fhevm-sdk fhevmjs ethers
```

2. Create a hook:
```typescript
// hooks/useFhevm.ts
import { useState, useEffect } from 'react';
import { FhevmClient } from 'fhevm-sdk';

export function useFhevm(contractAddress: string) {
  const [client, setClient] = useState<FhevmClient>();

  useEffect(() => {
    async function init() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress
      });

      await fhevmClient.init();
      setClient(fhevmClient);
    }

    init();
  }, [contractAddress]);

  return { client };
}
```

3. Use in components:
```typescript
function MyComponent() {
  const { client } = useFhevm('0x...');

  // Use client...
}
```

### Vue.js

1. Install dependencies:
```bash
npm install fhevm-sdk fhevmjs ethers
```

2. Use in components:
```vue
<script setup>
import { ref, onMounted } from 'vue';
import { FhevmClient } from 'fhevm-sdk';

const client = ref(null);

onMounted(async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  client.value = new FhevmClient({
    provider,
    signer,
    contractAddress: '0x...'
  });

  await client.value.init();
});
</script>
```

### Node.js

1. Install dependencies:
```bash
npm install fhevm-sdk fhevmjs ethers
```

2. Use in your script:
```javascript
import { FhevmClient } from 'fhevm-sdk';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = new ethers.Wallet('0x...', provider);

const client = new FhevmClient({
  provider,
  signer,
  contractAddress: '0x...'
});

await client.init();
```

## Running Examples

### Next.js Example

```bash
cd examples/nextjs-example
npm install
npm run dev
```

Open http://localhost:3000

### Vue Example

```bash
cd examples/vue-example
npm install
npm run dev
```

Open http://localhost:5173

### Node.js Example

```bash
cd examples/node-example
npm install
npm start
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Contract address
CONTRACT_ADDRESS=0x...

# Network RPC URL
RPC_URL=http://localhost:8545

# Chain ID
CHAIN_ID=31337

# Gateway URL (optional)
GATEWAY_URL=https://gateway.zama.ai
```

### TypeScript Configuration

Add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

## Troubleshooting

### "Module not found"

Make sure to install all dependencies:
```bash
npm install fhevm-sdk fhevmjs ethers
```

### "window is not defined" (Next.js)

Use dynamic import:
```typescript
const { FhevmClient } = await import('fhevm-sdk');
```

Or check for window:
```typescript
if (typeof window !== 'undefined') {
  // Use FhevmClient
}
```

### "Provider not found"

Make sure MetaMask is installed and connected:
```typescript
if (typeof window !== 'undefined' && window.ethereum) {
  // Initialize provider
}
```

## Next Steps

- [API Reference](./API.md)
- [Examples](../examples/)
- [Best Practices](./BEST_PRACTICES.md)
