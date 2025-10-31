# Next.js FHEVM SDK Example

A comprehensive Next.js 14 application demonstrating the complete integration of the FHEVM SDK for building confidential dApps with Fully Homomorphic Encryption.

## Features

- ✅ **Complete FHE Integration** - Full encryption, decryption, and computation workflows
- ✅ **Modern Next.js 14** - Uses App Router with server and client components
- ✅ **React Hooks** - Custom hooks for FHE operations (`useFhevm`, `useEncryption`, `useComputation`)
- ✅ **API Routes** - RESTful endpoints for FHE operations
- ✅ **UI Components** - Reusable components for common FHE tasks
- ✅ **Real-world Examples** - Banking and medical use case demonstrations
- ✅ **TypeScript** - Full type safety throughout the application
- ✅ **Responsive Design** - Mobile-friendly interface with Tailwind CSS

## Project Structure

```
nextjs-example/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API Routes
│   │   │   ├── fhe/
│   │   │   │   ├── route.ts      # Main FHE API
│   │   │   │   ├── encrypt/      # Encryption endpoint
│   │   │   │   ├── decrypt/      # Decryption endpoint
│   │   │   │   └── compute/      # Computation endpoint
│   │   │   └── keys/route.ts     # Key management API
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Home page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── ui/                   # Base UI Components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   ├── fhe/                  # FHE-specific Components
│   │   │   ├── FHEProvider.tsx   # Context provider
│   │   │   ├── EncryptionDemo.tsx
│   │   │   ├── ComputationDemo.tsx
│   │   │   └── KeyManager.tsx
│   │   └── examples/             # Use Case Examples
│   │       ├── BankingExample.tsx
│   │       └── MedicalExample.tsx
│   │
│   ├── lib/                      # Utility Libraries
│   │   ├── fhe/
│   │   │   ├── client.ts         # Client-side FHE ops
│   │   │   ├── server.ts         # Server-side FHE ops
│   │   │   ├── keys.ts           # Key management
│   │   │   └── types.ts          # FHE types
│   │   └── utils/
│   │       ├── security.ts       # Security utilities
│   │       └── validation.ts     # Validation functions
│   │
│   ├── hooks/                    # Custom React Hooks
│   │   ├── useFhevm.ts           # Main FHE hook
│   │   ├── useEncryption.ts      # Encryption hook
│   │   └── useComputation.ts     # Computation hook
│   │
│   └── types/                    # TypeScript Definitions
│       ├── fhe.ts                # FHE types
│       └── api.ts                # API types
│
├── public/                       # Static assets
├── .env.local.example            # Environment template
├── next.config.js                # Next.js configuration
├── package.json
├── tsconfig.json
└── README.md                     # This file
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

1. **Install dependencies:**
   ```bash
   cd examples/nextjs-example
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
   NEXT_PUBLIC_NETWORK_URL=http://localhost:8545
   NEXT_PUBLIC_CHAIN_ID=31337
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Core Components

### FHEProvider

Context provider that manages FHEVM client state across the application:

```tsx
import { FHEProvider } from '@/components/fhe/FHEProvider';

function App() {
  return (
    <FHEProvider contractAddress="0x...">
      {/* Your app */}
    </FHEProvider>
  );
}
```

### useFhevm Hook

Main hook for accessing FHE functionality:

```tsx
import { useFhevm } from '@/hooks/useFhevm';

function MyComponent() {
  const { client, encrypt, userDecrypt, isInitialized } = useFhevm(contractAddress);

  // Use FHE operations
}
```

### useEncryption Hook

Simplified encryption operations:

```tsx
import { useEncryption } from '@/hooks/useEncryption';

function EncryptComponent() {
  const { encryptValue, loading, error, result } = useEncryption();

  const handleEncrypt = async () => {
    const encrypted = await encryptValue({ amount: 100 });
  };
}
```

### useComputation Hook

Handle decryption and computation results:

```tsx
import { useComputation } from '@/hooks/useComputation';

function DecryptComponent() {
  const { decrypt, loading, result } = useComputation();

  const handleDecrypt = async (handle: bigint) => {
    const decrypted = await decrypt(handle, false); // false = user decrypt
  };
}
```

## API Routes

### POST /api/fhe/encrypt

Encrypt data (client-side recommended):

```typescript
const response = await fetch('/api/fhe/encrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ value: 42, type: 'uint32' })
});
```

### POST /api/fhe/decrypt

Decrypt data:

```typescript
const response = await fetch('/api/fhe/decrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    handle: '123',
    contractAddress: '0x...',
    userAddress: '0x...'
  })
});
```

### POST /api/fhe/compute

Information about homomorphic operations:

```typescript
const response = await fetch('/api/fhe/compute', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'add',
    operands: [handle1, handle2]
  })
});
```

### GET /api/keys

Get key management information:

```typescript
const response = await fetch('/api/keys');
const keyInfo = await response.json();
```

## Use Case Examples

### Banking Example

Demonstrates private financial transactions:

```tsx
import { BankingExample } from '@/components/examples/BankingExample';

function Page() {
  return <BankingExample />;
}
```

Features:
- Encrypted balance management
- Private transfer amounts
- Confidential transaction history
- Compliance-ready with selective disclosure

### Medical Example

Shows private health record management:

```tsx
import { MedicalExample } from '@/components/examples/MedicalExample';

function Page() {
  return <MedicalExample />;
}
```

Features:
- Encrypted health data storage
- Selective data sharing with providers
- Privacy-preserving analytics
- HIPAA-compliant data handling

## Development

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Customization

### Adding New FHE Operations

1. Create a new component in `src/components/fhe/`
2. Use the `useFHEContext` hook to access the client
3. Implement your encryption/decryption logic
4. Add to the main page

Example:

```tsx
'use client';

import { useFHEContext } from '@/components/fhe/FHEProvider';
import { Card } from '@/components/ui/Card';

export function MyCustomDemo() {
  const { encrypt, userDecrypt, isInitialized } = useFHEContext();

  // Your custom logic here

  return (
    <Card title="My Custom FHE Demo">
      {/* Your UI */}
    </Card>
  );
}
```

### Adding New API Endpoints

Create a new route in `src/app/api/`:

```typescript
// src/app/api/my-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Your logic here

  return NextResponse.json({ success: true });
}
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app is a standard Next.js application and can be deployed to:
- Netlify
- AWS Amplify
- Docker
- Self-hosted

## Troubleshooting

### MetaMask Not Detected

Ensure MetaMask is installed and enabled for the site.

### Initialization Fails

Check that:
- Contract address is correct
- Network is accessible
- Wallet is connected

### Encryption Errors

Verify:
- Client is initialized
- Value format is correct
- User has signed the initialization request

## Resources

- [FHEVM Documentation](https://docs.zama.ai/fhevm)
- [SDK Documentation](../../packages/fhevm-sdk/README.md)
- [Main README](../../README.md)
- [API Reference](../../docs/API.md)

## License

MIT License - See [LICENSE](../../LICENSE)

## Support

For issues and questions:
- Check the [examples documentation](../../docs/EXAMPLES.md)
- Review the [setup guide](../../docs/SETUP.md)
- Open an issue on GitHub

---

**Built with the FHEVM SDK** - Making confidential smart contracts accessible to all developers.
