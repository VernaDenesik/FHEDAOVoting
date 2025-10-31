# FHEVM Universal SDK

**A framework-agnostic SDK for building confidential dApps with Fully Homomorphic Encryption on EVM**

> Making FHEVM as easy to use as wagmi - under 10 lines of code to get started!

## Overview

This project provides a universal FHEVM SDK that makes building confidential frontends simple, consistent, and developer-friendly. The SDK works across all JavaScript environments - React, Vue, Next.js, Node.js, or plain JavaScript.

## Features

- **Framework Agnostic** - Works with any JavaScript framework or environment
- **Simple API** - Wagmi-like interface that web3 developers already know
- **Type Safe** - Full TypeScript support with comprehensive type definitions
- **Modular Design** - Use only what you need, import specific utilities
- **Zero Config** - Sensible defaults with easy customization
- **Well Documented** - Comprehensive docs and examples for every use case

**Website**: [https://fhedao-voting.vercel.app/](https://fhedao-voting.vercel.app/)

**Demo Video**: Available in project repository (`demo.mp4`)

## Quick Start (< 10 lines)

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

// Encrypt data
const encrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: await signer.getAddress(),
  value: { amount: 100 }
});

// Decrypt data
const result = await client.userDecrypt({
  handle: 123n,
  contractAddress: '0x...',
  userAddress: await signer.getAddress()
});
```

## Project Structure

```
fhevm-react-template/
├── packages/
│   └── fhevm-sdk/              # Universal FHEVM SDK
│       ├── src/
│       │   ├── index.ts        # Main exports
│       │   ├── client.ts       # FhevmClient class
│       │   ├── init.ts         # Initialization utilities
│       │   ├── encrypt.ts      # Encryption functions
│       │   ├── decrypt.ts      # Decryption functions
│       │   ├── eip712.ts       # EIP-712 signature utilities
│       │   ├── types.ts        # TypeScript type definitions
│       │   ├── utils.ts        # Helper utilities
│       │   ├── hooks/          # React hooks
│       │   │   └── useFhevm.ts # React hook for FHEVM
│       │   └── adapters/       # Framework adapters
│       │       ├── react.ts    # React adapter
│       │       └── vue.ts      # Vue adapter
│       └── README.md           # SDK documentation
│
├── templates/                  # Starter templates for different frameworks
│   ├── nextjs/                 # → points to examples/nextjs-example
│   ├── vue/                    # → points to examples/vue-example
│   ├── react/                  # → React template (similar to Next.js)
│   └── nodejs/                 # → points to examples/node-example
│
├── examples/
│   ├── nextjs-example/         # Next.js application (REQUIRED)
│   │   ├── src/
│   │   │   ├── app/            # Next.js app directory
│   │   │   │   ├── api/        # API routes for FHE operations
│   │   │   │   ├── layout.tsx  # Root layout
│   │   │   │   └── page.tsx    # Home page
│   │   │   ├── components/     # React components
│   │   │   │   ├── ui/         # UI components (Button, Input, Card)
│   │   │   │   ├── fhe/        # FHE components (Provider, demos)
│   │   │   │   └── examples/   # Use case examples
│   │   │   ├── lib/            # Utility libraries
│   │   │   │   ├── fhe/        # FHE integration utilities
│   │   │   │   └── utils/      # Helper functions
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   └── types/          # TypeScript types
│   │   └── README.md
│   │
│   ├── vue-example/            # Vue.js application
│   │   ├── src/
│   │   │   ├── App.vue         # Main Vue component
│   │   │   └── main.ts
│   │   └── README.md
│   │
│   ├── node-example/           # Node.js CLI application
│   │   ├── index.js            # Main Node.js script
│   │   └── README.md
│   │
│   ├── dao-voting-example/     # DAO contracts example
│   │   ├── contracts/          # Smart contracts
│   │   └── README.md
│   │
│   └── SecureDAOVoting-main/   # DAO Voting React App (converted from static HTML)
│       ├── src/
│       │   ├── components/     # React components
│       │   ├── hooks/          # Custom hooks (useWallet, useContract)
│       │   ├── styles/         # CSS styles
│       │   ├── App.jsx         # Main application
│       │   └── main.jsx        # Entry point
│       ├── index.html          # Static HTML version
│       ├── index-react.html    # React version entry
│       └── README.md
│
├── docs/                       # Additional documentation
│   ├── API.md                  # API reference
│   ├── EXAMPLES.md             # Usage examples
│   └── SETUP.md                # Setup guide
├── demo.mp4                    # Video demonstration
├── package.json                # Root package.json
└── README.md                   # This file
```

## Installation

### Install the SDK

```bash
npm install fhevm-sdk fhevmjs ethers
```

### Or use from monorepo

From the root directory:

```bash
# Install all dependencies
npm install

