# FHEVM SDK

Universal SDK for building confidential dApps with Fully Homomorphic Encryption on EVM.

## Features

- **Framework Agnostic** - Works with React, Vue, Next.js, Node.js, or any JavaScript environment
- **Simple API** - Wagmi-like interface for easy integration
- **Type Safe** - Full TypeScript support
- **Modular** - Use only what you need
- **Zero Config** - Sensible defaults, easy customization

## Installation

```bash
npm install fhevm-sdk fhevmjs ethers
```

## Quick Start

### Basic Setup (< 10 lines)

```typescript
import { FhevmClient } from 'fhevm-sdk';
import { ethers } from 'ethers';

// Initialize client
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new FhevmClient({
  provider,
  signer,
  contractAddress: '0x...'
});

await client.init();
```

### Encrypt Data

```typescript
const encrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: await signer.getAddress(),
  value: { amount: 100, isActive: true }
});

// Use in contract call
await contract.submitEncrypted(encrypted.handles, encrypted.inputProof);
```

### Decrypt Data

```typescript
// User decryption (requires signature)
const result = await client.userDecrypt({
  handle: 123n,
  contractAddress: '0x...',
  userAddress: await signer.getAddress()
});

console.log('Decrypted value:', result.value);
```

## Framework Examples

### React

```tsx
import { FhevmClient } from 'fhevm-sdk';
import { useEffect, useState } from 'react';

function App() {
  const [client, setClient] = useState<FhevmClient>();

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const fhevmClient = new FhevmClient({
        provider,
        signer,
        contractAddress: '0x...'
      });

      await fhevmClient.init();
      setClient(fhevmClient);
    };

    init();
  }, []);

  return <div>FHEVM App</div>;
}
```

### Vue

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

```javascript
const { FhevmClient } = require('fhevm-sdk');
const { ethers } = require('ethers');

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const signer = new ethers.Wallet('0x...', provider);

const client = new FhevmClient({
  provider,
  signer,
  contractAddress: '0x...'
});

await client.init();
```

## API Reference

### FhevmClient

Main client class for FHEVM operations.

#### Constructor

```typescript
new FhevmClient(config: FhevmConfig)
```

#### Methods

- `init()` - Initialize the client
- `encrypt(params)` - Encrypt input data
- `userDecrypt(params)` - Decrypt with user signature
- `publicDecrypt(params)` - Public decryption
- `getPublicKey(address)` - Get contract public key

### Utility Functions

```typescript
import { encryptBool, encryptUint32, userDecrypt } from 'fhevm-sdk';
```

## Advanced Usage

### Custom Encryption

```typescript
import { initFhevm, encryptUint32 } from 'fhevm-sdk';

const instance = await initFhevm({ provider, contractAddress: '0x...' });
const encrypted = await encryptUint32(instance, '0x...', '0x...', 42);
```

### Manual Signature Generation

```typescript
import { generateEIP712Signature } from 'fhevm-sdk';

const signature = await generateEIP712Signature(
  signer,
  contractAddress,
  userAddress,
  chainId
);
```

## License

MIT
