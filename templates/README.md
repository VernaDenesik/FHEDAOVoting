# FHEVM SDK Templates

This directory contains starter templates for different frameworks. These templates demonstrate how to integrate the FHEVM SDK into various JavaScript environments.

## Available Templates

### Next.js Template
Location: `../examples/nextjs-example`

A complete Next.js 14 application with App Router demonstrating:
- Client-side encryption and decryption
- React hooks for FHE operations
- API routes for FHE endpoints
- UI components for common use cases
- Banking and medical examples

**Start with:**
```bash
cd ../examples/nextjs-example
npm install
npm run dev
```

### Vue.js Template
Location: `../examples/vue-example`

A Vue 3 application with Composition API showing:
- Reactive FHE client integration
- Encrypted data handling
- Wallet connection
- Real-time encryption/decryption

**Start with:**
```bash
cd ../examples/vue-example
npm install
npm run dev
```

### Node.js Template
Location: `../examples/node-example`

A Node.js CLI application demonstrating:
- Server-side FHE operations
- Multiple data type encryption
- Contract interaction patterns
- Backend integration

**Start with:**
```bash
cd ../examples/node-example
npm install
npm start
```

## Quick Start

1. **Choose a template** based on your framework
2. **Copy the example** to your project directory
3. **Install dependencies**: `npm install`
4. **Configure environment**: Copy `.env.example` to `.env.local` and update values
5. **Start developing**: Run the development server

## Template Structure

Each template includes:
- ✅ Pre-configured FHEVM SDK integration
- ✅ Example components and utilities
- ✅ TypeScript support
- ✅ Environment configuration
- ✅ Development scripts
- ✅ README with setup instructions

## Integration Guide

### Basic Setup (< 10 lines)

```typescript
import { FhevmClient } from 'fhevm-sdk';
import { ethers } from 'ethers';

const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const client = new FhevmClient({
  provider,
  signer,
  contractAddress: 'YOUR_CONTRACT_ADDRESS'
});

await client.init();

// Now ready to encrypt/decrypt!
const encrypted = await client.encrypt({
  contractAddress: 'YOUR_CONTRACT_ADDRESS',
  callerAddress: await signer.getAddress(),
  value: { amount: 100 }
});
```

## Support

For detailed documentation, see:
- [Main README](../README.md)
- [SDK Documentation](../packages/fhevm-sdk/README.md)
- [Quick Start Guide](../QUICKSTART.md)

## License

MIT License - See [LICENSE](../LICENSE) for details