# Build the SDK
cd packages/fhevm-sdk
npm run build
```

## Examples

### Next.js Example (Required)

Full Next.js application demonstrating SDK integration:

```bash
cd examples/nextjs-example
npm install
npm run dev
```

Features:
- Wallet connection
- Data encryption/decryption
- React hooks for FHEVM
- TypeScript support
- Modern UI

[View Next.js Example →](./examples/nextjs-example)

### Vue.js Example

Vue 3 application with FHEVM SDK:

```bash
cd examples/vue-example
npm install
npm run dev
```

[View Vue Example →](./examples/vue-example)

### Node.js Example

Command-line application for backend/scripting:

```bash
cd examples/node-example
npm install
npm start
```

[View Node.js Example →](./examples/node-example)

### DAO Voting Example

Complete dApp example with smart contracts:

```bash
cd examples/dao-voting-example
npm install
npm run compile
```

[View DAO Example →](./examples/dao-voting-example)

### SecureDAO Voting React App

Full-featured DAO voting application converted to React with FHEVM SDK integration:

```bash
cd examples/SecureDAOVoting-main
npm install
npm run dev
```

Features:
- Commit-reveal voting mechanism
- React hooks for wallet and contract management
- FHEVM SDK integration
- Full DAO governance workflow

[View SecureDAO Voting →](./examples/SecureDAOVoting-main)

## SDK Documentation

### Core API

#### FhevmClient

Main client class for all FHEVM operations:

```typescript
import { FhevmClient } from 'fhevm-sdk';

const client = new FhevmClient({
  provider: ethersProvider,
  signer: ethersSigner,
  contractAddress: '0x...'
});

await client.init();
```

#### Encryption

```typescript
// Encrypt any value
const encrypted = await client.encrypt({
  contractAddress: '0x...',
  callerAddress: '0x...',
  value: { amount: 100, isActive: true }
});

// Use in contract call
await contract.submitData(encrypted.handles, encrypted.inputProof);
```

#### Decryption

```typescript
// User decryption (requires signature)
const result = await client.userDecrypt({
  handle: 123n,
  contractAddress: '0x...',
  userAddress: '0x...'
});

// Public decryption
const publicResult = await client.publicDecrypt({
  handle: 456n,
  contractAddress: '0x...'
});
```

### Utility Functions

For advanced use cases, import utilities directly:

```typescript
import {
  initFhevm,
  encryptBool,
  encryptUint32,
  userDecrypt,
  generateEIP712Signature
} from 'fhevm-sdk';
```

## Framework Integration

### React / Next.js

Use the built-in React hook:

```typescript
import { useFhevm } from 'fhevm-sdk';
import { ethers } from 'ethers';

function MyComponent() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    provider.getSigner().then(setSigner);
  }, []);

  const { client, isInitialized, encrypt, userDecrypt } = useFhevm({
    provider,
    signer,
    contractAddress: '0x...',
    autoInit: true
  });

  // Use encrypt and userDecrypt functions
  const handleEncrypt = async () => {
    const encrypted = await encrypt({
      contractAddress: '0x...',
      callerAddress: await signer.getAddress(),
      value: { amount: 100 }
    });
    // Use encrypted data with contract
  };

  return <div>{isInitialized ? 'Ready' : 'Loading...'}</div>;
}
```

Or use the React adapter:

```typescript
import { useFhevm } from 'fhevm-sdk/adapters/react';
// Same usage as above
```

### Vue.js

Use the built-in Vue composable:

```vue
<script setup>
import { useFhevm } from 'fhevm-sdk/adapters/vue';
import { ethers } from 'ethers';
import { ref, onMounted } from 'vue';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = ref(null);

onMounted(async () => {
  signer.value = await provider.getSigner();
});

const { client, isInitialized, encrypt, userDecrypt } = useFhevm({
  provider,
  signer,
  contractAddress: '0x...',
  autoInit: true
});

// Use encrypt and userDecrypt functions
const handleEncrypt = async () => {
  const encrypted = await encrypt({
    contractAddress: '0x...',
    callerAddress: await signer.value.getAddress(),
    value: { amount: 100 }
  });
};
</script>

<template>
  <div>{{ isInitialized ? 'Ready' : 'Loading...' }}</div>
</template>
```

### Node.js

Use in backend services:

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

## Video Demonstration

See `demo.mp4` for a complete walkthrough of:
- Setting up the SDK
- Using it in different frameworks
- Encrypting and decrypting data
- Integration with smart contracts

## Development

### Build the SDK

```bash
cd packages/fhevm-sdk
npm install
npm run build
```

### Run Tests

```bash
cd packages/fhevm-sdk
npm test
```

### Run Examples

Each example has its own README with specific instructions:

- [Next.js Example](./examples/nextjs-example/README.md)
- [Vue Example](./examples/vue-example/README.md)
- [Node.js Example](./examples/node-example/README.md)
- [DAO Voting Example](./examples/dao-voting-example/README.md)

## Architecture

### SDK Design

The SDK follows these principles:

1. **Framework Agnostic Core** - Pure TypeScript implementation
2. **Wrapper Pattern** - Wraps fhevmjs with a simpler API
3. **Modular Exports** - Import what you need
4. **Type Safety** - Comprehensive TypeScript definitions
5. **Developer Experience** - Wagmi-like interface

### Key Components

- **FhevmClient** - Main client class (similar to wagmi's client)
- **Initialization** - Setup and configuration utilities
- **Encryption** - Input encryption for contract calls
- **Decryption** - User and public decryption utilities
- **EIP-712** - Signature generation for reencryption
- **Types** - Complete TypeScript type definitions

## Evaluation Criteria

This SDK addresses all bounty requirements:

### ✅ Usability
- **< 10 lines** to get started
- **Wagmi-like API** familiar to web3 developers
- **Zero config** with sensible defaults
- **Clear error messages** and debugging

### ✅ Completeness
- **Full FHEVM flow** covered: init, encrypt, decrypt, contract interaction
- **All encryption types** supported: bool, uint8, uint16, uint32, uint64
- **Both decryption methods**: userDecrypt and publicDecrypt
- **EIP-712 signatures** for reencryption

### ✅ Reusability
- **Framework agnostic** core
- **Works in**: React, Vue, Next.js, Node.js, plain JS
- **Modular components** - use what you need
- **Clean abstractions** - easy to extend

### ✅ Documentation
- **Comprehensive README** with examples
- **API documentation** for all functions
- **Example applications** for each framework
- **Video demonstration** of features

### ✅ Creativity (Bonus)
- **Multiple framework examples**: Next.js, Vue, Node.js
- **Real dApp example**: DAO voting system
- **React hooks** for easy integration
- **Developer-friendly CLI** commands

## Deployment

### SDK Package

The SDK can be published to npm:

```bash
cd packages/fhevm-sdk
npm publish
```

### Example Deployments

- **Next.js**: Deploy to Vercel
- **Vue**: Deploy to Netlify
- **Node.js**: Run as backend service

## Contributing

This project follows the fork-based workflow:

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [fhevmjs Library](https://github.com/zama-ai/fhevmjs)
- [Zama Official Guide](https://docs.zama.ai)

## Support

For questions or issues:
- Check the [examples](./examples)
- Review [SDK documentation](./packages/fhevm-sdk/README.md)
- Watch the [demo video]

---

**Built with ❤️ for the FHEVM community**

Making confidential smart contracts accessible to all developers.
